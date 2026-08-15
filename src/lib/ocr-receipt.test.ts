import { describe, expect, it } from "vitest";
import { parseReceiptText } from "./ocr-receipt";

describe("parseReceiptText", () => {
  it("extracts vendor, total and materials accurately", () => {
    const raw = `
      QUINCAILLERIE DU NORD PARAKOU
      Date: 15/08/2026
      20 sacs Ciment CPJ 42.5 : 84000 FCFA
      TOTAL : 84000 FCFA
      Mode: MTN MoMo
    `;
    const res = parseReceiptText(raw);
    expect(res.vendorName).toContain("QUINCAILLERIE");
    expect(res.date).toBe("2026-08-15");
    expect(res.totalAmount).toBe(84000);
    expect(res.paymentMethod).toBe("mobile_money");
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0]?.designation).toContain("Ciment");
  });

  it("handles basic receipts gracefully", () => {
    const res = parseReceiptText("Total : 50000 FCFA");
    expect(res.totalAmount).toBe(50000);
  });
});
