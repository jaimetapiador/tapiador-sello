import type { Hash, SealReceipt } from "@sello/core";

/** Lo que el visitante quiere comprobar (y, si no consta, sellar). */
export type Subject =
  | { readonly kind: "document"; readonly hash: Hash; readonly label: string }
  | { readonly kind: "hash"; readonly hash: Hash }
  | { readonly kind: "receipt"; readonly receipt: SealReceipt; readonly documentHash?: Hash };

export function subjectHash(subject: Subject): Hash {
  return subject.kind === "receipt" ? subject.receipt.hash : subject.hash;
}
