import { describe, expect, it } from "vitest";
import { calculateHomeInsuranceQuote } from "./home-insurance";

describe("home-insurance", () => {
  it("computes realistic annual premium for a 40M FCFA house with 10M FCFA contents", () => {
    const quote = calculateHomeInsuranceQuote({
      propertyValueFcfa: 40000000,
      contentsValueFcfa: 10000000,
      includeFloodAndWaterDamage: true,
      includeElectricalSurgeProtection: true,
    });

    // Base: 40M*0.15% (60k) + 10M*0.3% (30k) = 90k
    // Flood: 40M*0.05% = 20k
    // Surge: 10M*0.1% = 10k
    // Total = 120 000 FCFA / an (~10 000 FCFA / mois)
    expect(quote.baseAnnualPremiumFcfa).toBe(90000);
    expect(quote.floodCoverageFcfa).toBe(20000);
    expect(quote.electricalSurgeFcfa).toBe(10000);
    expect(quote.totalAnnualPremiumFcfa).toBe(120000);
    expect(quote.monthlyEquivalentFcfa).toBe(10000);
  });
});
