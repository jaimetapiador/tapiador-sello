import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { firebaseErrorCode, loadFirebase } from "../firebase.ts";
import { useI18n } from "../i18n.tsx";

type Mode = "signIn" | "signUp";

export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { m, locale } = useI18n();
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError(null);
      setNotice(null);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Los correos de Firebase (verificación, contraseña) salen en el idioma de la página.
  useEffect(() => {
    if (open) void loadFirebase().then(({ auth }) => (auth.languageCode = locale));
  }, [open, locale]);

  function errorText(e: unknown): string {
    const code = firebaseErrorCode(e);
    const errors = m.auth.errors as Record<string, string>;
    return errors[code] ?? m.auth.errors.generic;
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } =
        await loadFirebase();
      if (mode === "signIn") {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        setNotice(m.auth.verifySent);
      }
    });
  }

  const title = mode === "signIn" ? m.auth.titleSignIn : m.auth.titleSignUp;
  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-md border border-line bg-bg p-6 text-body"
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={`${id}-title`} className="text-h3">
          {title}
        </h2>
        <button type="button" className="btn btn-ghost min-h-0 px-3 py-1" onClick={onClose}>
          {m.auth.close}
        </button>
      </div>

      <button
        type="button"
        className="btn btn-ghost mt-5 w-full"
        disabled={busy}
        onClick={() =>
          void run(async () => {
            const { auth, signInWithPopup, GoogleAuthProvider } = await loadFirebase();
            await signInWithPopup(auth, new GoogleAuthProvider());
            onClose();
          })
        }
      >
        {m.auth.google}
      </button>
      <p className="label mt-5 text-center text-muted">{m.auth.or}</p>

      <form className="mt-4 space-y-4 font-sans" onSubmit={onSubmit}>
        <div>
          <label htmlFor={`${id}-email`} className="text-sm text-strong">
            {m.auth.email}
          </label>
          <input
            id={`${id}-email`}
            type="email"
            className="field mt-1"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${id}-password`} className="text-sm text-strong">
            {m.auth.password}
          </label>
          <input
            id={`${id}-password`}
            type="password"
            className="field mt-1"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            minLength={8}
            required
            aria-describedby={mode === "signUp" ? `${id}-pwhint` : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signUp" && (
            <p id={`${id}-pwhint`} className="mt-1 text-xs text-muted">
              {m.auth.passwordHint}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {mode === "signIn" ? m.auth.signIn : m.auth.signUp}
        </button>
      </form>

      <div aria-live="polite" className="mt-3 font-sans text-sm">
        {error && <p className="text-danger-text">{error}</p>}
        {notice && <p className="text-accent">{notice}</p>}
      </div>

      <div className="mt-4 flex flex-col items-start gap-2 font-sans text-sm">
        <button type="button" className="link" onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}>
          {mode === "signIn" ? m.auth.toSignUp : m.auth.toSignIn}
        </button>
        {mode === "signIn" && (
          <button
            type="button"
            className="link"
            disabled={busy || !email}
            onClick={() =>
              void run(async () => {
                const { auth, sendPasswordResetEmail } = await loadFirebase();
                await sendPasswordResetEmail(auth, email).catch(() => undefined);
                setNotice(m.auth.resetSent);
              })
            }
          >
            {m.auth.forgot}
          </button>
        )}
      </div>
      <p className="mt-5 text-xs text-muted">
        {m.auth.privacy}{" "}
        <a className="link" href={locale === "es" ? "/privacidad/" : "/en/privacy/"}>
          {m.footer.privacy}
        </a>
      </p>
    </dialog>
  );
}
