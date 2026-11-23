// Empaqueta las funciones en dist/index.js con @sello/core y viem dentro.
// firebase-functions y firebase-admin quedan fuera: Cloud Build los instala desde package.json.
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  sourcemap: true,
  external: ["firebase-functions", "firebase-functions/*", "firebase-admin", "firebase-admin/*"],
  // Algunas dependencias CommonJS usan require: se lo proporcionamos en el paquete ESM.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: "info",
});
