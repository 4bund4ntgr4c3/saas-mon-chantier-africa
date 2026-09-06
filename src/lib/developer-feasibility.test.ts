import { describe, expect, it } from "vitest";
import { calculateDeveloperFeasibility } from "./developer-feasibility";

describe("calculateDeveloperFeasibility", () => {
  it("calculates accurate margin and ROI for a 120M FCFA real estate project", () => {
    const result = calculateDeveloperFeasibility({
      landCostFcfa: 25000000,
      studiesAndPermitsFcfa: 5000000,
      constructionCostFcfa: 55000000,
      contingencyPercent: 5,
      commercializationCostFcfa: 3000000,
      totalSalesRevenueFcfa: 120000000,
      durationMonths: 18,
    });

    expect(result.totalExpenditureFcfa).toBe(90750000);
    expect(result.grossMarginFcfa).toBe(29250000);
    expect(result.netMarginPercent).toBe(24.4);
    expect(result.returnOnInvestmentPercent).toBeGreaterThan(30);
    expect(result.isFinanciallyViable).toBe(true);
  });
});
