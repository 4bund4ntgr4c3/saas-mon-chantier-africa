import { describe, expect, it } from "vitest";
import {
  buildLlmSystemPrompt,
  clipHistory,
  summarizeAnalysis,
  type AnalysisSummaryInput,
} from "@/lib/llm-assistant";

const analysis: AnalysisSummaryInput = {
  requirements: [
    { name: "Ciment", quantity_needed: 120, quantity_delivered: 40, quantity_consumed: 10 },
    { name: "Fer à béton", quantity_needed: 40, quantity_delivered: 40, quantity_consumed: 0 },
  ],
  products: [{}, {}, {}],
  stores: [{ name: "Quincaillerie Le Bon Prix" }],
  forecast: [
    { name: "Ciment CIMBENIN", status: "critique" },
    { name: "Tôle bac alu", status: "ok" },
  ],
  cartCount: 2,
  budgetLines: [
    { category_id: "gros_oeuvre", planned_amount: 5000000 },
    { category_id: "finitions", planned_amount: 2000000 },
  ],
  expenses: [
    { label: "Achat ciment", amount: 168000 },
    { label: "Main d'œuvre", amount: 250000 },
  ],
  tasks: [
    { title: "Semelles filantes", status: "terminee" },
    { title: "Élévation murs", status: "en_cours" },
    { title: "Toiture", status: "a_faire" },
  ],
};

describe("summarizeAnalysis", () => {
  const summary = summarizeAnalysis(analysis);

  it("inclut le budget, les dépenses et le reste", () => {
    expect(summary).toContain("7 000 000");
    expect(summary).toContain("418 000");
    expect(summary).toContain("6 582 000");
  });

  it("inclut l'avancement des tâches et les titres en cours", () => {
    expect(summary).toContain("1/3 terminée(s)");
    expect(summary).toContain("Élévation murs");
    expect(summary).toContain("Toiture");
  });

  it("calcule les besoins restants (prévu − livré − consommé)", () => {
    expect(summary).toContain("Ciment ×70");
    expect(summary).toContain("Fer à béton ×0");
    expect(summary).toContain("Panier : 2 article(s)");
  });

  it("signale uniquement les produits dont le statut de prévision n'est pas ok", () => {
    expect(summary).toContain("Ciment CIMBENIN");
    expect(summary).not.toContain("Tôle bac alu");
  });
});

describe("buildLlmSystemPrompt", () => {
  it("injecte le rôle utilisateur et le contexte chantier", () => {
    const prompt = buildLlmSystemPrompt("Maître d'œuvre", "Budget planifié : 7 000 000 FCFA");
    expect(prompt).toContain("Maître d'œuvre");
    expect(prompt).toContain("Budget planifié : 7 000 000 FCFA");
  });

  it("impose le français, le FCFA et la concision", () => {
    const prompt = buildLlmSystemPrompt("Artisan", "ctx");
    expect(prompt).toContain("français");
    expect(prompt).toContain("FCFA");
    expect(prompt).toContain("180 mots");
  });
});

describe("clipHistory", () => {
  it("garde les 6 derniers tours non vides", () => {
    const history = [
      { role: "user" as const, text: "q1" },
      { role: "assistant" as const, text: "" },
      ...Array.from({ length: 8 }, (_, i) => ({
        role: "user" as const,
        text: `q${i + 2}`,
      })),
    ];
    const clipped = clipHistory(history);
    expect(clipped).toHaveLength(6);
    expect(clipped[0]?.text).toBe("q4");
    expect(clipped[5]?.text).toBe("q9");
  });
});
