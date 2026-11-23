import { explorerUrl } from "@sello/core";
import { network } from "../chain.ts";
import { useI18n } from "../i18n.tsx";

export function Footer() {
  const { m, locale } = useI18n();
  return (
    <footer className="mt-10 border-t border-line/50">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 font-sans text-sm sm:px-8">
        <a className="link" href={locale === "es" ? "https://tapiador.eu/es" : "https://tapiador.eu/en"}>
          {m.footer.home}
        </a>
        <a className="link" href={explorerUrl.address(network, network.registry)} target="_blank" rel="noopener noreferrer">
          {m.footer.contract}
        </a>
        <a className="link" href="https://github.com/jaimetapiador/tapiador-sello" target="_blank" rel="noopener noreferrer">
          {m.footer.code}
        </a>
        <a className="link" href={locale === "es" ? "/privacidad/" : "/en/privacy/"}>
          {m.footer.privacy}
        </a>
      </div>
    </footer>
  );
}
