import { explorerUrl, type Hash } from "@sello/core";
import { network } from "../chain.ts";
import { useI18n } from "../i18n.tsx";
import { CopyButton, ExternalLink } from "./ui.tsx";

/** Ayuda para comprobar el sello sin esta web: explorador, registro y cálculo propio de la huella. */
export function ExternalVerify({ hash, transaction }: { hash: Hash; transaction: `0x${string}` | null }) {
  const { m } = useI18n();
  return (
    <details className="mt-8 border-t border-line/60 pt-5">
      <summary className="cursor-pointer font-sans text-strong">{m.verify.title}</summary>
      <p className="mt-3 max-w-prose">{m.verify.intro}</p>
      <ul className="mt-3 space-y-2">
        {transaction && (
          <li>
            <ExternalLink href={explorerUrl.transaction(network, transaction)}>{m.verify.explorerTx}</ExternalLink>
          </li>
        )}
        <li>
          <ExternalLink href={explorerUrl.registry(network)}>{m.verify.explorerRegistry}</ExternalLink>
        </li>
      </ul>
      <div className="mt-4">
        <CopyButton text={hash} />
      </div>
      <p className="mt-5 font-sans text-sm text-strong">{m.verify.commandsTitle}</p>
      <dl className="mt-2 space-y-3 text-sm">
        <div>
          <dt className="label text-muted">{m.verify.linux}</dt>
          <dd>
            <code className="hash mt-1 block rounded-sm bg-bg px-3 py-2">sha256sum documento</code>
          </dd>
        </div>
        <div>
          <dt className="label text-muted">{m.verify.windows}</dt>
          <dd>
            <code className="hash mt-1 block rounded-sm bg-bg px-3 py-2">(Get-FileHash documento -Algorithm SHA256).Hash.ToLower()</code>
          </dd>
        </div>
      </dl>
    </details>
  );
}
