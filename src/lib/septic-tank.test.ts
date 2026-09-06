import { describe, expect, it } from "vitest";
import { sizeSepticSanitation } from "./septic-tank";

describe("septic-tank", () => {
  it("sizes a 3m³ septic tank for a family of 5 in sandy permeable soil", () => {
    const res = sizeSepticSanitation({
      occupantsCount: 5,
      hasGreaseTrap: true,
      soilPermeability: "sable_permeable",
      isHighWaterTable: false,
    });

    expect(res.septicTankVolumeM3).toBe(3.0);
    expect(res.septicTankDimensions.lengthM).toBeGreaterThan(1.5);
    expect(res.greaseTrapVolumeLiters).toBe(200);
    expect(res.isSoakawayFeasible).toBe(true);
  });

  it("increases volume for 8 occupants and flags high water table risk", () => {
    const res = sizeSepticSanitation({
      occupantsCount: 8,
      hasGreaseTrap: true,
      soilPermeability: "sable_permeable",
      isHighWaterTable: true,
    });

    expect(res.septicTankVolumeM3).toBe(4.5);
    expect(res.greaseTrapVolumeLiters).toBe(500);
    expect(res.isSoakawayFeasible).toBe(false);
    expect(res.recommendations[0]).toContain("ATTENTION");
  });
});
