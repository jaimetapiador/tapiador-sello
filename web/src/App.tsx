import { useState } from "react";
import { About } from "./components/About.tsx";
import { AuthDialog } from "./components/AuthDialog.tsx";
import { Footer } from "./components/Footer.tsx";
import { Header } from "./components/Header.tsx";
import { Hero } from "./components/Hero.tsx";
import { MySeals } from "./components/MySeals.tsx";
import { Privacy } from "./components/Privacy.tsx";
import { ResultPanel } from "./components/ResultPanel.tsx";
import { TryPanel } from "./components/TryPanel.tsx";
import { useUser } from "./firebase.ts";
import { useI18n } from "./i18n.tsx";
import type { Subject } from "./subject.ts";

export function App({ page }: { page: "home" | "privacy" }) {
  const { m } = useI18n();
  const user = useUser();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [sealsVersion, setSealsVersion] = useState(0);
  const openAuth = () => setAuthOpen(true);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-primary">
        {m.meta.skip}
      </a>
      <Header user={user} onSignIn={openAuth} />
      <main id="main">
        {page === "privacy" ? (
          <Privacy />
        ) : (
          <>
            <Hero />
            <TryPanel onSubject={setSubject} />
            {subject && (
              <ResultPanel
                subject={subject}
                user={user}
                onSignIn={openAuth}
                onSealed={() => setSealsVersion((v) => v + 1)}
              />
            )}
            {user && <MySeals user={user} version={sealsVersion} />}
            <About />
          </>
        )}
      </main>
      <Footer />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
