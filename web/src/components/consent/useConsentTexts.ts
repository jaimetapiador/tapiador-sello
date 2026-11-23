import { CONSENT_TEXTS } from "../../consent/texts.ts";
import { useI18n } from "../../i18n.tsx";

export function useConsentTexts() {
  return CONSENT_TEXTS[useI18n().locale];
}
