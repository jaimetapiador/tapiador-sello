import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FileTooLargeError, hashFile, isHash, normalizeHash, sha256 } from "../src/index.ts";

// Vectores de prueba de SHA-256 (FIPS 180-2).
const EMPTY = "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const ABC = "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

describe("sha256", () => {
  it("coincide con los vectores oficiales", async () => {
    assert.equal(await sha256(""), EMPTY);
    assert.equal(await sha256("abc"), ABC);
  });

  it("da lo mismo con texto, bytes y Blob", async () => {
    const bytes = new TextEncoder().encode("abc");
    assert.equal(await sha256(bytes), ABC);
    assert.equal(await sha256(new Blob([bytes])), ABC);
  });

  it("cambia por completo con un solo carácter", async () => {
    const a = await sha256("Acta de la sesión del 3 de marzo.");
    const b = await sha256("Acta de la sesión del 3 de marzo");
    assert.notEqual(a, b);
  });
});

describe("hashFile", () => {
  it("calcula la huella de un fichero", async () => {
    assert.equal(await hashFile(new Blob(["abc"])), ABC);
  });

  it("rechaza ficheros por encima del límite", async () => {
    await assert.rejects(hashFile(new Blob(["abcd"]), 3), (error: unknown) => {
      assert.ok(error instanceof FileTooLargeError);
      assert.equal(error.code, "file-too-large");
      assert.equal(error.size, 4);
      return true;
    });
  });
});

describe("normalizeHash e isHash", () => {
  it("acepta mayúsculas, espacios y la falta de 0x", () => {
    const raw = ` BA7816BF8F01CFEA414140DE5DAE2223B00361A3\n96177A9CB410FF61F20015AD `;
    assert.equal(normalizeHash(raw), ABC);
    assert.equal(normalizeHash(ABC), ABC);
  });

  it("rechaza lo que no es una SHA-256", () => {
    assert.equal(normalizeHash("0x1234"), null);
    assert.equal(normalizeHash(`${ABC}00`), null);
    assert.equal(normalizeHash("zz".repeat(32)), null);
    assert.equal(isHash(ABC.toUpperCase()), false);
    assert.equal(isHash(42), false);
  });
});
