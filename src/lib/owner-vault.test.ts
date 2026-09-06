import { describe, expect, it } from "vitest";
import { evaluateLandSecurity, getDefaultOwnerVaultDocuments } from "./owner-vault";

describe("owner-vault", () => {
  it("evaluates high security when all mandatory land documents exist", () => {
    const docs = getDefaultOwnerVaultDocuments();
    const evaluation = evaluateLandSecurity(docs);

    expect(evaluation.scorePercent).toBe(100);
    expect(evaluation.securityLevel).toBe("excellent");
    expect(evaluation.advice).toContain("sécurisée");
  });

  it("identifies missing critical documents", () => {
    const docs = getDefaultOwnerVaultDocuments().map((d) =>
      d.category === "titre_foncier" ? { ...d, isUploaded: false } : d,
    );
    const evaluation = evaluateLandSecurity(docs);

    expect(evaluation.scorePercent).toBeLessThan(100);
    expect(evaluation.securityLevel).not.toBe("excellent");
  });
});
