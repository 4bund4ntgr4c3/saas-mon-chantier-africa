import { describe, expect, it } from "vitest";
import { simulateConstructionInsurance } from "./insurance";

describe("simulateConstructionInsurance", () => {
  it("calculates insurance premiums for a 20M FCFA project", () => {
    const result = simulateConstructionInsurance(20000000);

    expect(result.tousRisquesChantier).toBe(170000);
    expect(result.responsabiliteCivile).toBe(70000);
    expect(result.garantieDecennale).toBe(100000);
    expect(result.totalPackagePrimeFcfa).toBe(300000);
    expect(result.partners.length).toBeGreaterThanOrEqual(3);
  });
});
