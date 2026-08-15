import { describe, expect, it } from "vitest";
import { evaluateHseAudit, DEFAULT_HSE_CHECKLIST } from "./safety-audit";

describe("evaluateHseAudit", () => {
  it("evaluates a fully compliant site correctly", () => {
    const report = evaluateHseAudit(DEFAULT_HSE_CHECKLIST);
    expect(report.scorePercent).toBe(100);
    expect(report.status).toBe("conforme");
    expect(report.recommendations[0]).toContain("100% conforme");
  });

  it("flags non-compliant checklist with critical warning", () => {
    const checklist = DEFAULT_HSE_CHECKLIST.map((item, idx) => ({
      ...item,
      compliant: idx === 0, // only 1 compliant = 20%
    }));

    const report = evaluateHseAudit(checklist);
    expect(report.scorePercent).toBe(20);
    expect(report.status).toBe("danger_critique");
    expect(report.recommendations.length).toBe(4);
  });
});
