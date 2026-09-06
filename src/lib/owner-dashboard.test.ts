import { describe, expect, it } from "vitest";
import { computeOwnerProjectHealth } from "./owner-dashboard";

describe("computeOwnerProjectHealth", () => {
  it("calculates high health score when progress and spending align", () => {
    const health = computeOwnerProjectHealth("Villa Diaspora Fidjrossè", 50, 40000000, 20000000);

    expect(health.healthScorePercent).toBeGreaterThanOrEqual(90);
    expect(health.budgetRemainingFcfa).toBe(20000000);
    expect(health.nextKeyMilestone).toContain("toiture");
  });
});
