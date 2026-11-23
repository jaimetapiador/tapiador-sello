// Configuración pública de la app web de Firebase (no es secreta: la protegen las reglas, las funciones
// y las restricciones de la clave en Google Cloud). Sin measurementId: no se usa Analytics (sin cookies).
export const firebaseConfig = {
  apiKey: "AIzaSyCSAswUHhYz_BGPrTAN4mCra0QxsMYQjYk",
  authDomain: "sello-tapiador.firebaseapp.com",
  projectId: "sello-tapiador",
  storageBucket: "sello-tapiador.firebasestorage.app",
  messagingSenderId: "423901928713",
  appId: "1:423901928713:web:05f59e33fe0069a27547d8",
};

/** Región de las Cloud Functions (junto a Firestore eur3). */
export const FUNCTIONS_REGION = "europe-west1";
