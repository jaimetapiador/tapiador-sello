import { waitForSeal, type Hash, type SealConfirmation } from "@sello/core";
import { sendEmailVerification, type User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useId, useState } from "react";
import { network, reader } from "../chain.ts";
import { USER_DAILY_LIMIT, auth, callSeal } from "../firebase.ts";
import { useI18n } from "../i18n.tsx";

type Phase = "idle" | "submitting" | "confirming" | "error";

export function SealBox({
  hash,
  user,
  onSignIn,
  onSealed,
}: {
  hash: Hash;
  user: User | null | undefined;
  onSignIn: () => void;
  onSealed: (c: SealConfirmation) => void;
}) {
  const { m, fill } = useI18n();
  const consentId = useId();
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [, force] = useState(0);

  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="mt-6 border-t border-line/60 pt-5">
        <h3 className="font-sans text-base font-semibold text-strong">{m.seal.title}</h3>
        <p className="mt-2 max-w-prose text-sm">{m.seal.needAccount}</p>
        <button type="button" className="btn btn-primary mt-4" onClick={onSignIn}>
          {m.seal.signInToSeal}
        </button>
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <div className="mt-6 border-t border-line/60 pt-5">
        <h3 className="font-sans text-base font-semibold text-strong">{m.seal.title}</h3>
        <p className="mt-2 max-w-prose text-sm">{fill(m.seal.needVerify, { email: user.email ?? "" })}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              // reload() trae emailVerified; getIdToken(true) emite un token nuevo y repinta (useUser).
              await user.reload().catch(() => undefined);
              await user.getIdToken(true).catch(() => undefined);
              force((n) => n + 1);
            }}
          >
            {m.seal.iVerified}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={resent}
            onClick={async () => {
              await sendEmailVerification(user).catch(() => undefined);
              setResent(true);
            }}
          >
            {resent ? m.seal.resent : m.seal.resend}
          </button>
        </div>
      </div>
    );
  }

  async function submit() {
    setError(null);
    setPhase("submitting");
    try {
      const { data } = await callSeal({ hash });
      setPhase("confirming");
      const confirmation = await waitForSeal(reader, network, data.transaction, { timeoutMs: 90_000 });
      setPhase("idle");
      onSealed(confirmation);
    } catch (e) {
      setPhase("error");
      setError(errorText(e));
    }
  }

  function errorText(e: unknown): string {
    if (!(e instanceof FirebaseError)) return m.seal.errors.generic;
    const details = (e as FirebaseError & { details?: { reason?: string; limit?: number } }).details;
    const reason = details?.reason;
    if (reason === "user-quota") return fill(m.seal.errors["user-quota"], { limit: details?.limit ?? USER_DAILY_LIMIT });
    if (reason === "global-quota") return m.seal.errors["global-quota"];
    if (reason === "email-not-verified") return m.seal.errors["email-not-verified"];
    if (e.code === "functions/already-exists") return m.seal.errors["already-exists"];
    if (e.code === "functions/unauthenticated") return m.seal.errors.unauthenticated;
    return m.seal.errors.generic;
  }

  const busy = phase === "submitting" || phase === "confirming";
  return (
    <div className="mt-6 border-t border-line/60 pt-5">
      <h3 className="font-sans text-base font-semibold text-strong">{m.seal.title}</h3>
      <div className="mt-3 flex max-w-prose items-start gap-3">
        <input
          id={consentId}
          type="checkbox"
          className="mt-1.5 size-4 accent-[var(--color-accent)]"
          checked={consent}
          disabled={busy}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <label htmlFor={consentId} className="text-sm">
          {m.seal.consent}
        </label>
      </div>
      <p className="mt-3 text-sm text-muted">{fill(m.seal.quota, { limit: USER_DAILY_LIMIT })}</p>
      <button type="button" className="btn btn-primary mt-4" disabled={!consent || busy || !auth.currentUser} onClick={() => void submit()}>
        {m.seal.submit}
      </button>
      <div aria-live="polite" className="mt-3 font-sans text-sm">
        {phase === "submitting" && <p>{m.seal.submitting}</p>}
        {phase === "confirming" && <p>{m.seal.confirming}</p>}
        {phase === "error" && error && <p className="text-danger-text">{error}</p>}
      </div>
    </div>
  );
}
