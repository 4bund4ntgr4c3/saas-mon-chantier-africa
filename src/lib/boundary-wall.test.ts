import { describe, expect, it } from "vitest";
import { calculateBoundaryWallMaterials } from "./boundary-wall";

describe("boundary-wall", () => {
  it("calculates accurate materials for 76m net boundary wall", () => {
    const res = calculateBoundaryWallMaterials({
      perimeterLinearMeters: 80,
      gateWidthMeters: 4,
      wallHeightMeters: 2.2,
      postSpacingMeters: 3,
      hasTopChaperonCover: true,
      hasBarbedWireSecurity: true,
    });

    expect(res.netWallLengthMeters).toBe(76);
    expect(res.wallSurfaceM2).toBe(167.2);
    expect(res.hollowBlocks15Count).toBeGreaterThan(1700);
    expect(res.stiffenerPostsCount).toBe(27); // 76/3 + 1 = 27
    expect(res.cementBags50kgTotal).toBeGreaterThan(100);
    expect(res.rebarBarsHA10Count).toBeGreaterThan(30);
    expect(res.chaperonsCount).toBe(152);
    expect(res.estimatedCostFcfa).toBeGreaterThan(2000000);
  });
});
