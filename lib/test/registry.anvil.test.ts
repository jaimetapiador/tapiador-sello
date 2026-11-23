// Integración con una cadena local (anvil): despliega SelloRegistry y recorre el flujo completo.
// Se salta si no hay anvil o no se ha compilado el contrato: (cd contracts && forge build).
import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createWalletClient, http, zeroAddress, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getChainId, waitForTransactionReceipt } from "viem/actions";
import { foundry } from "viem/chains";
import {
  AlreadySealedError,
  buildReceipt,
  createReader,
  findSealTransaction,
  readSeal,
  selloRegistryAbi,
  sha256,
  submitSeal,
  verifyReceipt,
  waitForSeal,
  type SelloNetwork,
} from "../src/index.ts";

const artifactPath = fileURLToPath(
  new URL("../../contracts/out/SelloRegistry.sol/SelloRegistry.json", import.meta.url),
);
const anvilBin = [`${homedir()}/.foundry/bin/anvil`, "anvil"].find(
  (bin) => spawnSync(bin, ["--version"]).status === 0,
);
const skip = !anvilBin
  ? "anvil no está instalado"
  : !existsSync(artifactPath)
    ? "falta compilar el contrato: (cd contracts && forge build)"
    : false;

// Cuentas 0 y 1 de anvil: claves públicas y conocidas, solo para la cadena local.
const KEY_0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const KEY_1 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const PORT = 8600 + Math.floor(Math.random() * 300);
const RPC = `http://127.0.0.1:${PORT}`;
const LOCAL: SelloNetwork = {
  id: "anvil",
  name: "Anvil",
  chain: foundry,
  registry: zeroAddress,
  deployBlock: 0n,
  explorer: "http://localhost",
  rpcUrl: RPC,
  demoSealer: zeroAddress,
};

describe("registro en una cadena local", { skip }, () => {
  let anvil: ChildProcess;
  let network: SelloNetwork;
  const reader = () => createReader(network, RPC);
  const wallet = (key: Hex) =>
    createWalletClient({ account: privateKeyToAccount(key), chain: foundry, transport: http(RPC) });

  before(async () => {
    anvil = spawn(anvilBin!, ["--port", String(PORT), "--silent"], { stdio: "ignore" });
    const probe = createReader(LOCAL, RPC);
    for (let i = 0; ; i++) {
      try {
        await getChainId(probe);
        break;
      } catch (error) {
        if (i > 50) throw error;
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    const { bytecode } = JSON.parse(readFileSync(artifactPath, "utf8")) as { bytecode: { object: Hex } };
    const deployer = wallet(KEY_0);
    const tx = await deployer.deployContract({ abi: selloRegistryAbi, bytecode: bytecode.object });
    const receipt = await waitForTransactionReceipt(probe, { hash: tx });
    network = { ...LOCAL, registry: receipt.contractAddress!, deployBlock: receipt.blockNumber };
  });

  after(() => {
    anvil?.kill();
  });

  it("una huella nueva no consta", async () => {
    const record = await readSeal(reader(), network, await sha256("nunca sellado"));
    assert.equal(record.sealed, false);
  });

  it("sella, confirma, lee y emite un recibo que cuadra con la cadena", async () => {
    const hash = await sha256("Acta de prueba");
    const tx = await submitSeal(wallet(KEY_0), reader(), network, hash);
    const seal = await waitForSeal(reader(), network, tx, { timeoutMs: 10_000 });

    assert.equal(seal.hash, hash);
    assert.equal(seal.sealer, privateKeyToAccount(KEY_0).address);

    const record = await readSeal(reader(), network, hash);
    assert.ok(record.sealed);
    assert.equal(record.blockNumber, seal.blockNumber);
    assert.equal(record.sealedAt.getTime(), seal.sealedAt.getTime());
    assert.equal(await findSealTransaction(reader(), network, hash, record.blockNumber), tx);
    assert.equal(await findSealTransaction(reader(), network, await sha256("otra"), record.blockNumber), null);

    const receipt = buildReceipt(network, seal);
    const check = { network, rpcUrl: RPC };
    assert.deepEqual(await verifyReceipt(receipt, { ...check, documentHash: hash }), { ok: true });
    assert.deepEqual(
      await verifyReceipt(receipt, { ...check, documentHash: await sha256("Acta de prueba.") }),
      { ok: false, reason: "document" },
    );
    assert.deepEqual(await verifyReceipt({ ...receipt, blockNumber: "1" }, check), {
      ok: false,
      reason: "block",
    });
    assert.deepEqual(await verifyReceipt({ ...receipt, hash: await sha256("otro") }, check), {
      ok: false,
      reason: "not-sealed",
    });
  });

  it("el primer sello prevalece: otra cuenta no puede volver a sellar la misma huella", async () => {
    const hash = await sha256("Resolución de prueba");
    await waitForSeal(reader(), network, await submitSeal(wallet(KEY_0), reader(), network, hash));

    await assert.rejects(submitSeal(wallet(KEY_1), reader(), network, hash), (error: unknown) => {
      assert.ok(error instanceof AlreadySealedError);
      assert.ok(error.sealedAt instanceof Date);
      return true;
    });
  });
});
