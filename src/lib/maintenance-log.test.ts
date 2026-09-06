import { describe, expect, it } from "vitest";
import { getRecommendedMaintenanceSchedule } from "./maintenance-log";

describe("getRecommendedMaintenanceSchedule", () => {
  it("returns preventive maintenance tasks including roof and septic tank", () => {
    const tasks = getRecommendedMaintenanceSchedule();

    expect(tasks.length).toBeGreaterThanOrEqual(4);
    const roof = tasks.find((t) => t.category === "toiture");
    expect(roof).toBeDefined();
    expect(roof!.estimatedCostFcfa).toBeGreaterThan(0);
    expect(roof!.recommendedSeason).toContain("pluies");
  });
});
