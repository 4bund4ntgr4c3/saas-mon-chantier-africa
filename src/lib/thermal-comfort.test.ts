import { describe, expect, it } from "vitest";
import { simulateTropicalThermalComfort } from "./thermal-comfort";

describe("thermal-comfort", () => {
  it("shows superior thermal phase shift and AC energy savings for BTC material", () => {
    const res = simulateTropicalThermalComfort("btc_terre_stabilisee", true, true, 400000);

    expect(res.thermalPhaseShiftHours).toBe(11);
    expect(res.indoorTemperatureDropCelsius).toBeGreaterThanOrEqual(5.0);
    expect(res.acEnergySavingPercent).toBe(60); // 35 + 10 + 15 = 60%
    expect(res.annualSavingsFcfa).toBe(240000);
    expect(res.passiveDesignAdvices.length).toBeGreaterThan(0);
  });
});
