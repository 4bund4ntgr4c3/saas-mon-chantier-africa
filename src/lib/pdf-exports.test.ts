import { describe, expect, it, vi } from "vitest";
import { exportBudgetPdf } from "./budget-export";
import { exportDossierChantierPdf } from "./dossier-export";
import { exportProjectSummaryPdf } from "./project-summary-export";
import { exportReportPdf } from "./report-export";

// jspdf v4 attache `save` comme propriété propre de chaque instance (pas du prototype) :
// on substitue une sous-classe au niveau du module pour neutraliser le téléchargement.
vi.mock("jspdf", async (importOriginal) => {
  const mod = await importOriginal<typeof import("jspdf")>();
  class TestJsPDF extends mod.jsPDF {
    override save(filename: string, options: { returnPromise: true }): Promise<void>;
    override save(filename?: string): TestJsPDF;
    override save(
      filename?: string,
      options?: { returnPromise?: boolean },
    ): Promise<void> | TestJsPDF {
      return Promise.resolve();
    }
  }
  return { ...mod, jsPDF: TestJsPDF };
});

describe("exports PDF (thème BâtiBénin)", () => {
  it("génère rapport, budget, fiche récap et dossier sans erreur", async () => {
    await expect(
      exportReportPdf({
        title: "Rapport de dépenses",
        projectName: "Villa Akpakpa",
        columns: ["Poste", "Montant"],
        rows: [["Ciment", "50 000 FCFA"]],
        total: ["Total", "50 000 FCFA"],
        rightAlign: [1],
      }),
    ).resolves.toBeUndefined();

    await expect(
      exportBudgetPdf({
        projectName: "Villa Akpakpa",
        projectBudget: 15_000_000,
        rows: [
          { phase: "Gros œuvre", category: "Maçonnerie", planned: 8_000_000, spent: 9_000_000 },
          { phase: "Second œuvre", category: "Peinture", planned: 1_000_000, spent: 200_000 },
        ],
        unassigned: 50_000,
      }),
    ).resolves.toBeUndefined();

    await expect(
      exportProjectSummaryPdf({
        project: {
          name: "Villa Akpakpa",
          city: "Cotonou",
          commune: null,
          quartier: null,
          address: null,
          status: "en_cours",
          start_date: "2026-01-10",
          end_date: "2026-12-01",
          budget: 15_000_000,
          built_area: 120,
          land_area: 300,
          house_type: "Villa duplex",
        },
        spent: 5_000_000,
        paid: 4_500_000,
        spentByCategory: [
          { name: "Maçonnerie", spent: 3_000_000 },
          { name: "Peinture", spent: 200_000 },
        ],
        suppliersCount: 4,
        companiesCount: 2,
        expensesCount: 40,
        paymentsCount: 12,
        quotesCount: 6,
      }),
    ).resolves.toBeUndefined();

    await expect(
      exportDossierChantierPdf({
        projectName: "Villa Akpakpa",
        location: "Cotonou, Bénin",
        clientName: "M. Dossou",
        totalBudget: 15_000_000,
        totalSpent: 5_000_000,
        progressPercent: 45,
        phases: [
          { name: "Fondations", status: "done", budget: 3_000_000, spent: 3_000_000 },
          { name: "Élévation", status: "in_progress", budget: 5_000_000, spent: 2_000_000 },
          { name: "Finitions", status: "pending", budget: 7_000_000, spent: 0 },
        ],
        recentPhotosCount: 18,
        summaryNotes: "Avancement conforme au planning, météo défavorable en juillet.",
      }),
    ).resolves.toBeUndefined();
  });
});
