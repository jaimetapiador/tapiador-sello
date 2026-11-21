import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BASE_SEPOLIA,
  InvalidReceiptError,
  UnknownNetworkError,
  buildReceipt,
  explorerUrl,
  getNetwork,
  parseReceipt,
  type SealConfirmation,
} from "../src/index.ts";

// Datos reales del primer sello (H1), para que el recibo de ejemplo sea comprobable.
const H1: SealConfirmation = {
  hash: "0x55fb44dc4907b45c322c469a0d9f76f3ebbd13d049691e3a14177c9d554a562b",
  transaction: "0x1f9df40804909467d454af426d4fcbd15b1626559b0ee5d2f663fba7c5cfef2e",
  blockNumber: 61_490_258n,
  sealedAt: new Date("2026-11-21T00:12:00Z"),
  sealer: "0x29B6Cf9d90728d7694b3a3DdDba3da38314A7E83",
};

describe("red", () => {
  it("Base Sepolia es la red 84532 con el registro desplegado", () => {
    assert.equal(getNetwork("base-sepolia"), BASE_SEPOLIA);
    assert.equal(BASE_SEPOLIA.chain.id, 84532);
    assert.equal(BASE_SEPOLIA.registry, "0xCeCc456e339047bbA466536DFF9247449D12A3D1");
  });

  it("rechaza redes desconocidas", () => {
    assert.throws(() => getNetwork("mainnet"), UnknownNetworkError);
  });

  it("genera los enlaces al explorador", () => {
    assert.equal(
      explorerUrl.transaction(BASE_SEPOLIA, H1.transaction),
      `https://base-sepolia.blockscout.com/tx/${H1.transaction}`,
    );
    assert.equal(explorerUrl.block(BASE_SEPOLIA, 7n), "https://base-sepolia.blockscout.com/block/7");
    assert.match(explorerUrl.registry(BASE_SEPOLIA), /0xCeCc456e.*\?tab=read_write_contract$/);
  });
});

describe("recibo", () => {
  const receipt = buildReceipt(BASE_SEPOLIA, H1);

  it("recoge red, registro, transacción, bloque y fecha", () => {
    assert.deepEqual(receipt, {
      type: "sello-documental",
      version: 1,
      hash: H1.hash,
      network: { id: "base-sepolia", chainId: 84532 },
      registry: BASE_SEPOLIA.registry,
      transaction: H1.transaction,
      blockNumber: "61490258",
      sealedAt: "2026-11-21T00:12:00.000Z",
      sealer: H1.sealer,
      explorer: `https://base-sepolia.blockscout.com/tx/${H1.transaction}`,
    });
  });

  it("sobrevive a guardarlo y leerlo como JSON", () => {
    assert.deepEqual(parseReceipt(JSON.parse(JSON.stringify(receipt))), receipt);
  });

  it("normaliza las direcciones a su forma con mayúsculas de control", () => {
    const lower = { ...receipt, sealer: receipt.sealer.toLowerCase() };
    assert.equal(parseReceipt(lower).sealer, H1.sealer);
  });

  const broken: [string, unknown][] = [
    ["no es un objeto", "hola"],
    ["otro tipo de documento", { ...receipt, type: "factura" }],
    ["versión futura", { ...receipt, version: 2 }],
    ["huella corta", { ...receipt, hash: "0x1234" }],
    ["sin red", { ...receipt, network: undefined }],
    ["transacción mal formada", { ...receipt, transaction: "0xzz" }],
    ["bloque no numérico", { ...receipt, blockNumber: "61.490.258" }],
    ["fecha inválida", { ...receipt, sealedAt: "ayer" }],
    ["cuenta inválida", { ...receipt, sealer: "0x123" }],
  ];
  for (const [name, value] of broken) {
    it(`rechaza un recibo con ${name}`, () => {
      assert.throws(() => parseReceipt(value), InvalidReceiptError);
    });
  }
});
