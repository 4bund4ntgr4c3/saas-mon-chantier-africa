import { describe, expect, it } from "vitest";
import { calculateCarbonFootprint } from "./carbon-footprint";

describe("calculateCarbonFootprint", () => {
  it("calculates emissions correctly for a standard villa construction", () => {
    // 500 sacs de ciment, 4 tonnes d'acier, 300 km transport, 100 L gasoil
    const res = calculateCarbonFootprint({
      cementBags50kg: 500,
      steelTons: 4,
      transportKmTotal: 300,
      dieselLiters: 100,
    });

    expect(res.cementEmissionsTons).toBe(20.5);
    expect(res.steelEmissionsTons).toBe(7.4);
    expect(res.totalEmissionsTons).toBeGreaterThan(25);
    expect(res.treesEquivalentToOffset).toBeGreaterThan(1000);
  });
});
