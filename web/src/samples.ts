import type { Locale } from "./i18n.tsx";
import actaEn from "./samples/acta.en.txt?raw";
import actaEs from "./samples/acta.es.txt?raw";
import certificadoEn from "./samples/certificado.en.txt?raw";
import certificadoEs from "./samples/certificado.es.txt?raw";
import resolucionEn from "./samples/resolucion.en.txt?raw";
import resolucionEs from "./samples/resolucion.es.txt?raw";

// Documentos de prueba ficticios. Se sellan con contracts/scripts/sellar.sh antes de publicar:
// si se cambia una sola letra de estos ficheros, hay que volver a sellarlos.
export type SampleId = "acta" | "resolucion" | "certificado";

export const SAMPLE_IDS: readonly SampleId[] = ["acta", "resolucion", "certificado"];

const TEXTS: Record<Locale, Record<SampleId, string>> = {
  es: { acta: actaEs, resolucion: resolucionEs, certificado: certificadoEs },
  en: { acta: actaEn, resolucion: resolucionEn, certificado: certificadoEn },
};

export function sampleText(locale: Locale, id: SampleId): string {
  return TEXTS[locale][id];
}

export function sampleFileName(locale: Locale, id: SampleId): string {
  return `${id}.${locale}.txt`;
}
