import { describe, expect, it } from "vitest";
import { canonicalize, documentFingerprint, formatFingerprint } from "./esign";

describe("canonicalize", () => {
  it("est indépendant de l'ordre des clés", () => {
    expect(canonicalize({ a: 1, b: 2 })).toBe(canonicalize({ b: 2, a: 1 }));
  });

  it("diffère sur les valeurs", () => {
    expect(canonicalize({ a: 1 })).not.toBe(canonicalize({ a: 2 }));
  });

  it("ignore les clés undefined et gère l'imbrication", () => {
    expect(canonicalize({ a: undefined, b: { c: 1 } })).toBe(canonicalize({ b: { c: 1 } }));
    expect(canonicalize({ b: { c: 1, d: [1, 2] } })).not.toBe(
      canonicalize({ b: { c: 1, d: [2, 1] } }),
    );
  });
});

describe("documentFingerprint", () => {
  it("est déterministe pour un contenu identique", async () => {
    const a = await documentFingerprint({ projet: "Villa", montant: 5000000 });
    const b = await documentFingerprint({ montant: 5000000, projet: "Villa" });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9A-F]{16,32}$/);
  });

  it("change si le contenu change", async () => {
    const a = await documentFingerprint({ projet: "Villa", montant: 5000000 });
    const b = await documentFingerprint({ projet: "Villa", montant: 5000001 });
    expect(a).not.toBe(b);
  });
});

describe("formatFingerprint", () => {
  it("découpe par blocs de 4", () => {
    expect(formatFingerprint("ABCDEF12")).toBe("ABCD-EF12");
    expect(formatFingerprint("ABCDEF123")).toBe("ABCD-EF12-3");
  });
});
