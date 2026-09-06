import { describe, expect, it } from "vitest";
import { computeDailyLaborSummary, getDefaultTradeAttendance } from "./worker-attendance";

describe("worker-attendance", () => {
  it("calculates daily payroll and EPI compliance percentage", () => {
    const list = getDefaultTradeAttendance();
    const summary = computeDailyLaborSummary(list);

    expect(summary.totalWorkers).toBe(15);
    expect(summary.totalDailyPayrollFcfa).toBeGreaterThan(80000);
    expect(summary.epiComplianceRatePercent).toBeLessThan(100);
    expect(summary.safetyAlert).toContain("non conformes");
  });
});
