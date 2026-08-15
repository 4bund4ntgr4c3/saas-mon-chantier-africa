import { describe, expect, it } from "vitest";
import { generateContractPdf, ContractData } from "./contracts";

describe("generateContractPdf", () => {
  it("generates a valid jsPDF document for a construction contract", () => {
    const data: ContractData = {
      contractType: "entreprise_forfait",
      projectName: "Villa Akpakpa",
      projectLocation: "Cotonou, Bénin",
      clientName: "M. Dossou",
      clientAddress: "Paris / Cotonou",
      contractorName: "Entreprise BTP Excellence",
      contractorTrade: "Gros Œuvre & Maçonnerie",
      contractorPhone: "+229 97 00 00 00",
      totalAmountFcfa: 15000000,
      advancePaymentFcfa: 4500000,
      durationWeeks: 12,
      penaltyPerDayFcfa: 25000,
      guaranteeRetentionRate: 0.05,
      startDate: "2026-08-15",
    };

    const doc = generateContractPdf(data);
    expect(doc).toBeDefined();
    expect(doc.internal.pages.length).toBeGreaterThanOrEqual(1);
  });
});
