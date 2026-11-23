import { consentConfig, type OptionalCategory } from "@sello/core/consent";
import { useEffect, useRef, type FormEvent } from "react";
import { useConsent } from "../../consent/context.tsx";
import { useConsentTexts } from "./useConsentTexts.ts";

/**
 * Panel de preferencias (segunda capa) con <dialog> nativo: foco atrapado, Escape y fondo modal.
 * Interruptores nunca premarcados salvo que el visitante ya los aceptara.
 */
export function CookiePreferences() {
  const T = useConsentTexts();
  const { state, preferencesOpen, closePreferences, save, acceptAll, rejectAll } = useConsent();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (preferencesOpen && !dialog.open) dialog.showModal();
    if (!preferencesOpen && dialog.open) dialog.close();
  }, [preferencesOpen]);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const choices: Partial<Record<OptionalCategory, boolean>> = {};
    for (const c of consentConfig.categories) {
      if (!c.locked) choices[c.id as OptionalCategory] = data.get(c.id) === "on";
    }
    save(choices);
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="cc-dialog-title"
      onClose={closePreferences}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-md border border-line bg-bg p-0 text-body"
    >
      <form key={String(preferencesOpen)} onSubmit={handleSave} className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="cc-dialog-title" className="text-h3">
            {T.preferencesTitle}
          </h2>
          <button type="button" className="btn btn-ghost min-h-0 px-3 py-1" onClick={closePreferences}>
            {T.close}
          </button>
        </div>
        <p className="mt-3 text-sm">
          {T.preferencesBody} {T.moreInfo}{" "}
          <a href={T.policyPath} className="link">
            {T.cookiePolicy}
          </a>
          .
        </p>

        <ul className="mt-5 divide-y divide-line/50 border-y border-line/50">
          {consentConfig.categories.map((category) => {
            const text = T.categories[category.id];
            const inputId = `cc-cat-${category.id}`;
            return (
              <li key={category.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <label htmlFor={inputId} className="font-sans text-sm font-semibold text-strong">
                    {text.title}
                    {category.locked && <span className="font-normal text-muted"> · {T.alwaysActive}</span>}
                  </label>
                  <p className="mt-1 text-sm text-muted">{text.summary}</p>
                </div>
                <input
                  id={inputId}
                  type="checkbox"
                  role="switch"
                  className="mt-1 size-5 shrink-0 accent-[var(--color-accent)]"
                  name={category.locked ? undefined : category.id}
                  defaultChecked={category.locked || state.choices[category.id]}
                  disabled={category.locked}
                />
              </li>
            );
          })}
        </ul>

        {state.consentId && (
          <p className="hash mt-4 text-xs text-muted">
            {T.consentIdLabel} {state.consentId}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-primary" onClick={() => rejectAll()}>
            {T.rejectAll}
          </button>
          <button type="submit" className="btn btn-ghost">
            {T.save}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => acceptAll()}>
            {T.acceptAll}
          </button>
        </div>
      </form>
    </dialog>
  );
}
