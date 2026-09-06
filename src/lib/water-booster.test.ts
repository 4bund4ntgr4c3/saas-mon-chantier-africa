import { describe, expect, it } from "vitest";
import { calculateWaterBoosterAndHmt } from "./water-booster";

describe("water-booster", () => {
  it("calculates HMT and tank for R+1 villa with 3 bathrooms", () => {
    const res = calculateWaterBoosterAndHmt({
      buildingHeightMeters: 6,
      bathroomsCount: 3,
      kitchensCount: 1,
      pipeLengthMeters: 40,
      pipeType: "multicouche_pehd",
    });

    expect(res.peakFlowRateLmin).toBeGreaterThan(40);
    expect(res.totalDynamicHeadHmtMce).toBeGreaterThan(25);
    expect(res.totalDynamicHeadHmtBars).toBeGreaterThan(2.5);
    expect(res.recommendedPumpPowerHp).toBeGreaterThanOrEqual(0.75);
    expect(res.recommendedBladderTankVolumeLiters).toBe(200);
    expect(res.recommendations[2]).toContain("SONEB");
  });
});
