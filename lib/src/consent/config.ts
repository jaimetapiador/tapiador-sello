/**
 * Configuración del gestor de consentimiento de cookies del sello (plantilla de la skill
 * consentimiento-cookies, adaptada). Es el ÚNICO sitio que hay que tocar para cambiar categorías,
 * proveedores, cookie o caducidad.
 *
 * Regla de oro: nada de una categoría opcional (ni script, ni cookie, ni petición a terceros) se
 * carga sin un `true` explícito del visitante.
 */
export const consentConfig = {
  /** Cookie NECESARIA que guarda la decisión. Figura en la política. */
  cookieName: "sello_consent",

  /** Caducidad de la decisión: 6 meses (la AEPD recomienda no superar 24). */
  maxAgeDays: 180,

  /** Súbela al cambiar textos o finalidades: invalida las decisiones y vuelve a preguntar. */
  revision: 1,

  /** Sin publicidad: solo necesarias y analíticas. */
  categories: [
    { id: "necessary", locked: true },
    { id: "analytics", locked: false },
  ],

  /**
   * Proveedores que dejan cookies o almacenamiento. Cambiar el conjunto de proveedores opcionales
   * activos cambia la versión y vuelve a pedir consentimiento.
   */
  vendors: [
    // Propio: la cookie de consentimiento.
    { id: "first-party", category: "necessary", enabled: true, cookiePrefixes: [] },
    // Firebase Authentication: sesión en IndexedDB, solo si el visitante entra para sellar.
    { id: "firebase-auth", category: "necessary", enabled: true, cookiePrefixes: [] },
    { id: "google-analytics", category: "analytics", enabled: true, cookiePrefixes: ["_ga"] },
  ],

  /** Identificadores públicos de las etiquetas. */
  tags: {
    googleAnalytics: "G-BBHSTC0MR1",
  },

  /** Registro de decisiones (prueba del art. 7.1 RGPD). Reescrito en Hosting a una función. */
  endpoint: "/api/consent" as string | null,

  /** Zona horaria para agrupar las estadísticas por día. */
  timeZone: "Europe/Madrid",

  /** Conservación de cada registro: 3 años (prescripción de infracciones muy graves de la LSSI). */
  logRetentionDays: 365 * 3,
} as const;

export type ConsentConfig = typeof consentConfig;
