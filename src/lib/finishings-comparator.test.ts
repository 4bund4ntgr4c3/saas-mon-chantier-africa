import { describe, expect, it } from "vitest";
import { computeTotalFinishingBudget, getDefaultFinishingOptions } from "./finishings-comparator";

describe("finishings-comparator", () => {
  it("calculates realistic finishing budgets across Eco, Standard and Luxe tiers", () => {
    const options = getDefaultFinishingOptions();
    const totals = computeTotalFinishingBudget(options);

    expect(totals.totalEcoFcfa).toBeGreaterThan(1500000);
    expect(totals.totalStandardFcfa).toBeGreaterThan(totals.totalEcoFcfa);
    expect(totals.totalLuxeFcfa).toBeGreaterThan(totals.totalStandardFcfa);
    expect(totals.totalEstimatedFcfa).toBe(totals.totalStandardFcfa);
  });
});
