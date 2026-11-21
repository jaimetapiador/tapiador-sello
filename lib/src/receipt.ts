import { getAddress, isAddress, type Address, type Hex } from "viem";
import { isHash, type Hash } from "./hash.ts";
import { explorerUrl, getNetwork, type SelloNetwork } from "./network.ts";
import { readSeal, type SealConfirmation, createReader } from "./registry.ts";

/**
 * Recibo descargable de un sello. Es un JSON autosuficiente: con él y el documento, cualquiera
 * puede comprobar el sello en la cadena sin esta web. No contiene el documento ni su nombre.
 */
export interface SealReceipt {
  readonly type: "sello-documental";
  readonly version: 1;
  /** Huella SHA-256 del documento. */
  readonly hash: Hash;
  readonly network: { readonly id: string; readonly chainId: number };
  readonly registry: Address;
  readonly transaction: Hex;
  /** Número de bloque en decimal (JSON no admite bigint). */
  readonly blockNumber: string;
  /** Fecha del bloque en ISO 8601 (UTC). */
  readonly sealedAt: string;
  readonly sealer: Address;
  readonly explorer: string;
}

export function buildReceipt(network: SelloNetwork, seal: SealConfirmation): SealReceipt {
  return {
    type: "sello-documental",
    version: 1,
    hash: seal.hash,
    network: { id: network.id, chainId: network.chain.id },
    registry: network.registry,
    transaction: seal.transaction,
    blockNumber: seal.blockNumber.toString(),
    sealedAt: seal.sealedAt.toISOString(),
    sealer: seal.sealer,
    explorer: explorerUrl.transaction(network, seal.transaction),
  };
}

export class InvalidReceiptError extends Error {
  readonly code = "invalid-receipt";

  constructor(detail: string) {
    super(`El recibo no es válido: ${detail}.`);
    this.name = "InvalidReceiptError";
  }
}

const TX_RE = /^0x[0-9a-f]{64}$/;

/** Valida un recibo leído de un fichero JSON. Lanza InvalidReceiptError con el motivo. */
export function parseReceipt(input: unknown): SealReceipt {
  const fail = (detail: string): never => {
    throw new InvalidReceiptError(detail);
  };
  if (typeof input !== "object" || input === null) return fail("no es un objeto JSON");
  const r = input as Record<string, unknown>;
  const network = r.network as Record<string, unknown> | undefined;

  if (r.type !== "sello-documental") fail("no es un recibo del sello documental");
  if (r.version !== 1) fail(`versión no admitida (${String(r.version)})`);
  if (!isHash(r.hash)) fail("la huella no es una SHA-256 válida");
  if (typeof network?.id !== "string" || typeof network.chainId !== "number") fail("falta la red");
  if (typeof r.registry !== "string" || !isAddress(r.registry)) fail("la dirección del registro no es válida");
  if (typeof r.transaction !== "string" || !TX_RE.test(r.transaction)) fail("la transacción no es válida");
  if (typeof r.blockNumber !== "string" || !/^\d+$/.test(r.blockNumber)) fail("el bloque no es válido");
  if (typeof r.sealedAt !== "string" || Number.isNaN(Date.parse(r.sealedAt))) fail("la fecha no es válida");
  if (typeof r.sealer !== "string" || !isAddress(r.sealer)) fail("la cuenta que sella no es válida");
  if (typeof r.explorer !== "string") fail("falta el enlace al explorador");

  return {
    type: "sello-documental",
    version: 1,
    hash: r.hash as Hash,
    network: { id: network!.id as string, chainId: network!.chainId as number },
    registry: getAddress(r.registry as string),
    transaction: r.transaction as Hex,
    blockNumber: r.blockNumber as string,
    sealedAt: r.sealedAt as string,
    sealer: getAddress(r.sealer as string),
    explorer: r.explorer as string,
  };
}

/** Motivos por los que un recibo no cuadra con la cadena. */
export type ReceiptMismatch =
  | "network"
  | "registry"
  | "document"
  | "not-sealed"
  | "block"
  | "date"
  | "sealer";

export type ReceiptCheck = { readonly ok: true } | { readonly ok: false; readonly reason: ReceiptMismatch };

/**
 * Comprueba un recibo contra la cadena. Si se pasa la huella del documento, también comprueba que
 * el recibo corresponde a ese documento. La red sale del propio recibo.
 */
export async function verifyReceipt(
  receipt: SealReceipt,
  options: { documentHash?: Hash; network?: SelloNetwork; rpcUrl?: string } = {},
): Promise<ReceiptCheck> {
  const network = options.network ?? getNetwork(receipt.network.id);
  if (network.id !== receipt.network.id || network.chain.id !== receipt.network.chainId) {
    return { ok: false, reason: "network" };
  }
  if (getAddress(receipt.registry) !== getAddress(network.registry)) return { ok: false, reason: "registry" };
  if (options.documentHash && options.documentHash !== receipt.hash) return { ok: false, reason: "document" };

  const record = await readSeal(createReader(network, options.rpcUrl), network, receipt.hash);
  if (!record.sealed) return { ok: false, reason: "not-sealed" };
  if (record.blockNumber.toString() !== receipt.blockNumber) return { ok: false, reason: "block" };
  if (record.sealedAt.toISOString() !== receipt.sealedAt) return { ok: false, reason: "date" };
  if (getAddress(record.sealer) !== getAddress(receipt.sealer)) return { ok: false, reason: "sealer" };
  return { ok: true };
}
