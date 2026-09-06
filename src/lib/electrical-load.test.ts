import { describe, expect, it } from "vitest";
import { calculateElectricalLoadAndService } from "./electrical-load";

describe("electrical-load", () => {
  it("calculates single-phase 60A subscription for a moderate 2-AC villa", () => {
    const res = calculateElectricalLoadAndService({
      airConditionersCount: 2,
      waterHeatersCount: 1,
      electricOvenOrCooktop: false,
      waterBoosterPump: true,
      lightingAndSocketsAreaM2: 120,
      cableDistanceToPoleMeters: 25,
    });

    expect(res.totalInstalledPowerWatts).toBeGreaterThan(7000);
    expect(res.apparentPowerKva).toBeGreaterThan(6);
    expect(res.recommendedServiceType).toBe("monophase_60A");
    expect(res.recommendedCableSectionMm2).toBeGreaterThanOrEqual(10);
    expect(res.voltageDropPercent).toBeLessThan(3.0);
  });

  it("recommends triphase for large residence with 8 ACs", () => {
    const res = calculateElectricalLoadAndService({
      airConditionersCount: 8,
      waterHeatersCount: 4,
      electricOvenOrCooktop: true,
      waterBoosterPump: true,
      lightingAndSocketsAreaM2: 350,
      cableDistanceToPoleMeters: 60,
    });

    expect(res.apparentPowerKva).toBeGreaterThan(18);
    expect(res.recommendedServiceType).toBe("triphase_60A");
    expect(res.recommendedCableSectionMm2).toBe(25);
  });
});
