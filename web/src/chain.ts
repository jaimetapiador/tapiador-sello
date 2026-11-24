import { DEFAULT_NETWORK, createReader } from "@sello/core";

/** Red de la demo y cliente de lectura: el navegador consulta la cadena directamente. */
export const network = DEFAULT_NETWORK;
export const reader = createReader(network);
