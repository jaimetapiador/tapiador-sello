/**
 * Utilidades sobre el registro de proveedores de `config.ts`. Puro.
 *
 * Plantilla de la skill consentimiento-cookies.
 */

import { consentConfig } from "./config.ts";

export type ConsentVendor = (typeof consentConfig.vendors)[number];
export type VendorId = ConsentVendor["id"];
type Category = (typeof consentConfig.categories)[number]["id"];

export const CONSENT_VENDORS: readonly ConsentVendor[] = consentConfig.vendors;

export function enabledVendors(category?: Category): ConsentVendor[] {
  return CONSENT_VENDORS.filter(
    (v) => v.enabled && (!category || v.category === category),
  );
}

/** Prefijos de cookies propias de una categoría (activos o no). */
export function cookiePrefixesFor(category: Category): string[] {
  return CONSENT_VENDORS.filter((v) => v.category === category).flatMap(
    (v) => [...v.cookiePrefixes],
  );
}

/**
 * Firma corta del conjunto de proveedores OPCIONALES activos. Parte de la
 * versión del consentimiento: si cambia, las decisiones guardadas caducan.
 */
export function vendorSignature(
  vendors: readonly { id: string; category: string; enabled: boolean }[] = CONSENT_VENDORS,
): string {
  const key = vendors
    .filter((v) => v.enabled && v.category !== "necessary")
    .map((v) => v.id)
    .sort()
    .join(",");
  // djb2: estable y sin dependencias.
  let hash = 5381;
  for (const char of key) hash = ((hash << 5) + hash + char.charCodeAt(0)) >>> 0;
  return hash.toString(36).slice(0, 5);
}
