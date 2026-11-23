import { consentConfig, enabledVendors } from "@sello/core/consent";
import { useEffect } from "react";
import { useConsent } from "../../consent/context.tsx";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** Cookies de GA con la misma vida que la decisión (6 meses), en segundos. */
const COOKIE_EXPIRES = consentConfig.maxAgeDays * 24 * 60 * 60;
let configured = false;

/**
 * Google Analytics 4 con Consent Mode v2 BÁSICO: gtag.js no se carga hasta que el visitante
 * acepta las analíticas. Sin publicidad: las señales ad_* van siempre denegadas, y se desactivan
 * Google Signals y la personalización de anuncios. Cada página es un HTML propio, así que el
 * page_view automático de `config` mide cada visita.
 */
export function GoogleTag() {
  const { allows } = useConsent();
  const id = consentConfig.tags.googleAnalytics;
  const active = Boolean(id) && enabledVendors("analytics").some((v) => v.id === "google-analytics") && allows("analytics");

  useEffect(() => {
    if (!active) return;
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        // gtag.js exige el objeto `arguments`.
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        functionality_storage: "granted",
        security_storage: "granted",
      });
      window.gtag("set", "ads_data_redaction", true);
      window.gtag("js", new Date());
    }
    window.gtag("consent", "update", { analytics_storage: "granted" });
    if (!configured) {
      configured = true;
      window.gtag("config", id, {
        cookie_expires: COOKIE_EXPIRES,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    }
    const src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    if (!document.querySelector(`script[src="${src}"]`)) {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      document.head.appendChild(el);
    }
  }, [active, id]);

  return null;
}
