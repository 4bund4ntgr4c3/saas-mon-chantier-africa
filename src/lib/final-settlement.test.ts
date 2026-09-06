import { describe, expect, it } from "vitest";
import { calculateFinalSettlement } from "./final-settlement";

describe("final-settlement", () => {
  it("calculates accurate DGD and 5% guarantee retention", () => {
    const res = calculateFinalSettlement({
      initialContractAmountFcfa: 40000000,
      approvedAmendmentsFcfa: 2000000, // Total = 42 000 000 FCFA
      totalPaymentsAlreadyMadeFcfa: 35000000,
      liquidatedDamagesPenaltiesFcfa: 0,
      retentionRatePercent: 5, // 5% = 2 100 000 FCFA
      provisionalAcceptanceDate: "2026-09-15",
    });

    expect(res.finalContractTotalFcfa).toBe(42000000);
    expect(res.guaranteeRetentionFcfa).toBe(2100000);
    // Solde immédiat = 42M - 2.1M - 35M = 4 900 000 FCFA
    expect(res.immediateBalancePayableFcfa).toBe(4900000);
    expect(res.guaranteeReleaseDate).toBe("2027-09-15");
    expect(res.isFullySettled).toBe(false);
  });
});
