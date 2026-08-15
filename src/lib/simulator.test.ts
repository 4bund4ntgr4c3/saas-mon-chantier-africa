import { describe, expect, it } from "vitest";
import { simulateConstructionCost } from "./simulator";

describe("simulateConstructionCost", () => {
  it("calculates total cost and breakdown for a villa basse", () => {
    // 100 m² à 250 000 FCFA/m² = 25 000 000 FCFA
    const result = simulateConstructionCost("villa_basse", "moyen", 100);
    expect(result.totalCostEstimated).toBe(25000000);
    expect(result.breakdown.grosOeuvre).toBe(12000000);
    expect(result.breakdown.secondOeuvre).toBe(6000000);
    expect(result.breakdown.finitions).toBe(5500000);
    expect(result.breakdown.etudesEtPermis).toBe(1500000);
    expect(result.durationMonthsEstimated).toBe(5);
  });

  it("handles minimum surface values gracefully", () => {
    const result = simulateConstructionCost("cloture", "economique", 0);
    expect(result.totalCostEstimated).toBeGreaterThan(0);
    expect(result.durationMonthsEstimated).toBe(1);
  });
});
