import {
  FileTooLargeError,
  InvalidReceiptError,
  MAX_FILE_BYTES,
  hashFile,
  normalizeHash,
  parseReceipt,
  sha256,
  type Hash,
  type SealReceipt,
} from "@sello/core";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "../i18n.tsx";
import { SAMPLE_IDS, sampleFileName, sampleText, type SampleId } from "../samples.ts";
import type { Subject } from "../subject.ts";
import { SectionLabel, downloadText } from "./ui.tsx";

type Tab = "file" | "samples" | "hash";
const TABS: readonly Tab[] = ["file", "samples", "hash"];

export function TryPanel({ onSubject }: { onSubject: (subject: Subject | null) => void }) {
  const { m } = useI18n();
  const id = useId();
  const [tab, setTab] = useState<Tab>("samples");
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ file: null, samples: null, hash: null });

  // Navegación con flechas entre pestañas (patrón ARIA de tabs).
  function onTabKey(event: KeyboardEvent) {
    const i = TABS.indexOf(tab);
    const next =
      event.key === "ArrowRight" ? TABS[(i + 1) % TABS.length] : event.key === "ArrowLeft" ? TABS[(i + TABS.length - 1) % TABS.length] : null;
    if (!next) return;
    event.preventDefault();
    setTab(next);
    onSubject(null);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="mx-auto max-w-content px-4 py-10 sm:px-8" aria-labelledby={`${id}-title`}>
      <SectionLabel>{m.try.label}</SectionLabel>
      <h2 id={`${id}-title`} className="mt-3 text-h2">
        {m.try.title}
      </h2>

      <div role="tablist" aria-label={m.try.title} className="mt-6 flex flex-wrap gap-2 font-sans text-sm" onKeyDown={onTabKey}>
        {TABS.map((t) => (
          <button
            key={t}
            ref={(el) => {
              tabRefs.current[t] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`${id}-panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              if (t !== tab) onSubject(null);
              setTab(t);
            }}
          >
            {m.try.tabs[t]}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${id}-panel-${tab}`} aria-labelledby={`${id}-tab-${tab}`} className="panel mt-4 p-4 sm:p-6">
        {tab === "file" && <FileTab onSubject={onSubject} />}
        {tab === "samples" && <SamplesTab onSubject={onSubject} />}
        {tab === "hash" && <HashTab onSubject={onSubject} />}
      </div>
    </section>
  );
}

function FileTab({ onSubject }: { onSubject: (s: Subject | null) => void }) {
  const { m, fill, bytes } = useI18n();
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    setName(file.name);
    setBusy(true);
    onSubject(null);
    try {
      const hash = await hashFile(file);
      onSubject({ kind: "document", hash, label: file.name });
    } catch (e) {
      setError(
        e instanceof FileTooLargeError
          ? fill(m.file.tooLarge, { size: bytes(e.size), max: bytes(e.maxBytes) })
          : m.auth.errors.generic,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`rounded-md border border-dashed p-8 text-center transition-colors ${dragging ? "border-accent bg-surface/40" : "border-line-strong"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handle(e.dataTransfer.files[0]);
      }}
    >
      <p className="font-sans text-strong">{m.file.drop}</p>
      <p className="my-2 text-sm text-muted">{m.file.or}</p>
      <label htmlFor={inputId} className="btn btn-primary cursor-pointer">
        {m.file.choose}
      </label>
      <input id={inputId} type="file" className="sr-only" onChange={(e) => void handle(e.target.files?.[0])} />
      <p className="mt-4 text-sm text-muted">{fill(m.file.hint, { max: bytes(MAX_FILE_BYTES) })}</p>
      <div aria-live="polite" className="mt-3 font-sans text-sm">
        {busy && <p>{m.file.reading}</p>}
        {!busy && name && !error && (
          <p>
            {m.file.selected}: <span className="text-strong">{name}</span>
          </p>
        )}
        {error && <p className="text-danger-text">{error}</p>}
      </div>
    </div>
  );
}

function SamplesTab({ onSubject }: { onSubject: (s: Subject | null) => void }) {
  const { m, locale } = useI18n();
  const textId = useId();
  const [sample, setSample] = useState<SampleId>("acta");
  const original = sampleText(locale, sample);
  const [text, setText] = useState(original);
  const edited = text !== original;

  // Recalcula la huella al escribir, con una pequeña espera para no consultar la red a cada tecla.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const hash = await sha256(text);
      if (!cancelled) {
        onSubject({
          kind: "document",
          hash,
          label: `${m.samples.names[sample]} · ${edited ? m.samples.edited : m.samples.original}`,
        });
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, sample, edited, m, onSubject]);

  return (
    <div>
      <p className="max-w-prose">{m.samples.intro}</p>
      <fieldset className="mt-5 flex flex-wrap gap-2 font-sans text-sm">
        <legend className="sr-only">{m.try.tabs.samples}</legend>
        {SAMPLE_IDS.map((sid) => (
          <button
            key={sid}
            type="button"
            aria-pressed={sample === sid}
            className={`btn ${sample === sid ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              setSample(sid);
              setText(sampleText(locale, sid));
            }}
          >
            {m.samples.names[sid]}
          </button>
        ))}
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={textId} className="label text-muted">
          {m.samples.editLabel}
        </label>
        <span className={`label ${edited ? "text-accent-2" : "text-accent"}`} aria-live="polite">
          {edited ? m.samples.edited : m.samples.original}
        </span>
      </div>
      <textarea
        id={textId}
        className="field mt-2 min-h-72 font-mono text-sm leading-relaxed"
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" disabled={!edited} onClick={() => setText(original)}>
          {m.samples.restore}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => downloadText(sampleFileName(locale, sample), text)}>
          {m.samples.download}
        </button>
      </div>
    </div>
  );
}

function HashTab({ onSubject }: { onSubject: (s: Subject | null) => void }) {
  const { m, fill } = useI18n();
  const hashId = useId();
  const receiptId = useId();
  const docId = useId();
  const [value, setValue] = useState("");
  const [hashError, setHashError] = useState(false);
  const [receipt, setReceipt] = useState<SealReceipt | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [docHash, setDocHash] = useState<Hash | undefined>(undefined);

  useEffect(() => {
    if (receipt) onSubject(docHash ? { kind: "receipt", receipt, documentHash: docHash } : { kind: "receipt", receipt });
  }, [receipt, docHash, onSubject]);

  async function readReceipt(file: File | undefined) {
    if (!file) return;
    setReceiptError(null);
    try {
      setReceipt(parseReceipt(JSON.parse(await file.text())));
    } catch (e) {
      setReceipt(null);
      onSubject(null);
      const detail = e instanceof InvalidReceiptError ? e.message : "JSON";
      setReceiptError(fill(m.hashInput.receiptInvalid, { detail }));
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const hash = normalizeHash(value);
          setHashError(!hash);
          onSubject(hash ? { kind: "hash", hash } : null);
        }}
      >
        <label htmlFor={hashId} className="font-sans text-sm text-strong">
          {m.hashInput.hashLabel}
        </label>
        <input
          id={hashId}
          className="field mt-2 font-mono text-sm"
          placeholder={m.hashInput.hashPlaceholder}
          value={value}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={hashError}
          aria-describedby={hashError ? `${hashId}-error` : undefined}
          onChange={(e) => setValue(e.target.value)}
        />
        {hashError && (
          <p id={`${hashId}-error`} className="mt-2 font-sans text-sm text-danger-text">
            {m.hashInput.hashInvalid}
          </p>
        )}
        <button type="submit" className="btn btn-primary mt-3">
          {m.hashInput.check}
        </button>
      </form>

      <div>
        <p className="font-sans text-sm text-strong">{m.hashInput.receiptLabel}</p>
        <p className="mt-1 text-sm text-muted">{m.hashInput.receiptHint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <label htmlFor={receiptId} className="btn btn-ghost cursor-pointer">
            {m.hashInput.receiptChoose}
          </label>
          <input
            id={receiptId}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void readReceipt(e.target.files?.[0])}
          />
          <label htmlFor={docId} className="btn btn-ghost cursor-pointer">
            {m.hashInput.documentChoose}
          </label>
          <input
            id={docId}
            type="file"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              setDocHash(file ? await hashFile(file).catch(() => undefined) : undefined);
            }}
          />
        </div>
        {receiptError && <p className="mt-2 font-sans text-sm text-danger-text">{receiptError}</p>}
      </div>
    </div>
  );
}
