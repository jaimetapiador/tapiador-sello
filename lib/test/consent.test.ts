// Núcleo del consentimiento de cookies (adaptado de la skill consentimiento-cookies a node:test y a
// la configuración del sello: una sola categoría opcional, `analytics`).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  NO_CONSENT,
  OPTIONAL_CATEGORIES,
  acceptAll,
  classifyChoices,
  consentConfig,
  decodeConsent,
  deviceFromUserAgent,
  encodeConsent,
  isBot,
  needsBanner,
  parseConsentEvent,
  rejectAll,
  revokedCategories,
  vendorSignature,
  withChoices,
} from "../src/consent/index.ts";

const ID = "0123456789abcdef0123456789abcdef";

describe("consentimiento", () => {
  it("REGLA DURA: sin decisión, todas las opcionales están desactivadas y hay aviso", () => {
    const s = decodeConsent(undefined);
    assert.equal(needsBanner(s), true);
    for (const c of OPTIONAL_CATEGORIES) assert.equal(s.choices[c], false);
    assert.equal(s.choices.necessary, true);
    assert.deepEqual(OPTIONAL_CATEGORIES, ["analytics"]);
  });

  it("aceptar y rechazar todo; las necesarias siempre activas", () => {
    assert.equal(acceptAll().choices.analytics, true);
    assert.equal(rejectAll().choices.analytics, false);
    assert.equal(rejectAll().choices.necessary, true);
  });

  it("la cookie sobrevive a codificar y decodificar", () => {
    const s = withChoices({ analytics: true }, { consentId: ID, now: new Date("2026-11-23T10:00:00Z") });
    const back = decodeConsent(encodeConsent(s));
    assert.deepEqual(back, s);
    assert.equal(needsBanner(back), false);
  });

  it("cookie corrupta o de otra versión → se vuelve a preguntar", () => {
    assert.deepEqual(decodeConsent("basura"), NO_CONSENT);
    const s = acceptAll({ consentId: ID });
    const old = encodeConsent(s).replace(`v${CONSENT_VERSION}.`, "v0-xxxxx.");
    assert.equal(needsBanner(decodeConsent(old)), true);
  });

  it("el consentId se conserva al cambiar de opinión", () => {
    const first = acceptAll({ consentId: ID });
    const second = rejectAll({ consentId: first.consentId });
    assert.equal(second.consentId, ID);
    assert.deepEqual(revokedCategories(first, second), ["analytics"]);
    assert.deepEqual(revokedCategories(second, first), []);
  });

  it("clasifica la decisión", () => {
    assert.equal(classifyChoices({ analytics: true }), "accepted");
    assert.equal(classifyChoices({ analytics: false }), "rejected");
  });

  it("la versión depende de los proveedores opcionales activos", () => {
    const base = [{ id: "google-analytics", category: "analytics", enabled: true }];
    const more = [...base, { id: "otro", category: "analytics", enabled: true }];
    const necessary = [...base, { id: "x", category: "necessary", enabled: true }];
    assert.notEqual(vendorSignature(base), vendorSignature(more));
    assert.equal(vendorSignature(base), vendorSignature(necessary));
    assert.equal(CONSENT_COOKIE, consentConfig.cookieName);
  });

  it("valida los eventos y quita la query de la ruta", () => {
    const ok = parseConsentEvent({
      type: "decision",
      path: "/en/",
      consentId: ID,
      version: CONSENT_VERSION,
      choices: { analytics: true },
      ui: "banner",
      isChange: false,
    });
    assert.equal(ok?.type, "decision");
    assert.deepEqual(parseConsentEvent({ type: "impression", path: "/?email=a@b.c" }), { type: "impression", path: "/" });
    assert.equal(parseConsentEvent({ type: "decision", consentId: "x" }), null);
    assert.equal(parseConsentEvent({ type: "decision", path: "/", consentId: ID, version: "1", choices: {}, ui: "banner", isChange: false }), null);
  });

  it("dispositivo y bots", () => {
    assert.equal(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile"), "mobile");
    assert.equal(deviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140"), "desktop");
    assert.equal(isBot("Googlebot/2.1"), true);
    assert.equal(isBot(""), true);
    assert.equal(isBot("Mozilla/5.0 (Windows NT 10.0) Chrome/140"), false);
  });
});
