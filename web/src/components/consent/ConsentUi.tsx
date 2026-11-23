import type { ReactNode } from "react";
import { openCookiePreferences, useConsent } from "../../consent/context.tsx";
import { useConsentTexts } from "./useConsentTexts.ts";

/** Reabre el panel. Siempre accesible (pie): retirar el consentimiento debe ser tan fácil como darlo. */
export function CookieSettingsButton({ className = "link", children }: { className?: string; children?: ReactNode }) {
  const T = useConsentTexts();
  return (
    <button type="button" onClick={openCookiePreferences} className={className}>
      {children ?? T.settingsLink}
    </button>
  );
}

/** ID de la decisión guardada, para citarlo en una consulta. */
export function ConsentId() {
  const T = useConsentTexts();
  const { state, hydrated } = useConsent();
  if (!hydrated || !state.consentId) return null;
  return (
    <p className="hash mt-3 text-sm text-muted">
      {T.consentIdLabel} {state.consentId}
    </p>
  );
}
