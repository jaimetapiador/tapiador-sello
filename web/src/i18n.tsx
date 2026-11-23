import { createContext, useContext, type ReactNode } from "react";
import { en } from "./messages/en.ts";
import { es, type Messages } from "./messages/es.ts";

export type Locale = "es" | "en";

const MESSAGES: Record<Locale, Messages> = { es, en };

interface I18n {
  locale: Locale;
  m: Messages;
  /** Sustituye {clave} en un texto. */
  fill: (text: string, values: Record<string, string | number>) => string;
  /** Fecha y hora locales con zona horaria. */
  date: (d: Date) => string;
  /** Tamaño de fichero legible (KB, MB). */
  bytes: (n: number) => string;
}

const Context = createContext<I18n | null>(null);

export function detectLocale(): Locale {
  return document.documentElement.lang === "en" ? "en" : "es";
}

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const tag = locale === "es" ? "es-ES" : "en-GB";
  // dateStyle/timeStyle no admiten timeZoneName: se piden los campos uno a uno.
  const dateFormat = new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  const number = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });

  const value: I18n = {
    locale,
    m: MESSAGES[locale],
    fill: (text, values) => text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`)),
    date: (d) => dateFormat.format(d),
    bytes: (n) =>
      n >= 1024 * 1024 ? `${number.format(n / (1024 * 1024))} MB` : `${number.format(Math.ceil(n / 1024))} KB`,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(Context);
  if (!value) throw new Error("useI18n fuera de I18nProvider");
  return value;
}
