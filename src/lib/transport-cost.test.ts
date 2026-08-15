import { describe, expect, it } from "vitest";
import { calculateTransportCost } from "./transport-cost";

describe("calculateTransportCost", () => {
  it("calculates roundtrip transport cost with unloading labor", () => {
    // Benne 6 roues : 25 000 base + (15km * 2 * 800) = 24 000 + 5 000 manutention = 54 000 FCFA
    const result = calculateTransportCost("benne_6_roues", 15, 1, true);

    expect(result.baseFareFcfa).toBe(25000);
    expect(result.distanceCostFcfa).toBe(24000);
    expect(result.unloadingLaborFcfa).toBe(5000);
    expect(result.totalTransportCostFcfa).toBe(54000);
  });
});
