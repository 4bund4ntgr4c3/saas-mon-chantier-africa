import { describe, expect, it } from "vitest";
import { createSignatureMetadata } from "./signature";

describe("createSignatureMetadata", () => {
  it("creates valid signature metadata with unique hash", () => {
    const meta = createSignatureMetadata("M. Dossou", "client", "PV Réception Dalle RDC");

    expect(meta.signerName).toBe("M. Dossou");
    expect(meta.signerRole).toBe("client");
    expect(meta.documentTitle).toBe("PV Réception Dalle RDC");
    expect(meta.hash).toMatch(/^SIG-/);
    expect(meta.timestamp).toBeDefined();
  });
});
