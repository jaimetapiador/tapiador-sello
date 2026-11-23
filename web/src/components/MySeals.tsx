import { explorerUrl } from "@sello/core";
import type { User } from "firebase/auth";
import { useEffect, useId, useState } from "react";
import { network } from "../chain.ts";
import { loadFirebase, type MySeal } from "../firebase.ts";
import { useI18n } from "../i18n.tsx";
import { SectionLabel, shortHash } from "./ui.tsx";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; seals: MySeal[] };

export function MySeals({ user, version }: { user: User; version: number }) {
  const { m, fill, date } = useI18n();
  const id = useId();
  const [state, setState] = useState<State>({ status: "loading" });
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    loadFirebase()
      .then(({ callMySeals }) => callMySeals())
      .then(({ data }) => !cancelled && setState({ status: "ready", seals: data.seals }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [user.uid, version]);

  return (
    <section className="mx-auto max-w-content px-4 py-10 sm:px-8" aria-labelledby={`${id}-title`}>
      <SectionLabel>{m.mySeals.label}</SectionLabel>
      <h2 id={`${id}-title`} className="mt-3 text-h2">
        {m.mySeals.title}
      </h2>
      <div className="mt-4" aria-live="polite">
        {state.status === "loading" && <p className="font-sans">{m.mySeals.loading}</p>}
        {state.status === "error" && <p className="text-danger-text">{m.mySeals.error}</p>}
        {state.status === "ready" && state.seals.length === 0 && <p>{m.mySeals.empty}</p>}
        {state.status === "ready" && state.seals.length > 0 && (
          <ul className="divide-y divide-line/50 border-y border-line/50">
            {state.seals.map((s) => (
              <li key={s.hash} className="flex flex-wrap items-baseline justify-between gap-2 py-3 font-sans text-sm">
                <span className="hash text-strong" title={s.hash}>
                  {shortHash(s.hash)}
                </span>
                <a className="link" href={explorerUrl.transaction(network, s.transaction)} target="_blank" rel="noopener noreferrer">
                  {fill(m.mySeals.sealedOn, { date: date(new Date(s.createdAt)) })}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 max-w-prose border-t border-line/60 pt-5">
        <h3 className="font-sans text-base font-semibold text-strong">{m.mySeals.deleteTitle}</h3>
        <p className="mt-2 text-sm">{m.mySeals.deleteText}</p>
        {!confirming ? (
          <button type="button" className="btn btn-ghost mt-4" onClick={() => setConfirming(true)}>
            {m.mySeals.deleteButton}
          </button>
        ) : (
          <div className="mt-4">
            <p className="font-sans text-sm text-danger-text">{m.mySeals.deleteConfirm}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError(false);
                  try {
                    const { auth, callDeleteMyData, signOut } = await loadFirebase();
                    await callDeleteMyData();
                    await signOut(auth);
                    alert(m.mySeals.deleted);
                  } catch {
                    setDeleteError(true);
                  } finally {
                    setDeleting(false);
                    setConfirming(false);
                  }
                }}
              >
                {m.mySeals.deleteConfirmButton}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
                {m.mySeals.deleteCancel}
              </button>
            </div>
          </div>
        )}
        {deleteError && <p className="mt-3 font-sans text-sm text-danger-text">{m.auth.errors.generic}</p>}
      </div>
    </section>
  );
}
