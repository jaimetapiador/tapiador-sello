/**
 * Eventos que el navegador envía al endpoint de registro (`sendBeacon`).
 * Validación a mano (sin Zod) para no añadir dependencias. Puro.
 *
 * Nunca se guarda IP, user agent completo ni id de usuario: solo el
 * `consentId` aleatorio, la decisión y datos gruesos (dispositivo, ruta).
 *
 * Plantilla de la skill consentimiento-cookies.
 */

import { consentConfig } from "./config.ts";
import { OPTIONAL_CATEGORIES, type OptionalChoices } from "./types.ts";

export type ConsentImpressionEvent = { type: "impression"; path: string };
export type ConsentDecisionEvent = {
  type: "decision";
  path: string;
  consentId: string;
  version: string;
  choices: OptionalChoices;
  /** Dónde se decidió: aviso inicial o panel de preferencias. */
  ui: "banner" | "panel";
  /** Sustituye a una decisión anterior válida. */
  isChange: boolean;
};
export type ConsentEvent = ConsentImpressionEvent | ConsentDecisionEvent;

/** Ruta sin query ni fragmento (podrían llevar datos personales). */
function cleanPath(value: unknown): string {
  return typeof value === "string" &&
    value.length <= 200 &&
    /^\/[^?#\s]*$/.test(value)
    ? value
    : "/";
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** Devuelve el evento validado o `null`. */
export function parseConsentEvent(input: unknown): ConsentEvent | null {
  if (!isObject(input)) return null;
  const path = cleanPath(input.path);

  if (input.type === "impression") return { type: "impression", path };
  if (input.type !== "decision") return null;

  const { consentId, version, choices, ui, isChange } = input;
  if (typeof consentId !== "string" || !/^[0-9a-f]{32}$/.test(consentId)) return null;
  if (typeof version !== "string" || version.length > 20) return null;
  if (ui !== "banner" && ui !== "panel") return null;
  if (typeof isChange !== "boolean" || !isObject(choices)) return null;

  const parsed = {} as OptionalChoices;
  for (const c of OPTIONAL_CATEGORIES) {
    if (typeof choices[c] !== "boolean") return null;
    parsed[c] = choices[c] as boolean;
  }
  return { type: "decision", path, consentId, version, choices: parsed, ui, isChange };
}

export const CONSENT_DEVICES = ["mobile", "tablet", "desktop"] as const;
export type ConsentDevice = (typeof CONSENT_DEVICES)[number];

export function deviceFromUserAgent(ua: string): ConsentDevice {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  return /Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua) ? "mobile" : "desktop";
}

/** Rastreadores, navegadores sin cabeza y medidores: no cuentan. */
export function isBot(ua: string): boolean {
  return (
    !ua ||
    /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|playwright|puppeteer|python|curl|wget/i.test(
      ua,
    )
  );
}

/** `AAAA-MM-DD` en la zona horaria configurada. */
export function dayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: consentConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
