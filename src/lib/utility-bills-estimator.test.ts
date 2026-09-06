import { describe, expect, it } from "vitest";
import { estimateMonthlyUtilityBills } from "./utility-bills-estimator";

describe("utility-bills-estimator", () => {
  it("estimates realistic electricity and water bills for a 4-person house with 2 ACs", () => {
    const bills = estimateMonthlyUtilityBills({
      acUnitsCount: 2,
      hasElectricWaterHeater: true,
      hasWaterBoreholePump: false,
      hasSolarHybridKit: false,
      householdMembersCount: 4,
    });

    // 15000 base + 30000 AC + 12000 chauffe-eau = 57000 elec + 10000 water = 67000 FCFA
    expect(bills.sbeeElectricityFcfa).toBe(57000);
    expect(bills.sonebWaterFcfa).toBe(10000);
    expect(bills.totalMonthlyFcfa).toBe(67000);
    expect(bills.annualTotalFcfa).toBe(67000 * 12);
  });

  it("calculates massive savings when solar kit is enabled", () => {
    const solarBills = estimateMonthlyUtilityBills({
      acUnitsCount: 2,
      hasElectricWaterHeater: true,
      hasWaterBoreholePump: false,
      hasSolarHybridKit: true,
      householdMembersCount: 4,
    });

    expect(solarBills.sbeeElectricityFcfa).toBeLessThan(25000);
    expect(solarBills.solarSavingsAnnualFcfa).toBeGreaterThan(400000);
  });
});
