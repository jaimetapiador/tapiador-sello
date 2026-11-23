import {
  BaseError,
  ContractFunctionRevertedError,
  createClient,
  http,
  parseEventLogs,
  type Account,
  type Address,
  type Chain,
  type Client,
  type Hex,
  type Transport,
} from "viem";
// Acciones sueltas en vez de createPublicClient: así el empaquetador solo incluye lo que se usa
// (createPublicClient arrastra todas las acciones, incluidas las de firmas, y triplica el peso en el navegador).
import {
  getContractEvents,
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "viem/actions";
import { selloRegistryAbi } from "./abi.ts";
import type { Hash } from "./hash.ts";
import type { SelloNetwork } from "./network.ts";

/** Resultado de consultar una huella en el registro. */
export type SealRecord =
  | { readonly sealed: false; readonly hash: Hash }
  | {
      readonly sealed: true;
      readonly hash: Hash;
      readonly sealedAt: Date;
      readonly blockNumber: bigint;
      readonly sealer: Address;
    };

/** Datos de un sello recién confirmado en la cadena. */
export interface SealConfirmation {
  readonly hash: Hash;
  readonly transaction: Hex;
  readonly blockNumber: bigint;
  readonly sealedAt: Date;
  readonly sealer: Address;
}

export class AlreadySealedError extends Error {
  readonly code = "already-sealed";
  readonly hash: Hash;
  readonly sealedAt: Date | null;

  constructor(hash: Hash, sealedAt: Date | null) {
    super(
      sealedAt
        ? `La huella ya estaba sellada desde ${sealedAt.toISOString()}.`
        : "La huella ya estaba sellada.",
    );
    this.name = "AlreadySealedError";
    this.hash = hash;
    this.sealedAt = sealedAt;
  }
}

export class SealFailedError extends Error {
  readonly code = "seal-failed";
  readonly transaction: Hex;

  constructor(transaction: Hex, detail: string) {
    super(`La transacción ${transaction} no ha sellado la huella: ${detail}.`);
    this.name = "SealFailedError";
    this.transaction = transaction;
  }
}

/** Cliente mínimo de lectura (sin acciones precargadas). */
export type Reader = Client<Transport, Chain | undefined>;

/** Cliente de solo lectura. En el navegador usa el RPC público de la red. */
export function createReader(network: SelloNetwork, rpcUrl: string = network.rpcUrl): Reader {
  return createClient({ chain: network.chain, transport: http(rpcUrl) });
}

const fromSeconds = (seconds: number | bigint) => new Date(Number(seconds) * 1000);

/** Consulta una huella en el registro. Lectura gratuita: no necesita cuenta ni servidor. */
export async function readSeal(client: Reader, network: SelloNetwork, hash: Hash): Promise<SealRecord> {
  const [timestamp, blockNumber, sealer] = await readContract(client, {
    address: network.registry,
    abi: selloRegistryAbi,
    functionName: "sealOf",
    args: [hash],
  });
  if (timestamp === 0) return { sealed: false, hash };
  return { sealed: true, hash, sealedAt: fromSeconds(timestamp), blockNumber: BigInt(blockNumber), sealer };
}

/**
 * Busca la transacción que selló una huella. Como `sealOf` ya dice el bloque, basta con pedir los
 * eventos `Sealed` de ese único bloque: funciona con cualquier RPC, sin índices ni API del explorador.
 */
export async function findSealTransaction(
  client: Reader,
  network: SelloNetwork,
  hash: Hash,
  blockNumber: bigint,
): Promise<Hex | null> {
  const logs = await getContractEvents(client, {
    address: network.registry,
    abi: selloRegistryAbi,
    eventName: "Sealed",
    args: { hash },
    fromBlock: blockNumber,
    toBlock: blockNumber,
  });
  return logs[0]?.transactionHash ?? null;
}

/** Si el error es el revert AlreadySealed del contrato, devuelve la fecha del sello original. */
function alreadySealedFrom(error: unknown): { sealedAt: Date } | null {
  if (!(error instanceof BaseError)) return null;
  const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
  if (!(revert instanceof ContractFunctionRevertedError)) return null;
  if (revert.data?.errorName !== "AlreadySealed") return null;
  const [, timestamp] = revert.data.args as readonly [Hex, bigint];
  return { sealedAt: fromSeconds(timestamp) };
}

/**
 * Envía la transacción de sellado y devuelve su identificador sin esperar a la confirmación.
 * Antes comprueba que la huella no esté sellada y simula la llamada, para no gastar gas en balde.
 * Lanza AlreadySealedError si la huella ya tenía sello.
 */
export async function submitSeal(
  wallet: Client<Transport, Chain | undefined, Account>,
  client: Reader,
  network: SelloNetwork,
  hash: Hash,
): Promise<Hex> {
  const existing = await readSeal(client, network, hash);
  if (existing.sealed) throw new AlreadySealedError(hash, existing.sealedAt);

  try {
    const { request } = await simulateContract(client, {
      account: wallet.account,
      address: network.registry,
      abi: selloRegistryAbi,
      functionName: "seal",
      args: [hash],
      chain: network.chain,
    });
    return await writeContract(wallet, request);
  } catch (error) {
    const already = alreadySealedFrom(error);
    if (already) throw new AlreadySealedError(hash, already.sealedAt);
    throw error;
  }
}

/** Espera a que la transacción se confirme y extrae el sello del evento `Sealed`. */
export async function waitForSeal(
  client: Reader,
  network: SelloNetwork,
  transaction: Hex,
  options: { timeoutMs?: number } = {},
): Promise<SealConfirmation> {
  const receipt = await waitForTransactionReceipt(client, {
    hash: transaction,
    timeout: options.timeoutMs ?? 60_000,
  });
  if (receipt.status !== "success") throw new SealFailedError(transaction, "la transacción ha revertido");

  const [event] = parseEventLogs({
    abi: selloRegistryAbi,
    eventName: "Sealed",
    logs: receipt.logs.filter((log) => log.address.toLowerCase() === network.registry.toLowerCase()),
  });
  if (!event) throw new SealFailedError(transaction, "no se ha emitido el evento Sealed");

  return {
    hash: event.args.hash,
    transaction,
    blockNumber: receipt.blockNumber,
    sealedAt: fromSeconds(event.args.timestamp),
    sealer: event.args.sealer,
  };
}
