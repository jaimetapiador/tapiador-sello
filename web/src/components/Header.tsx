import { signOut, type User } from "firebase/auth";
import { auth } from "../firebase.ts";
import { useI18n } from "../i18n.tsx";

export function Header({ user, onSignIn }: { user: User | null | undefined; onSignIn: () => void }) {
  const { m, locale } = useI18n();
  return (
    <header className="border-b border-line/50">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
        <a href={locale === "es" ? "/" : "/en/"} className="group flex flex-col">
          <span className="font-sans text-lg font-semibold text-strong">{m.meta.site}</span>
          <span className="label text-muted">{m.meta.by}</span>
        </a>
        <nav className="flex flex-wrap items-center gap-3 font-sans text-sm" aria-label={m.header.account}>
          <a
            className="link"
            href={m.header.otherLanguageHref}
            hrefLang={locale === "es" ? "en" : "es"}
            lang={locale === "es" ? "en" : "es"}
          >
            {m.header.otherLanguage}
          </a>
          {user === undefined ? null : user ? (
            <>
              <span className="max-w-[16rem] truncate text-muted" title={user.email ?? undefined}>
                {user.email}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => signOut(auth)}>
                {m.header.signOut}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={onSignIn}>
              {m.header.signIn}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
