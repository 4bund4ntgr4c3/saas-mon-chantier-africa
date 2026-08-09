import { describe, expect, it } from "vitest";
import { tr } from "./i18n";

describe("i18n.ts", () => {
  it("renvoie le libellé français par défaut", () => {
    expect(tr("fr", "nav.projets")).toBe("Projets");
    expect(tr("fr", "shell.depense")).toBe("Dépense");
  });

  it("renvoie le libellé anglais quand demandé", () => {
    expect(tr("en", "nav.projets")).toBe("Projects");
    expect(tr("en", "shell.depense")).toBe("Expense");
    expect(tr("en", "nav.ma-boutique")).toBe("My shop");
  });

  it("couvre les entrées de navigation", () => {
    const keys = [
      "nav.tableau-de-bord",
      "nav.boutique",
      "nav.panier",
      "nav.commandes",
      "admin.utilisateurs",
    ] as const;
    for (const k of keys) {
      expect(tr("fr", k).length).toBeGreaterThan(0);
      expect(tr("en", k).length).toBeGreaterThan(0);
    }
  });
});
