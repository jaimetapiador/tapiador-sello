import { useState, type ReactNode } from "react";
import { useI18n } from "../i18n.tsx";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="label text-accent-2">{children}</p>;
}

export function CopyButton({ text }: { text: string }) {
  const { m } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Sin permiso de portapapeles: la huella sigue visible y se puede seleccionar a mano.
        }
      }}
    >
      <span aria-live="polite">{copied ? m.verify.copied : m.verify.copy}</span>
    </button>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

/** Descarga un texto como fichero sin pasar por ningún servidor. */
export function downloadText(fileName: string, text: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Recorta una huella para listados: «0x9f3a1c…e04b». */
export function shortHash(hash: string, head = 8, tail = 6): string {
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}
