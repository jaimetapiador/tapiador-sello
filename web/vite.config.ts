import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Dos páginas estáticas: / (español) y /en/ (inglés). Cada una monta la misma aplicación con su idioma.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    rollupOptions: {
      input: { es: page("index.html"), en: page("en/index.html") },
    },
  },
});
