import { describe, expect, it } from "vitest";
import { compareRentalStrategies } from "./rental-cashflow";

describe("rental-cashflow", () => {
  it("calculates higher gross and net revenues for furnished rentals in touristic areas", () => {
    const comparison = compareRentalStrategies({
      propertyAcquisitionCostFcfa: 40000000,
      unfurnishedMonthlyRentFcfa: 250000,
      furnishedNightlyRateFcfa: 35000,
      furnishedOccupancyRatePercent: 60, // 18 nuits -> 630 000 FCFA brut/mois
    });

    expect(comparison.furnished.grossAnnualFcfa).toBeGreaterThan(
      comparison.unfurnished.grossAnnualFcfa,
    );
    expect(comparison.furnished.netMonthlyCashflowFcfa).toBeGreaterThan(
      comparison.unfurnished.netMonthlyCashflowFcfa,
    );
    expect(comparison.recommendedStrategy).toBe("meuble");
  });
});
