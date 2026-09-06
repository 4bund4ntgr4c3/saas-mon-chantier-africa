import { describe, expect, it } from "vitest";
import { calculateRainwaterCapacity } from "./rainwater-harvesting";

describe("rainwater-harvesting", () => {
  it("calculates realistic rainwater potential for a 150m² roof in Cotonou", () => {
    const res = calculateRainwaterCapacity({
      roofSurfaceM2: 150,
      roofType: "bac_alu",
      zone: "cotonou_calavi",
      householdMembersCount: 5,
    });

    // 150m² * 1300mm * 0.9 = 175 500 Litres / an
    expect(res.annualHarvestableLiters).toBe(175500);
    expect(res.recommendedTankSizeLiters).toBeGreaterThanOrEqual(3000);
    expect(res.autonomyDaysWithoutSoneb).toBeGreaterThan(10);
    expect(res.annualSonebSavingsFcfa).toBeGreaterThan(50000);
  });
});
