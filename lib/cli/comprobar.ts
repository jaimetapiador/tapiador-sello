// Comprueba un sello desde la terminal, leyendo la cadena directamente (sin servidor ni cuenta).
//
//   npm run comprobar -- <fichero>                    ¿está sellado este fichero?
//   npm run comprobar -- <huella>                     ¿está sellada esta huella?
//   npm run comprobar -- --recibo <recibo.json> [<fichero>]   ¿cuadra el recibo con la cadena (y con el fichero)?
//
// RPC: BASE_SEPOLIA_RPC_URL si está definida; si no, el público de la red.
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import {
  DEFAULT_NETWORK,
  createReader,
  explorerUrl,
  normalizeHash,
  parseReceipt,
  readSeal,
  sha256,
  verifyReceipt,
  type Hash,
  type ReceiptMismatch,
} from "../src/index.ts";

const network = DEFAULT_NETWORK;
const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || network.rpcUrl;
const date = (d: Date) => d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");

const MISMATCH: Record<ReceiptMismatch, string> = {
  network: "el recibo es de otra red",
  registry: "el recibo apunta a otro registro",
  document: "el recibo no corresponde a este fichero",
  "not-sealed": "la huella del recibo no consta en la cadena",
  block: "el bloque del recibo no coincide con el de la cadena",
  date: "la fecha del recibo no coincide con la de la cadena",
  sealer: "la cuenta del recibo no coincide con la de la cadena",
};

async function hashOf(arg: string): Promise<Hash> {
  return normalizeHash(arg) ?? sha256(readFileSync(arg));
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    options: { recibo: { type: "string" } },
    allowPositionals: true,
  });

  if (values.recibo) {
    const receipt = parseReceipt(JSON.parse(readFileSync(values.recibo, "utf8")));
    const target = positionals[0];
    const documentHash = target ? await hashOf(target) : undefined;
    const check = await verifyReceipt(receipt, documentHash ? { documentHash, rpcUrl } : { rpcUrl });
    if (!check.ok) {
      console.log(`El recibo NO es válido: ${MISMATCH[check.reason]}.`);
      return 2;
    }
    console.log(`Recibo válido${documentHash ? " para este fichero" : ""}.`);
    console.log(`Sellado el ${receipt.sealedAt} en el bloque ${receipt.blockNumber} (${receipt.network.id}).`);
    console.log(`Transacción: ${receipt.explorer}`);
    return 0;
  }

  const target = positionals[0];
  if (!target) {
    console.error("Uso: npm run comprobar -- <fichero | huella> · o: --recibo <recibo.json> [fichero]");
    return 1;
  }

  const hash = await hashOf(target);
  console.log(`Huella: ${hash}`);
  const record = await readSeal(createReader(network, rpcUrl), network, hash);
  if (!record.sealed) {
    console.log("No consta: no se ha sellado, o el fichero se ha modificado.");
    return 2;
  }
  console.log(`Sellado el ${date(record.sealedAt)} en el bloque ${record.blockNumber} por ${record.sealer}.`);
  console.log(`Bloque: ${explorerUrl.block(network, record.blockNumber)}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
