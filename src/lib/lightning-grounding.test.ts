import { describe, expect, it } from "vitest";
import { calculateGroundingResistance } from "./lightning-grounding";

describe("lightning-grounding", () => {
  it("calculates strict compliant grounding with loop and 2 copper rods", () => {
    const res = calculateGroundingResistance({
      groundType: "terre_de_barre",
      hasFoundationLoop: true,
      foundationLoopLengthMeters: 40,
      copperRodsCount: 2,
    });

    // rLoop = (2*120)/40 = 6 Ohms, rRods = 120/4 = 30 Ohms -> // = 5 Ohms (< 10)
    expect(res.estimatedResistanceOhms).toBeLessThan(10);
    expect(res.isCompliantStrict).toBe(true);
    expect(res.isCompliantStandard).toBe(true);
    expect(res.verdict).toContain("Excellente");
  });

  it("warns about insufficient grounding when no loop is present on dry sand", () => {
    const res = calculateGroundingResistance({
      groundType: "sable_sec_littoral",
      hasFoundationLoop: false,
      foundationLoopLengthMeters: 0,
      copperRodsCount: 1, // 300 / 2 = 150 Ohms (> 100)
    });

    expect(res.isCompliantStandard).toBe(false);
    expect(res.verdict).toContain("non conforme");
  });
});
