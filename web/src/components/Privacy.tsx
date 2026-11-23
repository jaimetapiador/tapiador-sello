import { Fragment, useId } from "react";
import { useI18n } from "../i18n.tsx";
import { PRIVACY, PRIVACY_CONTACT } from "../messages/privacy.ts";
import { SectionLabel } from "./ui.tsx";

/**
 * Muestra «PENDIENTE»/«PENDING» con la marca visual de dato sin confirmar, como en tapiador.eu,
 * y el correo de contacto como enlace.
 */
function withPending(text: string) {
  const parts = text.split(new RegExp(`(PENDIENTE|PENDING|${PRIVACY_CONTACT.replace(/[.]/g, "\\.")})`));
  return parts.map((part, i) =>
    part === PRIVACY_CONTACT ? (
      <a key={i} className="link" href={`mailto:${PRIVACY_CONTACT}`}>
        {part}
      </a>
    ) : part === "PENDIENTE" || part === "PENDING" ? (
      <span key={i} className="label rounded-sm border border-accent-2/60 px-1 text-accent-2">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function Privacy() {
  const { locale } = useI18n();
  const id = useId();
  const content = PRIVACY[locale];
  return (
    <article className="mx-auto max-w-content px-4 py-14 sm:px-8" aria-labelledby={`${id}-title`}>
      <SectionLabel>{withPending(content.updated)}</SectionLabel>
      <h1 id={`${id}-title`} className="mt-4 text-display">
        {content.title}
      </h1>
      <p className="mt-6 max-w-prose text-lead">{content.intro}</p>
      <div className="mt-10 max-w-prose space-y-10">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-h3">{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p} className="mt-3">
                {withPending(p)}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
