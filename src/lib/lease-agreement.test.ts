import { describe, expect, it } from "vitest";
import { generateBeninLeaseContractText } from "./lease-agreement";

describe("lease-agreement", () => {
  it("generates legal Benin lease contract text and respects 3-month legal deposit ceiling", () => {
    const contract = generateBeninLeaseContractText({
      lessorName: "Aristide TOSSOU",
      tenantName: "Christian BIO",
      propertyAddress: "Fidjrossè Calvaire, Cotonou",
      propertyType: "Villa Duplex 4 pièces",
      monthlyRentFcfa: 300000,
      securityDepositMonths: 5, // Tente de demander 5 mois (illégal)
      advanceRentMonths: 3,
      leaseStartDate: "2026-09-01",
    });

    expect(contract).toContain("Loi n° 2017-15");
    expect(contract).toContain("Aristide TOSSOU");
    expect(contract).toContain("Christian BIO");
    // Doit être plafonné à 3 mois (900 000 FCFA) et non 5 mois
    expect(contract).toContain("3 mois plafonné");
    expect(contract).toContain("900\u202f000");
  });
});
