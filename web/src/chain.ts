import { DEFAULT_NETWORK, createReader } from "@sello/core";

/** Red del demostrador y cliente de lectura: el navegador consulta la cadena directamente. */
export const network = DEFAULT_NETWORK;
export const reader = createReader(network);
