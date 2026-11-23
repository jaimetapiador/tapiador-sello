// SDK de Firebase. Este módulo se carga de forma diferida (ver firebase.ts) para que no retrase el
// primer pintado: comprobar un documento no lo necesita. Solo Authentication y Functions: el navegador
// nunca accede a Firestore (las reglas lo deniegan todo).
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { FUNCTIONS_REGION, firebaseConfig } from "./firebase-config.ts";
import type { MySeal, SealResponse } from "./firebase.ts";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const functions = getFunctions(app, FUNCTIONS_REGION);

/** En desarrollo, `VITE_EMULATORS=1 npm run dev` usa los emuladores locales de Auth y Functions. */
if (import.meta.env.DEV && import.meta.env.VITE_EMULATORS === "1") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export const callSeal = httpsCallable<{ hash: string }, SealResponse>(functions, "seal");
export const callMySeals = httpsCallable<void, { seals: MySeal[] }>(functions, "mySeals");
export const callDeleteMyData = httpsCallable<void, { deleted: number }>(functions, "deleteMyData");

export {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  onIdTokenChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
