import { describe, expect, it } from "vitest";
import { calculateRentalYield } from "./rental-yield";

describe("calculateRentalYield", () => {
  it("calculates gross and net rental yield correctly for a 30M FCFA property", () => {
    // 30M investis, loyer 300 000 FCFA / mois = 3.6M brut/an (12% brut)
    const result = calculateRentalYield(30000000, 300000);

    expect(result.annualGrossRentFcfa).toBe(3600000);
    expect(result.grossYieldPercent).toBe(12);
    expect(result.netYieldPercent).toBeGreaterThan(8);
    expect(result.paybackPeriodYears).toBeLessThan(12);
    expect(result.monthlyNetCashflowFcfa).toBeGreaterThan(200000);
  });
});
