import { describe, expect, it } from "vitest";
import { haversineKm } from "@/lib/geo";

describe("haversineKm", () => {
  it("retourne 0 pour deux points identiques", () => {
    expect(haversineKm(6.3656, 2.4231, 6.3656, 2.4231)).toBe(0);
  });

  it("calcule la distance Cotonou → Abomey-Calavi (~14 km)", () => {
    const d = haversineKm(6.3656, 2.4231, 6.4397, 2.3525);
    expect(d).toBeGreaterThan(10);
    expect(d).toBeLessThan(18);
  });

  it("retourne un entier (km arrondis)", () => {
    const d = haversineKm(6.3656, 2.4231, 6.4397, 2.3525);
    expect(Number.isInteger(d)).toBe(true);
  });

  it("calcule une distance intercontinentale importante (Cotonou → Paris)", () => {
    const d = haversineKm(6.3656, 2.4231, 48.8566, 2.3522);
    expect(d).toBeGreaterThan(4500);
    expect(d).toBeLessThan(5000);
  });
});
