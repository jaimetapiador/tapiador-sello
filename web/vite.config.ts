import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Páginas estáticas: / y /privacidad/ (español), /en/ y /en/privacy/ (inglés). Todas montan la misma
// aplicación; el idioma sale de <html lang> y la página de <body data-page>.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    rollupOptions: {
      input: {
        es: page("index.html"),
        en: page("en/index.html"),
        privacidad: page("privacidad/index.html"),
        privacy: page("en/privacy/index.html"),
      },
    },
  },
});
