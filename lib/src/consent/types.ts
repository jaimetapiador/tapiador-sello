/**
 * Estado del consentimiento de cookies. Módulo PURO (sin `window`, sin
 * framework): lo usan el cliente, el servidor y los tests.
 *
 * Plantilla de la skill consentimiento-cookies.
 */

import { consentConfig } from "./config.ts";
import { vendorSignature } from "./vendors.ts";

type CategoryDef = (typeof consentConfig.categories)[number];
export type ConsentCategory = CategoryDef["id"];
/** Categorías que el visitante puede activar/desactivar. */
export type OptionalCategory = Extract<CategoryDef, { locked: false }>["id"];

export const CONSENT_CATEGORIES: readonly ConsentCategory[] =
  consentConfig.categories.map((c) => c.id);

export const OPTIONAL_CATEGORIES = consentConfig.categories
  .filter((c) => !c.locked)
  .map((c) => c.id) as OptionalCategory[];

export type ConsentChoices = Record<ConsentCategory, boolean>;
export type OptionalChoices = Record<OptionalCategory, boolean>;

export type ConsentState = {
  /** `null` mientras no hay decisión: hay que mostrar el aviso. */
  decidedAt: string | null;
  /** Versión de la política/proveedores vigente al decidir. */
  version: string;
  /**
   * Identificador aleatorio de la decisión. No identifica a la persona. Se
   * conserva al cambiar de opinión y enlaza la cookie con el registro.
   */
  consentId: string | null;
  choices: ConsentChoices;
};

/** Revisión manual + firma de proveedores opcionales activos. */
export const CONSENT_VERSION = `${consentConfig.revision}-${vendorSignature()}`;
export const CONSENT_COOKIE = consentConfig.cookieName;
export const CONSENT_COOKIE_MAX_AGE = consentConfig.maxAgeDays * 24 * 60 * 60;

function choicesFrom(partial: Partial<OptionalChoices>): ConsentChoices {
  const choices = {} as ConsentChoices;
  for (const c of consentConfig.categories) {
    choices[c.id] = c.locked
      ? true
      : Boolean(partial[c.id as OptionalCategory]);
  }
  return choices;
}

export const NO_CONSENT: ConsentState = {
  decidedAt: null,
  version: CONSENT_VERSION,
  consentId: null,
  choices: choicesFrom({}),
};

/** 16 bytes aleatorios en hex. `getRandomValues` no exige contexto seguro. */
export function newConsentId(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

type BuildOptions = { now?: Date; consentId?: string | null };

export function withChoices(
  partial: Partial<OptionalChoices>,
  { now = new Date(), consentId }: BuildOptions = {},
): ConsentState {
  return {
    decidedAt: now.toISOString(),
    version: CONSENT_VERSION,
    consentId: consentId || newConsentId(),
    choices: choicesFrom(partial),
  };
}

const all = (value: boolean) =>
  Object.fromEntries(OPTIONAL_CATEGORIES.map((c) => [c, value])) as OptionalChoices;

export function acceptAll(options?: BuildOptions): ConsentState {
  return withChoices(all(true), options);
}

export function rejectAll(options?: BuildOptions): ConsentState {
  return withChoices(all(false), options);
}

export const CONSENT_OUTCOMES = ["accepted", "rejected", "partial"] as const;
export type ConsentOutcome = (typeof CONSENT_OUTCOMES)[number];

/** Aceptar todo / rechazar todo / personalizar. */
export function classifyChoices(choices: Partial<OptionalChoices>): ConsentOutcome {
  const granted = OPTIONAL_CATEGORIES.filter((c) => choices[c]).length;
  if (granted === OPTIONAL_CATEGORIES.length) return "accepted";
  return granted === 0 ? "rejected" : "partial";
}

/** Categorías que pasan de permitidas a denegadas (hay que limpiar). */
export function revokedCategories(
  previous: ConsentState,
  next: ConsentState,
): OptionalCategory[] {
  return OPTIONAL_CATEGORIES.filter(
    (c) => previous.choices[c] && !next.choices[c],
  );
}

export function optionalChoices(state: ConsentState): OptionalChoices {
  return Object.fromEntries(
    OPTIONAL_CATEGORIES.map((c) => [c, state.choices[c]]),
  ) as OptionalChoices;
}

/**
 * Valor de cookie compacto:
 * `v{versión}.{decidido 0|1}.{un flag por categoría opcional}.{consentId}.{ISO}`
 * La fecha va al final porque contiene puntos.
 */
export function encodeConsent(state: ConsentState): string {
  const flags = OPTIONAL_CATEGORIES.map((c) => (state.choices[c] ? "1" : "0")).join("");
  return `v${state.version}.${state.decidedAt ? "1" : "0"}.${flags}.${
    state.consentId ?? ""
  }.${state.decidedAt ?? ""}`;
}

/** Cookie ausente, corrupta o de otra versión → `NO_CONSENT` (se vuelve a preguntar). */
export function decodeConsent(raw: string | undefined | null): ConsentState {
  if (!raw) return NO_CONSENT;
  const n = OPTIONAL_CATEGORIES.length;
  const match = new RegExp(
    `^v([\\w-]+)\\.([01])\\.([01]{${n}})\\.([0-9a-f]*)\\.(.*)$`,
  ).exec(decodeURIComponent(raw.trim()));
  if (!match) return NO_CONSENT;
  const [, version, decidedStr, flags = "", consentId, iso] = match;
  if (version !== CONSENT_VERSION) return NO_CONSENT;
  const decided = decidedStr === "1";
  const partial = Object.fromEntries(
    OPTIONAL_CATEGORIES.map((c, i) => [c, decided && flags[i] === "1"]),
  ) as OptionalChoices;
  return {
    decidedAt: decided ? iso || new Date(0).toISOString() : null,
    version: version!,
    consentId: consentId || null,
    choices: choicesFrom(partial),
  };
}

export function needsBanner(state: ConsentState): boolean {
  return state.decidedAt === null || state.version !== CONSENT_VERSION;
}
