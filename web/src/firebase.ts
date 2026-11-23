import type { User } from "firebase/auth";
import { useEffect, useState } from "react";

export interface SealResponse {
  transaction: `0x${string}`;
}
export interface MySeal {
  hash: `0x${string}`;
  transaction: `0x${string}`;
  network: string;
  createdAt: string;
}

/** Límite de sellos por usuario y día (debe coincidir con SELLO_USER_DAILY_LIMIT de functions/.env). */
export const USER_DAILY_LIMIT = 5;

type Sdk = typeof import("./firebase-sdk.ts");
let sdk: Promise<Sdk> | null = null;

/** Carga el SDK de Firebase una sola vez y bajo demanda. */
export function loadFirebase(): Promise<Sdk> {
  sdk ??= import("./firebase-sdk.ts");
  return sdk;
}

/** Código de error de Firebase (auth/…, functions/…) sin importar el SDK para el `instanceof`. */
export function firebaseErrorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
}

/**
 * Usuario actual; `undefined` mientras se carga Firebase y se decide si hay sesión.
 * El SDK se pide cuando el navegador queda libre, después del primer pintado.
 * Firebase actualiza el mismo objeto User al recargarlo (p. ej., tras verificar el correo), así que
 * además de la sesión se escuchan los cambios de token y se fuerza el repintado.
 */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let off = () => {};
    const start = () =>
      void loadFirebase().then(({ auth, onAuthStateChanged, onIdTokenChanged }) => {
        if (cancelled) return;
        const offAuth = onAuthStateChanged(auth, setUser);
        const offToken = onIdTokenChanged(auth, () => setTick((n) => n + 1));
        off = () => {
          offAuth();
          offToken();
        };
      });
    const idle =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback(start, { timeout: 2500 })
        : setTimeout(start, 200);
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle as number);
      else clearTimeout(idle as ReturnType<typeof setTimeout>);
      off();
    };
  }, []);
  return user;
}
