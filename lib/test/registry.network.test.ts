// Lectura contra Base Sepolia (red real). Se salta salvo que se pida: SELLO_TEST_RED=1 npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  BASE_SEPOLIA,
  buildReceipt,
  createReader,
  readSeal,
  sha256,
  verifyReceipt,
} from "../src/index.ts";

const skip = process.env.SELLO_TEST_RED === "1" ? false : "define SELLO_TEST_RED=1 para leer la red real";
const fixture = new URL("../../contracts/fixtures/prueba-h1.txt", import.meta.url);

describe("Base Sepolia", { skip, timeout: 30_000 }, () => {
  it("el fichero del H1 consta como sellado en el bloque 61490258", async () => {
    const hash = await sha256(readFileSync(fixture));
    const record = await readSeal(createReader(BASE_SEPOLIA), BASE_SEPOLIA, hash);
    assert.ok(record.sealed);
    assert.equal(record.blockNumber, 61_490_258n);
    assert.equal(record.sealer, "0x29B6Cf9d90728d7694b3a3DdDba3da38314A7E83");

    const receipt = buildReceipt(BASE_SEPOLIA, {
      hash,
      transaction: "0x1f9df40804909467d454af426d4fcbd15b1626559b0ee5d2f663fba7c5cfef2e",
      blockNumber: record.blockNumber,
      sealedAt: record.sealedAt,
      sealer: record.sealer,
    });
    assert.deepEqual(await verifyReceipt(receipt, { documentHash: hash }), { ok: true });
  });

  it("una copia modificada no consta", async () => {
    const altered = readFileSync(fixture, "utf8").replace("H1", "H2");
    const record = await readSeal(createReader(BASE_SEPOLIA), BASE_SEPOLIA, await sha256(altered));
    assert.equal(record.sealed, false);
  });
});
