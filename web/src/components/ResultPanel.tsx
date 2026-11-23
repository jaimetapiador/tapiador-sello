import {
  buildReceipt,
  explorerUrl,
  findSealTransaction,
  readSeal,
  verifyReceipt,
  type ReceiptCheck,
  type SealConfirmation,
  type SealRecord,
} from "@sello/core";
import type { User } from "firebase/auth";
import { useCallback, useEffect, useId, useState } from "react";
import { network, reader } from "../chain.ts";
import { useI18n } from "../i18n.tsx";
import { subjectHash, type Subject } from "../subject.ts";
import { ExternalVerify } from "./ExternalVerify.tsx";
import { SealBox } from "./SealBox.tsx";
import { SectionLabel, downloadText } from "./ui.tsx";

type Hex = `0x${string}`;

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; record: SealRecord; transaction: Hex | null; check: ReceiptCheck | null };

export function ResultPanel({
  subject,
  user,
  onSignIn,
  onSealed,
}: {
  subject: Subject;
  user: User | null | undefined;
  onSignIn: () => void;
  onSealed: () => void;
}) {
  const { m, fill, date } = useI18n();
  const id = useId();
  const hash = subjectHash(subject);
  const [state, setState] = useState<State>({ status: "loading" });
  const [justSealed, setJustSealed] = useState(false);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    setJustSealed(false);
    try {
      const record = await readSeal(reader, network, hash);
      const transaction = record.sealed ? await findSealTransaction(reader, network, hash, record.blockNumber) : null;
      const check =
        subject.kind === "receipt"
          ? await verifyReceipt(subject.receipt, subject.documentHash ? { documentHash: subject.documentHash } : {})
          : null;
      setState({ status: "ready", record, transaction, check });
    } catch {
      setState({ status: "error" });
    }
  }, [hash, subject]);

  useEffect(() => {
    void load();
  }, [load]);

  function sealed(confirmation: SealConfirmation) {
    setState({
      status: "ready",
      record: {
        sealed: true,
        hash: confirmation.hash,
        sealedAt: confirmation.sealedAt,
        blockNumber: confirmation.blockNumber,
        sealer: confirmation.sealer,
      },
      transaction: confirmation.transaction,
      check: null,
    });
    setJustSealed(true);
    onSealed();
  }

  return (
    <section className="mx-auto max-w-content px-4 py-10 sm:px-8" aria-labelledby={`${id}-title`}>
      <SectionLabel>{m.result.label}</SectionLabel>
      <div className="panel mt-4 p-4 sm:p-6">
        {subject.kind === "document" && <p className="font-sans text-sm text-muted">{subject.label}</p>}
        <h2 id={`${id}-title`} className="label mt-2 text-muted">
          {m.result.fingerprint}
        </h2>
        <p className="hash mt-1 text-sm text-strong sm:text-base">{hash}</p>

        <div aria-live="polite" className="mt-6">
          {state.status === "loading" && <p className="font-sans">{m.result.checking}</p>}

          {state.status === "error" && (
            <div>
              <p className="text-danger-text">{m.result.networkError}</p>
              <button type="button" className="btn btn-ghost mt-3" onClick={() => void load()}>
                {m.result.retry}
              </button>
            </div>
          )}

          {state.status === "ready" && state.check && <ReceiptVerdict check={state.check} withDocument={subject.kind === "receipt" && !!subject.documentHash} />}

          {state.status === "ready" && state.record.sealed && (
            <SealedView record={state.record} transaction={state.transaction} justSealed={justSealed} />
          )}

          {state.status === "ready" && !state.record.sealed && (
            <div>
              <p className="text-h3 text-accent-2">{m.result.notSealedTitle}</p>
              <p className="mt-2 max-w-prose">{m.result.notSealedText}</p>
              {subject.kind !== "receipt" && <SealBox hash={hash} user={user} onSignIn={onSignIn} onSealed={sealed} />}
            </div>
          )}
        </div>

        {state.status === "ready" && (
          <ExternalVerify hash={hash} transaction={state.record.sealed ? state.transaction : null} />
        )}
      </div>
    </section>
  );
}

function SealedView({
  record,
  transaction,
  justSealed,
}: {
  record: Extract<SealRecord, { sealed: true }>;
  transaction: Hex | null;
  justSealed: boolean;
}) {
  const { m, fill, date } = useI18n();
  const isDemo = record.sealer.toLowerCase() === network.demoSealer.toLowerCase();
  return (
    <div>
      <p className="text-h3 text-accent">{m.result.sealedTitle}</p>
      {justSealed && <p className="mt-2 max-w-prose text-strong">{m.seal.done}</p>}
      <p className="mt-2 max-w-prose">{fill(m.result.sealedText, { date: date(record.sealedAt) })}</p>
      <dl className="mt-4 grid gap-x-6 gap-y-2 font-sans text-sm sm:grid-cols-[max-content_1fr]">
        <dt className="text-muted">{m.result.block}</dt>
        <dd>
          <a className="link" href={explorerUrl.block(network, record.blockNumber)} target="_blank" rel="noopener noreferrer">
            {record.blockNumber.toString()}
          </a>
        </dd>
        <dt className="text-muted">{m.result.sealer}</dt>
        <dd className="hash">
          {record.sealer} <span className="text-muted">({isDemo ? m.result.demoSealer : m.result.otherSealer})</span>
        </dd>
        {transaction && (
          <>
            <dt className="text-muted">{m.result.transaction}</dt>
            <dd className="hash">
              <a className="link" href={explorerUrl.transaction(network, transaction)} target="_blank" rel="noopener noreferrer">
                {transaction}
              </a>
            </dd>
          </>
        )}
      </dl>
      {transaction && (
        <button
          type="button"
          className={`btn mt-5 ${justSealed ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            const receipt = buildReceipt(network, { ...record, transaction });
            downloadText(`recibo-sello-${record.hash.slice(2, 10)}.json`, `${JSON.stringify(receipt, null, 2)}\n`, "application/json");
          }}
        >
          {m.result.downloadReceipt}
        </button>
      )}
    </div>
  );
}

function ReceiptVerdict({ check, withDocument }: { check: ReceiptCheck; withDocument: boolean }) {
  const { m } = useI18n();
  return (
    <p className={`mb-4 font-sans ${check.ok ? "text-accent" : "text-danger-text"}`}>
      {check.ok ? (withDocument ? m.receiptCheck.validForDocument : m.receiptCheck.valid) : m.receiptCheck.reasons[check.reason]}
    </p>
  );
}

