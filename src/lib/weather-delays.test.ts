import { describe, expect, it } from "vitest";
import { computeWeatherDelayExtension, getDefaultWeatherStoppages } from "./weather-delays";

describe("weather-delays", () => {
  it("extends completion date by 3 days when 24 hours of stoppages are recorded", () => {
    const stoppages = getDefaultWeatherStoppages();
    const result = computeWeatherDelayExtension(stoppages, "2026-12-01", 50000);

    expect(result.totalLostDays).toBe(3);
    expect(result.totalLostHours).toBe(24);
    expect(result.newDeliveryDateStr).toBe("2026-12-04");
    expect(result.savedPenaltiesFcfa).toBe(150000);
  });
});
