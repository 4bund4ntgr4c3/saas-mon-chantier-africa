import { describe, expect, it } from "vitest";
import { calculateBankLoan } from "./bank-loan";

describe("calculateBankLoan", () => {
  it("calculates realistic monthly payment for a 20M FCFA mortgage over 15 years", () => {
    // 20 000 000 FCFA à 8.5% sur 15 ans
    const result = calculateBankLoan(20000000, 8.5, 15);

    expect(result.borrowedAmountFcfa).toBe(20000000);
    expect(result.durationYears).toBe(15);
    expect(result.monthlyPaymentFcfa).toBeGreaterThan(190000);
    expect(result.monthlyPaymentFcfa).toBeLessThan(220000);
    expect(result.minimumNetIncomeRequiredFcfa).toBeGreaterThan(result.monthlyPaymentFcfa * 3);
  });
});
