import { describe, expect, it } from "vitest";
import { calculateConcrete, calculateMasonry, calculateRoofing } from "./metre";

describe("calculateConcrete", () => {
  it("calculates concrete requirements correctly for a slab", () => {
    // Dalle de 10m x 5m x 0.15m = 7.5 m³
    const res = calculateConcrete(10, 5, 0.15, 350);
    expect(res.volumeM3).toBe(7.5);
    // 7.5 * 350 = 2625 kg => 53 sacs de 50 kg
    expect(res.cementBags50kg).toBe(53);
    // 7.5 * 0.8 = 6 tonnes
    expect(res.sandTonnes).toBe(6);
    // 7.5 * 1.2 = 9 tonnes
    expect(res.gravelTonnes).toBe(9);
    expect(res.waterLiters).toBe(1313);
    expect(res.steelKgEstimated).toBe(600);
    expect(res.steelBars12mCount).toBe(67);
  });

  it("handles zero or negative dimensions safely", () => {
    const res = calculateConcrete(0, -5, 0);
    expect(res.volumeM3).toBe(0);
    expect(res.cementBags50kg).toBe(0);
    expect(res.sandTonnes).toBe(0);
  });
});

describe("calculateMasonry", () => {
  it("calculates blocks and mortar for a wall with openings", () => {
    // Mur de 10m x 3m = 30 m² - 4 m² ouvertures = 26 m²
    const res = calculateMasonry(10, 3, 4, 15);
    expect(res.wallAreaM2).toBe(26);
    // 26 * 10 * 1.05 = 273 blocks
    expect(res.blocksCount).toBe(273);
    expect(res.cementBags50kg).toBeGreaterThan(0);
    expect(res.sandTonnes).toBeGreaterThan(0);
  });
});

describe("calculateRoofing", () => {
  it("calculates corrugated sheets and nails correctly", () => {
    const res = calculateRoofing(10, 8, 20, 3);
    expect(res.surfaceM2).toBeGreaterThan(0);
    expect(res.corrugatedSheetsCount).toBeGreaterThan(0);
    expect(res.roofingNailsKg).toBeGreaterThan(0);
    expect(res.ridgeCapsCount).toBeGreaterThan(0);
  });
});
