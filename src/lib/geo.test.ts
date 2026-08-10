import { describe, expect, it } from "vitest";
import { distanceKm, formatDistance, haversineKm, withinRadius } from "@/lib/geo";

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

describe("distanceKm", () => {
  it("est symétrique", () => {
    const a = { lat: 6.3656, lng: 2.4231 };
    const b = { lat: 6.4397, lng: 2.3525 };
    expect(distanceKm(a, b)).toBe(distanceKm(b, a));
  });
});

describe("withinRadius", () => {
  const center = { lat: 6.3656, lng: 2.4231 };
  it("accepte un point dans le rayon", () => {
    expect(withinRadius({ lat: 6.3656, lng: 2.4235 }, center, 1)).toBe(true);
  });
  it("rejette un point hors du rayon", () => {
    expect(withinRadius({ lat: 6.4397, lng: 2.3525 }, center, 5)).toBe(false);
  });
});

describe("formatDistance", () => {
  it("affiche des mètres sous 1 km", () => {
    expect(formatDistance(0.85)).toBe("850 m");
  });
  it("affiche des kilomètres avec une décimale", () => {
    expect(formatDistance(3.2)).toBe("3,2 km");
  });
  it("utilise la virgule décimale", () => {
    expect(formatDistance(12.5)).toContain(",");
  });
});
