import { describe, expect, it } from "vitest";
import { calculateSolarSystem, COMMON_APPLIANCES } from "./solar";

describe("calculateSolarSystem", () => {
  it("calculates solar requirements for typical site appliances", () => {
    const result = calculateSolarSystem(COMMON_APPLIANCES);

    expect(result.totalPowerWatts).toBeGreaterThan(0);
    expect(result.dailyConsumptionWh).toBeGreaterThan(0);
    expect(result.peakSolarPowerWp).toBeGreaterThan(0);
    expect(result.panelsCount450W).toBeGreaterThanOrEqual(1);
    expect(result.batteryCapacityKWh).toBeGreaterThan(0);
    expect(result.inverterPowerKVA).toBeGreaterThan(0);
    expect(result.estimatedCostFcfa).toBeGreaterThan(500000);
  });

  it("handles empty appliances gracefully", () => {
    const result = calculateSolarSystem([]);
    expect(result.totalPowerWatts).toBe(0);
    expect(result.dailyConsumptionWh).toBe(0);
    expect(result.panelsCount450W).toBe(1);
  });
});
