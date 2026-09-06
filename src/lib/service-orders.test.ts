import { describe, expect, it } from "vitest";
import { generateServiceOrderText } from "./service-orders";

describe("service-orders", () => {
  it("generates a valid commencement service order", () => {
    const text = generateServiceOrderText({
      orderNumber: 1,
      orderType: "demarrage",
      projectName: "Villa R+1 Calavi",
      clientName: "M. Sylvain KANLINSOU",
      contractorName: "Bénin BTP Sarl",
      effectiveDate: "2026-09-01",
      descriptionOrReason: "Démarrage effectif des travaux de terrassement et fondations.",
    });

    expect(text).toContain("DÉMARRAGE DES TRAVAUX");
    expect(text).toContain("Villa R+1 Calavi");
    expect(text).toContain("Sylvain KANLINSOU");
    expect(text).toContain("Bénin BTP Sarl");
  });

  it("includes financial and delay impacts for amendments", () => {
    const text = generateServiceOrderText({
      orderNumber: 2,
      orderType: "avenant_modificatif",
      projectName: "Résidence Haie Vive",
      clientName: "Mme Nadège DOSSOU",
      contractorName: "Société Générale de Bâtiment",
      effectiveDate: "2026-10-15",
      descriptionOrReason:
        "Ajout d'une bâche à eau enterrée de 10m³ et surélévation du mur de clôture.",
      financialImpactFcfa: 3500000,
      delayImpactDays: 14,
    });

    expect(text).toContain("AVENANT CONTRACTUEL");
    expect(text).toContain("3\u202f500\u202f000 FCFA HT");
    expect(text).toContain("14 jour(s)");
  });
});
