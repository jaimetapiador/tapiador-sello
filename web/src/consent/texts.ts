import type { ConsentCategory, VendorId } from "@sello/core/consent";
import type { Locale } from "../i18n.tsx";

// Textos del aviso, del panel y de la tabla de cookies, en español e inglés (skill
// consentimiento-cookies, adaptada). La tabla describe TODO lo que se guarda en el navegador:
// si se añade un proveedor o una cookie, se añade aquí (y en config.ts).

export interface CategoryText {
  title: string;
  summary: string;
}

export type CookieStorage = "cookie" | "localStorage" | "sessionStorage" | "indexedDB";

export interface CookieRow {
  name: string;
  vendor: VendorId;
  storage: CookieStorage;
  purpose: string;
  duration: string;
}

export interface ConsentTexts {
  policyPath: string;
  bannerTitle: string;
  bannerBody: string;
  acceptAll: string;
  rejectAll: string;
  configure: string;
  save: string;
  close: string;
  alwaysActive: string;
  preferencesTitle: string;
  preferencesBody: string;
  moreInfo: string;
  cookiePolicy: string;
  consentIdLabel: string;
  settingsLink: string;
  noneActive: string;
  table: { name: string; vendor: string; purpose: string; type: string; duration: string };
  storage: Record<CookieStorage, string>;
  categories: Record<ConsentCategory, CategoryText>;
  vendors: Record<VendorId, { name: string; privacyUrl?: string }>;
  rows: CookieRow[];
}

const GOOGLE_COOKIES = "https://policies.google.com/technologies/cookies";
const FIREBASE_PRIVACY = "https://firebase.google.com/support/privacy";

const es: ConsentTexts = {
  policyPath: "/privacidad/#cookies",
  bannerTitle: "Tú decides sobre las cookies",
  bannerBody:
    "Sello documental solo usa lo imprescindible para funcionar. Con tu permiso, añadiríamos Google Analytics para saber, de forma agregada, qué páginas se visitan. Puedes cambiar tu decisión cuando quieras desde el pie de página.",
  acceptAll: "Aceptar todas",
  rejectAll: "Rechazar todas",
  configure: "Configurar",
  save: "Guardar preferencias",
  close: "Cerrar",
  alwaysActive: "Siempre activas",
  preferencesTitle: "Preferencias de cookies",
  preferencesBody:
    "Elige qué categorías quieres permitir. Las necesarias están siempre activas porque sin ellas el sitio no funciona.",
  moreInfo: "Más información en la",
  cookiePolicy: "política de cookies",
  consentIdLabel: "ID de tu consentimiento:",
  settingsLink: "Preferencias de cookies",
  noneActive: "Ahora mismo no usamos ninguna cookie de esta categoría.",
  table: { name: "Nombre", vendor: "Proveedor", purpose: "Finalidad", type: "Tipo", duration: "Duración" },
  storage: {
    cookie: "Cookie propia",
    localStorage: "Almacenamiento local",
    sessionStorage: "Almacenamiento de sesión",
    indexedDB: "Almacenamiento local (IndexedDB)",
  },
  categories: {
    necessary: {
      title: "Necesarias",
      summary:
        "Imprescindibles para que el sitio funcione: recordar tu decisión sobre cookies y, si entras para sellar, mantener tu sesión. No se pueden desactivar y no requieren tu permiso.",
    },
    analytics: {
      title: "Analíticas",
      summary:
        "Google Analytics nos dice, de forma agregada, qué páginas se visitan y desde dónde, para mejorar el demostrador. No se carga hasta que la aceptas.",
    },
  },
  vendors: {
    "first-party": { name: "Sello documental" },
    "firebase-auth": { name: "Firebase Authentication (Google)", privacyUrl: FIREBASE_PRIVACY },
    "google-analytics": { name: "Google Analytics", privacyUrl: GOOGLE_COOKIES },
  },
  rows: [
    {
      name: "sello_consent",
      vendor: "first-party",
      storage: "cookie",
      purpose:
        "Recuerda qué categorías has aceptado o rechazado, con un identificador aleatorio de tu decisión que no te identifica.",
      duration: "6 meses",
    },
    {
      name: "firebaseLocalStorageDb",
      vendor: "firebase-auth",
      storage: "indexedDB",
      purpose: "Mantiene tu sesión iniciada para que puedas sellar. Solo se crea si entras con tu cuenta.",
      duration: "Hasta que cierres la sesión",
    },
    {
      name: "firebase-heartbeat-database",
      vendor: "firebase-auth",
      storage: "indexedDB",
      purpose:
        "Registro técnico del SDK de Firebase (versión de las librerías y fecha de uso) que acompaña a las peticiones del servicio de cuentas.",
      duration: "Persistente (se renueva con el uso)",
    },
    {
      name: "_ga",
      vendor: "google-analytics",
      storage: "cookie",
      purpose: "Distingue visitas de forma seudónima para contar usuarios y sesiones.",
      duration: "6 meses",
    },
    {
      name: "_ga_BBHSTC0MR1",
      vendor: "google-analytics",
      storage: "cookie",
      purpose: "Mantiene el estado de la sesión de medición.",
      duration: "6 meses",
    },
  ],
};

const en: ConsentTexts = {
  policyPath: "/en/privacy/#cookies",
  bannerTitle: "You decide about cookies",
  bannerBody:
    "Document seal only uses what it needs to work. With your permission, we would add Google Analytics to learn, in aggregate, which pages are visited. You can change your decision at any time from the footer.",
  acceptAll: "Accept all",
  rejectAll: "Reject all",
  configure: "Settings",
  save: "Save preferences",
  close: "Close",
  alwaysActive: "Always active",
  preferencesTitle: "Cookie preferences",
  preferencesBody:
    "Choose which categories you allow. Necessary ones are always active because the site does not work without them.",
  moreInfo: "More information in the",
  cookiePolicy: "cookie policy",
  consentIdLabel: "Your consent ID:",
  settingsLink: "Cookie preferences",
  noneActive: "We do not currently use any cookies in this category.",
  table: { name: "Name", vendor: "Provider", purpose: "Purpose", type: "Type", duration: "Duration" },
  storage: {
    cookie: "First-party cookie",
    localStorage: "Local storage",
    sessionStorage: "Session storage",
    indexedDB: "Local storage (IndexedDB)",
  },
  categories: {
    necessary: {
      title: "Necessary",
      summary:
        "Essential for the site to work: remembering your cookie choice and, if you sign in to seal, keeping your session. They cannot be switched off and do not require your permission.",
    },
    analytics: {
      title: "Analytics",
      summary:
        "Google Analytics tells us, in aggregate, which pages are visited and from where, so we can improve the demo. It is not loaded until you accept it.",
    },
  },
  vendors: {
    "first-party": { name: "Document seal" },
    "firebase-auth": { name: "Firebase Authentication (Google)", privacyUrl: FIREBASE_PRIVACY },
    "google-analytics": { name: "Google Analytics", privacyUrl: GOOGLE_COOKIES },
  },
  rows: [
    {
      name: "sello_consent",
      vendor: "first-party",
      storage: "cookie",
      purpose:
        "Remembers which categories you accepted or rejected, with a random identifier for your decision that does not identify you.",
      duration: "6 months",
    },
    {
      name: "firebaseLocalStorageDb",
      vendor: "firebase-auth",
      storage: "indexedDB",
      purpose: "Keeps you signed in so you can seal. Only created if you sign in.",
      duration: "Until you sign out",
    },
    {
      name: "firebase-heartbeat-database",
      vendor: "firebase-auth",
      storage: "indexedDB",
      purpose:
        "Technical record of the Firebase SDK (library versions and date of use) sent with requests to the account service.",
      duration: "Persistent (renewed with use)",
    },
    {
      name: "_ga",
      vendor: "google-analytics",
      storage: "cookie",
      purpose: "Distinguishes visits pseudonymously to count users and sessions.",
      duration: "6 months",
    },
    {
      name: "_ga_BBHSTC0MR1",
      vendor: "google-analytics",
      storage: "cookie",
      purpose: "Keeps the state of the measurement session.",
      duration: "6 months",
    },
  ],
};

export const CONSENT_TEXTS: Record<Locale, ConsentTexts> = { es, en };
