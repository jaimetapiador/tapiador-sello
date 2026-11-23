import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, onAuthStateChanged, onIdTokenChanged, type User } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { FUNCTIONS_REGION, firebaseConfig } from "./firebase-config.ts";

// Solo Authentication y Functions: el navegador nunca accede a Firestore (las reglas lo deniegan todo).
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const functions = getFunctions(app, FUNCTIONS_REGION);

/** En desarrollo, `VITE_EMULATORS=1 npm run dev` usa los emuladores locales de Auth y Functions. */
if (import.meta.env.DEV && import.meta.env.VITE_EMULATORS === "1") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export interface SealResponse {
  transaction: `0x${string}`;
}
export interface MySeal {
  hash: `0x${string}`;
  transaction: `0x${string}`;
  network: string;
  createdAt: string;
}

export const callSeal = httpsCallable<{ hash: string }, SealResponse>(functions, "seal");
export const callMySeals = httpsCallable<void, { seals: MySeal[] }>(functions, "mySeals");
export const callDeleteMyData = httpsCallable<void, { deleted: number }>(functions, "deleteMyData");

/** Límite de sellos por usuario y día (debe coincidir con USER_DAILY_LIMIT de las funciones). */
export const USER_DAILY_LIMIT = 5;

/**
 * Usuario actual; `undefined` mientras Firebase decide si hay sesión.
 * Firebase actualiza el mismo objeto User al recargarlo (p. ej., tras verificar el correo), así que
 * además de la sesión se escuchan los cambios de token y se fuerza el repintado.
 */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [, setTick] = useState(0);
  useEffect(() => {
    const offAuth = onAuthStateChanged(auth, setUser);
    const offToken = onIdTokenChanged(auth, () => setTick((n) => n + 1));
    return () => {
      offAuth();
      offToken();
    };
  }, []);
  return user;
}
