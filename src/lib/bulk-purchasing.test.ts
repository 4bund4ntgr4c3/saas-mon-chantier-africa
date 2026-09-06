import { describe, expect, it } from "vitest";
import { calculateBulkDiscount } from "./bulk-purchasing";

describe("calculateBulkDiscount", () => {
  it("calculates 14% discount for bulk cement orders of 500 bags", () => {
    // 500 sacs @ 4 500 FCFA = 2 250 000 FCFA standard -> 14% discount = 315 000 FCFA remise
    const res = calculateBulkDiscount("ciment", 500, 4500);

    expect(res.discountRatePercent).toBe(14);
    expect(res.discountAmountFcfa).toBe(315000);
    expect(res.finalNegotiatedPriceFcfa).toBe(1935000);
  });
});
