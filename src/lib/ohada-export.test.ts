import { describe, expect, it } from "vitest";
import { buildOhadaJournal, ohadaAccountFor, ohadaAccountSummary } from "./ohada-export";

describe("ohadaAccountFor", () => {
  it("mappe les matériaux vers 602", () => {
    expect(ohadaAccountFor("Ciment & agrégats", "10 sacs de ciment").account).toBe("602");
    expect(ohadaAccountFor("Gros œuvre", "Fer à béton HA12").account).toBe("602");
  });

  it("mappe la main d'œuvre vers 661 et la sous-traitance vers 621", () => {
    expect(ohadaAccountFor("Main d'oeuvre", "Paie ouvriers").account).toBe("661");
    expect(ohadaAccountFor("Entreprise", "Gros œuvre sous-traité").account).toBe("621");
  });

  it("mappe honoraires, transport, location, impôts et énergie", () => {
    expect(ohadaAccountFor("Honoraires architecte", "").account).toBe("626");
    expect(ohadaAccountFor("Transport", "Livraison sable").account).toBe("61");
    expect(ohadaAccountFor("Location matériel", "Bétonnière").account).toBe("622");
    expect(ohadaAccountFor("Frais administratifs", "Permis de construire").account).toBe("64");
    expect(ohadaAccountFor("Divers", "Facture électricité").account).toBe("605");
  });

  it("tombe sur 658 (autres charges) sans correspondance", () => {
    expect(ohadaAccountFor(null, undefined, "Bureau").account).toBe("658");
  });
});

describe("buildOhadaJournal", () => {
  const expenses = [
    {
      id: "1",
      label: "Ciment 50kg",
      amount: 45000,
      expense_date: "2026-08-01",
      categoryName: "Matériaux",
    },
    {
      id: "2",
      label: "Camion sable",
      amount: 30000,
      expense_date: "2026-08-02",
      categoryName: "Transport",
    },
  ];

  it("génère des écritures équilibrées (une charge + un crédit 401 par dépense)", () => {
    const { entries, total } = buildOhadaJournal(expenses);
    expect(entries).toHaveLength(4);
    expect(total).toBe(75000);
    const debit = entries.reduce((s, e) => s + e.debit, 0);
    const credit = entries.reduce((s, e) => s + e.credit, 0);
    expect(debit).toBe(credit);
    expect(entries.filter((e) => e.account === "401")).toHaveLength(2);
  });

  it("ignore les montants nuls ou invalides", () => {
    const { entries } = buildOhadaJournal([
      { id: "x", label: "Nulle", amount: 0, expense_date: "2026-08-01" },
      { id: "y", label: "Invalide", amount: "abc", expense_date: null },
    ]);
    expect(entries).toHaveLength(0);
  });
});

describe("ohadaAccountSummary", () => {
  it("agrège et trie par compte", () => {
    const summary = ohadaAccountSummary([
      {
        id: "1",
        label: "Ciment",
        amount: 100,
        expense_date: "2026-08-01",
        categoryName: "Matériaux",
      },
      {
        id: "2",
        label: "Sable",
        amount: 50,
        expense_date: "2026-08-02",
        categoryName: "Matériaux",
      },
      {
        id: "3",
        label: "Camion",
        amount: 20,
        expense_date: "2026-08-02",
        categoryName: "Transport",
      },
    ]);
    expect(summary).toHaveLength(2);
    expect(summary[0]!.account).toBe("602");
    expect(summary[0]!.total).toBe(150);
    expect(summary[1]!.account).toBe("61");
  });
});
