import { describe, expect, it } from "vitest";
import { detectExpenseAnomalies } from "./expense-anomalies";

describe("detectExpenseAnomalies", () => {
  it("détecte un doublon à moins de 48 h (même montant, fournisseur, libellé)", () => {
    const anomalies = detectExpenseAnomalies([
      {
        id: "1",
        label: "Ciment 50 sacs",
        amount: 225000,
        expense_date: "2026-08-01",
        category_id: "c1",
        supplier_id: "s1",
      },
      {
        id: "2",
        label: "Ciment 50 sacs",
        amount: 225000,
        expense_date: "2026-08-02",
        category_id: "c1",
        supplier_id: "s1",
      },
    ]);
    const duplicates = anomalies.filter((a) => a.kind === "doublon");
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]!.expenseId).toBe("2");
    expect(duplicates[0]!.severity).toBe("haute");
  });

  it("ignore les dépenses identiques espacées de plus de 48 h", () => {
    const anomalies = detectExpenseAnomalies([
      {
        id: "1",
        label: "Sable",
        amount: 55000,
        expense_date: "2026-08-01",
        category_id: "c1",
        supplier_id: "s1",
      },
      {
        id: "2",
        label: "Sable",
        amount: 55000,
        expense_date: "2026-08-10",
        category_id: "c1",
        supplier_id: "s1",
      },
    ]);
    expect(anomalies.filter((a) => a.kind === "doublon")).toHaveLength(0);
  });

  it("repère un prix unitaire aberrant vs la moyenne de la catégorie", () => {
    const anomalies = detectExpenseAnomalies([
      {
        id: "1",
        label: "Agglos",
        amount: 425000,
        unit_price: 425,
        quantity: 1000,
        expense_date: "2026-08-01",
        category_id: "c1",
        supplier_id: "s1",
      },
      {
        id: "2",
        label: "Agglos",
        amount: 425000,
        unit_price: 425,
        quantity: 1000,
        expense_date: "2026-08-02",
        category_id: "c1",
        supplier_id: "s1",
      },
      {
        id: "3",
        label: "Agglos",
        amount: 425000,
        unit_price: 425,
        quantity: 1000,
        expense_date: "2026-08-03",
        category_id: "c1",
        supplier_id: "s2",
      },
      {
        id: "4",
        label: "Agglos chers",
        amount: 850000,
        unit_price: 850,
        quantity: 1000,
        expense_date: "2026-08-04",
        category_id: "c1",
        supplier_id: "s3",
      },
    ]);
    const priceAnomaly = anomalies.find((a) => a.kind === "prix_aberrant" && a.expenseId === "4");
    expect(priceAnomaly).toBeDefined();
    expect(priceAnomaly!.detail).toContain("+60 %");
  });

  it("signale un gros montant chez un fournisseur jamais utilisé", () => {
    const anomalies = detectExpenseAnomalies([
      {
        id: "1",
        label: "Gros achat",
        amount: 900000,
        expense_date: "2026-08-01",
        category_id: null,
        supplier_id: "nouveau",
      },
    ]);
    expect(anomalies.some((a) => a.kind === "nouveau_fournisseur")).toBe(true);
  });

  it("ne signale pas les petites premières dépenses", () => {
    const anomalies = detectExpenseAnomalies([
      {
        id: "1",
        label: "Petit achat",
        amount: 15000,
        expense_date: "2026-08-01",
        category_id: null,
        supplier_id: "nouveau",
      },
    ]);
    expect(anomalies).toHaveLength(0);
  });
});
