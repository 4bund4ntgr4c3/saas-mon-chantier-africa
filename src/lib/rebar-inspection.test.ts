import { describe, expect, it } from "vitest";
import { evaluateRebarCompliance } from "./rebar-inspection";

describe("rebar-inspection", () => {
  it("validates compliant HA12 rebars with 5cm cover in coastal zone", () => {
    const res = evaluateRebarCompliance({
      rebarDiameterMm: 12,
      isCoastalMarineZone: true,
      measuredOverlapLengthCm: 50, // 40*12mm = 48cm -> 50cm est ok
      measuredCoverThicknessCm: 5,
      spacersPerM2Count: 5,
    });

    expect(res.requiredOverlapLengthCm).toBe(48);
    expect(res.requiredCoverThicknessCm).toBe(5);
    expect(res.overallCompliant).toBe(true);
    expect(res.verdict).toContain("conforme");
  });

  it("detects non-compliant cover in marine zone", () => {
    const res = evaluateRebarCompliance({
      rebarDiameterMm: 12,
      isCoastalMarineZone: true,
      measuredOverlapLengthCm: 50,
      measuredCoverThicknessCm: 2, // 2cm au lieu de 5cm en bord de mer
      spacersPerM2Count: 5,
    });

    expect(res.isCoverCompliant).toBe(false);
    expect(res.overallCompliant).toBe(false);
    expect(res.verdict).toContain("Enrobage insuffisant");
  });
});
