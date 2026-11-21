// Copia el ABI de SelloRegistry desde la compilación de Foundry a lib/src/abi.ts.
// Uso: (cd contracts && forge build) && npm run abi:sync
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const artifact = `${root}contracts/out/SelloRegistry.sol/SelloRegistry.json`;

let abi;
try {
  abi = JSON.parse(readFileSync(artifact, "utf8")).abi;
} catch {
  console.error(`No encuentro ${artifact}. Ejecuta antes: (cd contracts && forge build)`);
  process.exit(1);
}

const out = `// Generado por scripts/sync-abi.mjs a partir de contracts/out. No editar a mano.
export const selloRegistryAbi = ${JSON.stringify(abi, null, 2)} as const;
`;
writeFileSync(`${root}lib/src/abi.ts`, out);
console.log("lib/src/abi.ts actualizado");
