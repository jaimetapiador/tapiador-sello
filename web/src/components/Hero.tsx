import { useI18n } from "../i18n.tsx";
import { SectionLabel } from "./ui.tsx";

export function Hero() {
  const { m } = useI18n();
  return (
    <section className="mx-auto max-w-content px-4 pt-14 pb-10 sm:px-8 sm:pt-20">
      <SectionLabel>{m.hero.label}</SectionLabel>
      <h1 className="mt-5 text-display tracking-tight">
        {m.hero.title} <em className="accent-italic">{m.hero.titleAccent}</em>
      </h1>
      <p className="mt-6 max-w-prose text-lead">{m.hero.lead}</p>
      <ol className="mt-12 grid gap-8 sm:grid-cols-3">
        {m.hero.steps.map((step, i) => (
          <li key={step.title} className="border-t border-line pt-4">
            <p className="label text-accent">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-2 text-h3">{step.title}</h2>
            <p className="mt-2 text-base">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
