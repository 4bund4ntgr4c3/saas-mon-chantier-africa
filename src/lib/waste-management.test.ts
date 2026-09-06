import { describe, expect, it } from "vitest";
import { calculateWastePlanAndDisposal } from "./waste-management";

describe("waste-management", () => {
  it("calculates accurate waste reuse savings and disposal trucks", () => {
    const res = calculateWastePlanAndDisposal({
      excavationVolumeM3: 60,
      demolitionVolumeM3: 20, // Total = 80 m³
      onsiteBackfillNeedsM3: 40, // 40 m³ réutilisés
      truckCapacityM3: 8, // 40 m³ à évacuer -> 5 camions
    });

    expect(res.totalWasteGeneratedM3).toBe(80);
    expect(res.reusedVolumeM3).toBe(40);
    expect(res.netVolumeToDisposeM3).toBe(40);
    expect(res.truckTripsCount).toBe(5);
    expect(res.reusedSavingsFcfa).toBeGreaterThan(150000);
    expect(res.disposalCostFcfa).toBe(225000); // 5 * 45000
    expect(res.wasteManagementTips.length).toBeGreaterThan(2);
  });
});
