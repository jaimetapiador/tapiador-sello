import type { Hex } from "viem";

/** Huella SHA-256 en hexadecimal, en minúsculas y con prefijo 0x (66 caracteres). */
export type Hash = Hex;

const HASH_RE = /^0x[0-9a-f]{64}$/;

/**
 * Tamaño máximo de fichero que se procesa en el navegador: 10 MB (decidido el 21/11/2026). Es una demo
 * y Web Crypto necesita el fichero entero en memoria, así que se mantiene ligero.
 */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export class FileTooLargeError extends Error {
  readonly code = "file-too-large";
  readonly size: number;
  readonly maxBytes: number;

  constructor(size: number, maxBytes: number) {
    super(`El fichero ocupa ${size} bytes y el máximo es ${maxBytes}.`);
    this.name = "FileTooLargeError";
    this.size = size;
    this.maxBytes = maxBytes;
  }
}

/** ¿Es una huella bien formada (0x + 64 hexadecimales en minúsculas)? */
export function isHash(value: unknown): value is Hash {
  return typeof value === "string" && HASH_RE.test(value);
}

/**
 * Normaliza una huella pegada por el usuario: quita espacios y saltos, acepta mayúsculas y la
 * falta de 0x. Devuelve null si no es una huella SHA-256 válida.
 */
export function normalizeHash(input: string): Hash | null {
  const compact = input.replace(/\s+/g, "").toLowerCase();
  const prefixed = compact.startsWith("0x") ? compact : `0x${compact}`;
  return isHash(prefixed) ? prefixed : null;
}

function toHex(buffer: ArrayBuffer): Hash {
  let hex = "0x";
  for (const byte of new Uint8Array(buffer)) hex += byte.toString(16).padStart(2, "0");
  return hex as Hash;
}

/** SHA-256 con Web Crypto: funciona igual en el navegador y en Node. */
export async function sha256(data: BufferSource | Blob | string): Promise<Hash> {
  const bytes: BufferSource =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : data instanceof Blob
        ? await data.arrayBuffer()
        : data;
  return toHex(await globalThis.crypto.subtle.digest("SHA-256", bytes));
}

/** Huella de un fichero (File o Blob) con límite de tamaño. El fichero no sale del equipo. */
export async function hashFile(file: Blob, maxBytes: number = MAX_FILE_BYTES): Promise<Hash> {
  if (file.size > maxBytes) throw new FileTooLargeError(file.size, maxBytes);
  return sha256(file);
}
