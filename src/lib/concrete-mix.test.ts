import { describe, expect, it } from "vitest";
import { calculateConcreteBatchMaterials, CONCRETE_RECIPES } from "./concrete-mix";

describe("concrete-mix", () => {
  it("calculates accurate dosage for 10m³ of B25 structural concrete", () => {
    const res = calculateConcreteBatchMaterials(10, "B25");

    // 10m³ * 350 kg/m³ * 1.05 = 3675 kg -> 74 sacs de 50kg
    expect(res.cementBags50kg).toBe(74);
    expect(res.sandM3).toBeGreaterThan(4);
    expect(res.gravelM3).toBeGreaterThan(8);
    expect(res.waterLiters).toBeGreaterThan(1500);
    expect(res.recommendations.length).toBeGreaterThan(0);
  });

  it("provides correct target strength for B30", () => {
    expect(CONCRETE_RECIPES.B30.targetStrength28DaysMpa).toBe(30);
  });
});
