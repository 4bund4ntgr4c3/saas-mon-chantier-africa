import { describe, expect, it } from "vitest";
import { calculateTotalPayroll, calculateWorkerPay, Worker } from "./labor";

describe("calculateWorkerPay", () => {
  const mockWorker: Worker = {
    id: "w1",
    name: "Kofi Mensah",
    role: "macon",
    roleLabel: "Maçon qualifié",
    dailyRate: 6000,
  };

  it("calculates standard presence correctly", () => {
    const attendances = [
      { workerId: "w1", date: "2026-08-10", status: "present" as const },
      { workerId: "w1", date: "2026-08-11", status: "present" as const },
      { workerId: "w1", date: "2026-08-12", status: "half_day" as const },
      { workerId: "w1", date: "2026-08-13", status: "absent" as const },
    ];

    const result = calculateWorkerPay(mockWorker, attendances);
    expect(result.daysPresent).toBe(2);
    expect(result.halfDays).toBe(1);
    expect(result.daysAbsent).toBe(1);
    // 2 * 6000 + 1 * 3000 = 15000 FCFA
    expect(result.totalDue).toBe(15000);
  });

  it("handles overtime hours accurately", () => {
    const attendances = [
      { workerId: "w1", date: "2026-08-10", status: "overtime" as const, overtimeHours: 4 },
    ];

    const result = calculateWorkerPay(mockWorker, attendances);
    // 6000 + 4 * (6000 / 8 * 1.5) = 6000 + 4 * 1125 = 10500 FCFA
    expect(result.totalDue).toBe(10500);
  });
});

describe("calculateTotalPayroll", () => {
  it("calculates global payroll for a team", () => {
    const workers: Worker[] = [
      { id: "w1", name: "Kofi", role: "macon", roleLabel: "Maçon", dailyRate: 6000 },
      { id: "w2", name: "Ayo", role: "manoeuvre", roleLabel: "Manœuvre", dailyRate: 3000 },
    ];
    const attendances = [
      { workerId: "w1", date: "2026-08-10", status: "present" as const },
      { workerId: "w2", date: "2026-08-10", status: "present" as const },
    ];

    const total = calculateTotalPayroll(workers, attendances);
    expect(total.totalGlobalDue).toBe(9000);
    expect(total.summaries.length).toBe(2);
  });
});
