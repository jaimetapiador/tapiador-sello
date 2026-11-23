import { useEffect, useRef } from "react";
import { reportConsentEvent, useConsent } from "../../consent/context.tsx";
import { useConsentTexts } from "./useConsentTexts.ts";

/**
 * Aviso de cookies (primera capa). Fijo abajo: no empuja el layout (CLS 0) ni bloquea la
 * navegación. Aceptar y rechazar en la misma capa, con el mismo estilo y tamaño (guía AEPD).
 */
export function CookieBanner() {
  const T = useConsentTexts();
  const { showBanner, hydrated, acceptAll, rejectAll, openPreferences } = useConsent();

  // Una impresión por carga de página con el aviso visible.
  const sent = useRef(false);
  useEffect(() => {
    if (!hydrated || !showBanner || sent.current) return;
    sent.current = true;
    reportConsentEvent({ type: "impression", path: window.location.pathname });
  }, [hydrated, showBanner]);

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label={T.bannerTitle}
      aria-live="polite"
      data-cookie-banner=""
      className="fixed inset-x-0 bottom-0 z-40 p-3 motion-safe:animate-[cc-rise_0.3s_var(--ease-out-expo)]"
    >
      <div className="panel mx-auto max-w-3xl border-line-strong bg-bg p-4 shadow-2xl sm:p-5">
        <p className="font-sans text-base font-semibold text-strong">{T.bannerTitle}</p>
        <p className="mt-1.5 text-sm">
          {T.bannerBody}{" "}
          <a href={T.policyPath} className="link">
            {T.cookiePolicy}
          </a>
          .
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={openPreferences} disabled={!hydrated}>
            {T.configure}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => rejectAll("banner")} disabled={!hydrated}>
            {T.rejectAll}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => acceptAll("banner")} disabled={!hydrated}>
            {T.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
