import { describe, expect, it } from "vitest";
import { calculateEmecefInvoice, EmecefInvoiceData } from "./emecef";

describe("calculateEmecefInvoice", () => {
  it("calculates standard tax and AIB for a company invoice", () => {
    const data: EmecefInvoiceData = {
      invoiceNumber: "FAC-2026-001",
      invoiceType: "FV",
      ifuSeller: "3201912345678",
      sellerName: "BÂTIBÉNIN SARL",
      ifuBuyer: "1201887654321",
      buyerName: "SCI LA LAGUNE",
      nimMachine: "MCF-01-00892",
      items: [
        {
          id: "1",
          name: "Prestation maçonnerie",
          quantity: 1,
          unitPriceHt: 1000000,
          taxGroup: "B",
        }, // TVA 18% = 180 000
        {
          id: "2",
          name: "Fourniture sable exonéré",
          quantity: 1,
          unitPriceHt: 200000,
          taxGroup: "A",
        }, // TVA 0%
      ],
      aibRate: 0.01, // AIB 1% = 12 000
      date: "2026-08-13",
    };

    const calc = calculateEmecefInvoice(data);

    expect(calc.totalHt).toBe(1200000);
    expect(calc.totalTva).toBe(180000);
    expect(calc.totalTtc).toBe(1380000);
    expect(calc.totalAib).toBe(12000);
    expect(calc.netToPay).toBe(1392000);
    expect(calc.securityCodeMceF).toContain("MCEF-");
    expect(calc.qrCodeUrl).toContain("https://emcefv2.impots.bj/verify");
  });
});
