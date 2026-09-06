import { describe, expect, it } from "vitest";
import { evaluateHandoverStatus, getDefaultHandoverChecklist } from "./handover-checklist";

describe("handover-checklist", () => {
  it("detects defects when items have defects flagged", () => {
    const list = getDefaultHandoverChecklist().map((item, idx) =>
      idx === 0 ? { ...item, hasDefect: true, defectNote: "Pente douche inversée" } : item,
    );
    const status = evaluateHandoverStatus(list);

    expect(status.defectsCount).toBe(1);
    expect(status.isReadyForHandover).toBe(false);
    expect(status.statusLabel).toContain("réserve");
  });
});
