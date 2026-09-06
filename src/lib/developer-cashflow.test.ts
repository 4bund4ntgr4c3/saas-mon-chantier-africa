import { describe, expect, it } from "vitest";
import { generateVefaFundSchedule } from "./developer-cashflow";

describe("generateVefaFundSchedule", () => {
  it("sums to 100% and calculates accurate amounts for a 40M FCFA property unit", () => {
    const milestones = generateVefaFundSchedule(40000000);

    const totalPct = milestones.reduce((s, m) => s + m.percentage, 0);
    const totalAmount = milestones.reduce((s, m) => s + m.amountFcfa, 0);

    expect(totalPct).toBe(100);
    expect(totalAmount).toBe(40000000);
    expect(milestones[0]?.amountFcfa).toBe(2000000); // 5%
    expect(milestones[2]?.amountFcfa).toBe(10000000); // 25%
  });
});
