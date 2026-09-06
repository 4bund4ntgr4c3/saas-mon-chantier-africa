import { describe, expect, it } from "vitest";
import { calculateZoningCompliance } from "./zoning-footprint";

describe("zoning-footprint", () => {
  it("validates compliant CES and setbacks for 500m² parcel", () => {
    const res = calculateZoningCompliance({
      plotAreaM2: 500,
      groundFloorFootprintM2: 200, // CES = 40%
      totalFloorAreaM2: 350, // COS = 0.7
      frontSetbackMeters: 4,
      sideSetbackMeters: 2.5,
      rearSetbackMeters: 3,
    });

    expect(res.cesRatioPercent).toBe(40);
    expect(res.cosRatio).toBe(0.7);
    expect(res.isCesCompliant).toBe(true);
    expect(res.isFrontSetbackCompliant).toBe(true);
    expect(res.greenSpaceAreaM2).toBe(300);
  });

  it("flags violation for overbuilt parcel with small setback", () => {
    const res = calculateZoningCompliance({
      plotAreaM2: 300,
      groundFloorFootprintM2: 240, // CES = 80% > 60%
      totalFloorAreaM2: 450,
      frontSetbackMeters: 1.5, // < 3m
      sideSetbackMeters: 1.0, // < 2m
      rearSetbackMeters: 1.0,
    });

    expect(res.isCesCompliant).toBe(false);
    expect(res.isFrontSetbackCompliant).toBe(false);
    expect(res.complianceNotes[0]).toContain("Attention");
  });
});
