/**
 * Contexto de consentimiento. Guarda la cookie, abre/cierra el panel, envía
 * los eventos al registro y limpia al retirar permisos.
 *
 * Solo React (sin Next): sirve también en Vite/Remix. Quita "use client" si
 * tu framework no lo usa.
 *
 * Plantilla de la skill consentimiento-cookies (sin "use client": Vite).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  consentConfig,
  cookiePrefixesFor,
  enabledVendors,
  CONSENT_COOKIE,
  CONSENT_COOKIE_MAX_AGE,
  acceptAll as buildAcceptAll,
  decodeConsent,
  encodeConsent,
  needsBanner,
  optionalChoices,
  rejectAll as buildRejectAll,
  revokedCategories,
  withChoices as buildWithChoices,
  type ConsentCategory,
  type ConsentState,
  type OptionalCategory,
  type OptionalChoices,
  type ConsentEvent,
} from "@sello/core/consent";

const CHANGED_EVENT = "consent:changed";
const OPEN_PREFERENCES_EVENT = "consent:open-preferences";

export type DecisionUi = "banner" | "panel";

type ConsentContextValue = {
  state: ConsentState;
  /** No hay decisión válida para la versión actual. */
  showBanner: boolean;
  /** `false` en el HTML del servidor y durante la hidratación. */
  hydrated: boolean;
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: (ui?: DecisionUi) => void;
  rejectAll: (ui?: DecisionUi) => void;
  save: (choices: Partial<OptionalChoices>) => void;
  /** `necessary` siempre `true`. */
  allows: (category: ConsentCategory) => boolean;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readCookie(): string {
  const hit = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  return hit ? hit.slice(CONSENT_COOKIE.length + 1) : "";
}

/** Cambios propios y de otras pestañas (al volver el foco). */
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED_EVENT, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

const noopSubscribe = () => () => {};

function persist(state: ConsentState) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeConsent(state)}; Max-Age=${CONSENT_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** Envía un evento al registro sin bloquear. Nunca lanza. */
export function reportConsentEvent(event: ConsentEvent) {
  const endpoint = consentConfig.endpoint;
  if (!endpoint) return;
  const body = JSON.stringify(event);
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.(endpoint, blob)) return;
    void fetch(endpoint, { method: "POST", body, keepalive: true });
  } catch {
    // Las estadísticas nunca deben romper la web.
  }
}

/**
 * Borra las cookies propias de una categoría. Prueba el host y cada dominio
 * padre (GA y Meta las dejan en `.dominio.tld`).
 */
function clearCategoryCookies(category: OptionalCategory) {
  const prefixes = cookiePrefixesFor(category);
  if (!prefixes.length) return;
  const names = document.cookie
    .split("; ")
    .map((row) => row.split("=")[0] ?? "")
    .filter((name) => prefixes.some((p) => name.startsWith(p)));
  const parts = window.location.hostname.split(".");
  const domains = [""].concat(
    parts.slice(0, -1).map((_, i) => `; Domain=.${parts.slice(i).join(".")}`),
  );
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
    }
  }
}

/** Abre el panel desde cualquier sitio (pie de página, política). */
export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

export function ConsentProvider({
  initialState,
  children,
}: {
  /** Estado leído en el servidor (si lo hay): evita el parpadeo del aviso. */
  initialState?: ConsentState;
  children: ReactNode;
}) {
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
  }, []);

  const raw = useSyncExternalStore(subscribe, readCookie, () =>
    initialState ? encodeConsent(initialState) : "",
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const state = useMemo(() => decodeConsent(raw || null), [raw]);

  const commit = useCallback(
    (next: ConsentState, ui: DecisionUi) => {
      const previous = needsBanner(state) ? null : state;
      persist(next);
      setPreferencesOpen(false);
      reportConsentEvent({
        type: "decision",
        path: window.location.pathname,
        consentId: next.consentId ?? "",
        version: next.version,
        choices: optionalChoices(next),
        ui,
        isChange: previous !== null,
      });

      if (!previous) return;
      const revoked = revokedCategories(previous, next);
      revoked.forEach(clearCategoryCookies);
      // Un script ya cargado no se puede «descargar»: recargar lo detiene.
      if (revoked.some((c) => enabledVendors(c).length > 0)) {
        window.location.reload();
      }
    },
    [state],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      state,
      showBanner: needsBanner(state),
      hydrated,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      // El consentId se conserva al cambiar de opinión.
      acceptAll: (ui = "panel") =>
        commit(buildAcceptAll({ consentId: state.consentId }), ui),
      rejectAll: (ui = "panel") =>
        commit(buildRejectAll({ consentId: state.consentId }), ui),
      save: (choices) =>
        commit(buildWithChoices(choices, { consentId: state.consentId }), "panel"),
      allows: (category) => state.choices[category] === true,
    }),
    [state, hydrated, preferencesOpen, commit],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent debe usarse dentro de <ConsentProvider>");
  return ctx;
}
