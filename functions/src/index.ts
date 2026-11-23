import {
  AlreadySealedError,
  DEFAULT_NETWORK,
  createReader,
  normalizeHash,
  submitSeal,
} from "@sello/core";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { logger } from "firebase-functions";
import { HttpsError, onCall, type CallableOptions, type CallableRequest } from "firebase-functions/v2/https";
import { defineInt, defineSecret, defineString } from "firebase-functions/params";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

initializeApp();
const db = getFirestore();

// Una sola instancia que atiende una petición cada vez: los sellos salen de una única cuenta y así
// no hay dos transacciones compitiendo por el mismo nonce. También pone techo al coste.
setGlobalOptions({ region: "europe-west1", maxInstances: 1, concurrency: 1, memory: "256MiB", timeoutSeconds: 60 });

const SELLO_PRIVATE_KEY = defineSecret("SELLO_PRIVATE_KEY");
const RPC_URL = defineString("SELLO_RPC_URL", { default: DEFAULT_NETWORK.rpcUrl });
const USER_DAILY_LIMIT = defineInt("SELLO_USER_DAILY_LIMIT", { default: 5 });
const GLOBAL_DAILY_LIMIT = defineInt("SELLO_GLOBAL_DAILY_LIMIT", { default: 200 });

/** Solo estas páginas pueden llamar a las funciones. */
const CORS: CallableOptions["cors"] = [
  "https://sello.tapiador.eu",
  "https://sello-tapiador.web.app",
  "https://sello-tapiador.firebaseapp.com",
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
];

const network = DEFAULT_NETWORK;
const today = () => new Date().toISOString().slice(0, 10); // día en UTC

/** Exige sesión; devuelve el uid. */
function requireUser(request: CallableRequest): string {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Hace falta iniciar sesión.");
  return uid;
}

/**
 * Sella una huella con la cuenta de la demo. Exige correo verificado y respeta dos cuotas diarias:
 * por usuario y global. Devuelve la transacción sin esperar a la confirmación (la espera el navegador).
 *
 * Firestore (solo lo usan estas funciones; las reglas niegan todo acceso desde el navegador):
 *   seals/{huella}   uid, transaction, network, createdAt
 *   usage/{uid}      day, count        (sellos del usuario en el día)
 *   stats/{día}      count             (sellos de todos en el día)
 */
export const seal = onCall({ cors: CORS, secrets: [SELLO_PRIVATE_KEY] }, async (request) => {
  const uid = requireUser(request);
  // Se consulta la cuenta en Authentication en vez de fiarse solo del token: así una cuenta borrada
  // no puede sellar con un token aún vigente, y un correo recién verificado vale sin renovar la sesión.
  const account = await getAuth()
    .getUser(uid)
    .catch(() => null);
  if (!account || account.disabled) throw new HttpsError("unauthenticated", "La cuenta no existe o está desactivada.");
  if (!account.emailVerified) {
    throw new HttpsError("failed-precondition", "El correo no está verificado.", { reason: "email-not-verified" });
  }

  const data = request.data as { hash?: unknown } | undefined;
  const hash = typeof data?.hash === "string" ? normalizeHash(data.hash) : null;
  if (!hash) throw new HttpsError("invalid-argument", "La huella no es una SHA-256 válida.");

  const day = today();
  const usageRef = db.doc(`usage/${uid}`);
  const statsRef = db.doc(`stats/${day}`);
  const [usage, stats] = await Promise.all([usageRef.get(), statsRef.get()]);
  const userCount = usage.get("day") === day ? (usage.get("count") as number) : 0;
  const globalCount = (stats.get("count") as number | undefined) ?? 0;

  const userLimit = USER_DAILY_LIMIT.value();
  if (userCount >= userLimit) {
    throw new HttpsError("resource-exhausted", "Cuota diaria del usuario agotada.", { reason: "user-quota", limit: userLimit });
  }
  if (globalCount >= GLOBAL_DAILY_LIMIT.value()) {
    throw new HttpsError("resource-exhausted", "Cuota diaria global agotada.", { reason: "global-quota" });
  }

  const signer = privateKeyToAccount(SELLO_PRIVATE_KEY.value().trim() as `0x${string}`);
  const wallet = createWalletClient({ account: signer, chain: network.chain, transport: http(RPC_URL.value()) });
  const reader = createReader(network, RPC_URL.value());

  let transaction: `0x${string}`;
  try {
    transaction = await submitSeal(wallet, reader, network, hash);
  } catch (error) {
    if (error instanceof AlreadySealedError) {
      throw new HttpsError("already-exists", "La huella ya estaba sellada.", {
        sealedAt: error.sealedAt?.toISOString() ?? null,
      });
    }
    logger.error("Fallo al enviar el sello", { uid, hash, error: String(error) });
    throw new HttpsError("internal", "No se ha podido enviar la transacción.");
  }

  // Solo cuenta para la cuota lo que de verdad se ha enviado.
  const batch = db.batch();
  batch.set(db.doc(`seals/${hash}`), { uid, transaction, network: network.id, createdAt: FieldValue.serverTimestamp() });
  batch.set(usageRef, { day, count: userCount + 1 });
  batch.set(statsRef, { count: FieldValue.increment(1) }, { merge: true });
  await batch.commit();

  logger.info("Sello enviado", { uid, hash, transaction });
  return { transaction };
});

/** Sellos hechos por el usuario desde esta web (los más recientes primero). */
export const mySeals = onCall({ cors: CORS }, async (request) => {
  const uid = requireUser(request);
  const snapshot = await db.collection("seals").where("uid", "==", uid).limit(500).get();
  const seals = snapshot.docs
    .map((doc) => ({
      hash: doc.id,
      transaction: doc.get("transaction") as string,
      network: doc.get("network") as string,
      createdAt: (doc.get("createdAt")?.toDate?.() as Date | undefined)?.toISOString() ?? new Date(0).toISOString(),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { seals };
});

/**
 * Borra la cuenta y todo lo que la relaciona con sus sellos. Los sellos siguen en la cadena: son
 * públicos, no contienen datos del usuario y no se pueden borrar.
 */
export const deleteMyData = onCall({ cors: CORS }, async (request) => {
  const uid = requireUser(request);
  const snapshot = await db.collection("seals").where("uid", "==", uid).get();
  const batch = db.batch();
  for (const doc of snapshot.docs) batch.delete(doc.ref);
  batch.delete(db.doc(`usage/${uid}`));
  await batch.commit();
  await getAuth().deleteUser(uid);
  logger.info("Cuenta borrada", { uid, seals: snapshot.size });
  return { deleted: snapshot.size };
});
