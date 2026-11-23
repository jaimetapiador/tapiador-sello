import type { ReactNode } from "react";
import { ConsentProvider } from "../../consent/context.tsx";
import { CookieBanner } from "./CookieBanner.tsx";
import { CookiePreferences } from "./CookiePreferences.tsx";
import { GoogleTag } from "./GoogleTag.tsx";

/** Punto de montaje único del gestor de consentimiento (main.tsx). */
export function ConsentRoot({ children }: { children: ReactNode }) {
  return (
    <ConsentProvider>
      {children}
      <GoogleTag />
      <CookieBanner />
      <CookiePreferences />
    </ConsentProvider>
  );
}
