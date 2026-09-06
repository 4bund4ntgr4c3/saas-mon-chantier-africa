import { describe, expect, it } from "vitest";
import { generateVefaContractText } from "./vefa-contract";

describe("generateVefaContractText", () => {
  it("includes legal references to Benin Land Code and exact unit details", () => {
    const text = generateVefaContractText({
      developerName: "BâtiBénin Promotions SARL",
      developerRccm: "RB/COT/2026/B/1234",
      buyerName: "Jean KOUDJO",
      buyerPhone: "+229 97 11 22 33",
      programName: "Résidence Les Cocotiers",
      unitLabel: "Appartement A12",
      surfaceM2: 85,
      priceFcfa: 35000000,
      depositAmountFcfa: 1750000,
      deliveryDateEstimated: "2027-06-30",
      city: "Cotonou",
    });

    expect(text).toContain("Code Foncier et Domanial");
    expect(text).toContain("Résidence Les Cocotiers");
    expect(text).toContain("Appartement A12");
    expect(text).toContain("35");
    expect(text).toContain("garantie décennale");
  });
});
