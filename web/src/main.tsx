import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { I18nProvider, detectLocale } from "./i18n.tsx";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider locale={detectLocale()}>
      <App page={document.body.dataset.page === "privacy" ? "privacy" : "home"} />
    </I18nProvider>
  </StrictMode>,
);
