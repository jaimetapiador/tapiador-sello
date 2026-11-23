import { useId } from "react";
import { useI18n } from "../i18n.tsx";
import { SectionLabel } from "./ui.tsx";

export function About() {
  const { m } = useI18n();
  const id = useId();
  return (
    <section className="mx-auto max-w-content px-4 py-14 sm:px-8" aria-labelledby={`${id}-title`}>
      <SectionLabel>{m.about.label}</SectionLabel>
      <h2 id={`${id}-title`} className="mt-3 text-h2">
        {m.about.title}
      </h2>
      <ul className="mt-8 grid gap-8 sm:grid-cols-2">
        {m.about.items.map((item) => (
          <li key={item.title} className="border-t border-line pt-4">
            <h3 className="font-sans text-base font-semibold text-strong">{item.title}</h3>
            <p className="mt-2 text-base">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
