import { describe, expect, it } from "vitest";
import { computeEvm, evmVerdict } from "./evm";

describe("computeEvm", () => {
  it("calcule CPI, SPI, EAC sur un chantier en dérive", () => {
    const r = computeEvm({
      budget: 10000000,
      spent: 6000000,
      progressPct: 40,
      plannedValue: 5000000,
    });
    expect(r.ac).toBe(6000000);
    expect(r.ev).toBe(4000000);
    expect(r.cpi).toBeCloseTo(0.6667, 3);
    expect(r.spi).toBeCloseTo(0.8, 3);
    // EAC = 10 000 000 / 0,6667 = 15 000 000
    expect(r.eac).toBeCloseTo(15000000, -4);
    expect(r.vac).toBeCloseTo(-5000000, -4);
    expect(r.overrunPct).toBeCloseTo(50, 0);
  });

  it("chantier maîtrisé : CPI > 1, EAC < budget", () => {
    const r = computeEvm({
      budget: 10000000,
      spent: 3500000,
      progressPct: 45,
      plannedValue: 4000000,
    });
    expect(r.cpi).toBeGreaterThan(1);
    expect(r.eac!).toBeLessThan(10000000);
    expect(r.overrunPct!).toBeLessThan(0);
  });

  it("replie la valeur planifiée sur l'écoulement du temps", () => {
    const r = computeEvm({ budget: 1000, spent: 100, progressPct: 10, elapsedFraction: 0.5 });
    expect(r.pv).toBe(500);
  });

  it("données insuffisantes → indicateurs null", () => {
    const r = computeEvm({ budget: 1000, spent: 0, progressPct: null });
    expect(r.cpi).toBeNull();
    expect(r.spi).toBeNull();
    expect(r.eac).toBeNull();
  });
});

describe("evmVerdict", () => {
  it("mentionne retard et dépassement attendu", () => {
    const v = evmVerdict(
      computeEvm({ budget: 10000000, spent: 6000000, progressPct: 40, plannedValue: 5000000 }),
    );
    expect(v).toContain("retard");
    expect(v).toContain("dépassement");
    expect(v).toContain("50");
  });

  it("cas maîtrisé", () => {
    const v = evmVerdict(
      computeEvm({ budget: 10000000, spent: 3500000, progressPct: 45, plannedValue: 4000000 }),
    );
    expect(v).toContain("en avance");
    expect(v).toContain("coûts maîtrisés");
  });
});
