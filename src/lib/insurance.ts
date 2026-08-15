/**
 * Module de simulation et d'estimation d'assurance chantier et garantie décennale (Bénin / UEMOA).
 */

export interface InsuranceSimulation {
  projectBudget: number;
  tousRisquesChantier: number; // ~0.85%
  responsabiliteCivile: number; // ~0.35%
  garantieDecennale: number; // ~0.50%
  totalPackagePrimeFcfa: number;
  recommendedCoverageFcfa: number;
  partners: string[];
}

export function simulateConstructionInsurance(projectBudget: number): InsuranceSimulation {
  const safeBudget = Math.max(1000000, projectBudget);

  const tousRisquesChantier = Math.round(safeBudget * 0.0085);
  const responsabiliteCivile = Math.round(safeBudget * 0.0035);
  const garantieDecennale = Math.round(safeBudget * 0.005);

  const totalPackagePrimeFcfa = Math.round(safeBudget * 0.015); // Forfait pack remisé 1.5%

  return {
    projectBudget: safeBudget,
    tousRisquesChantier,
    responsabiliteCivile,
    garantieDecennale,
    totalPackagePrimeFcfa,
    recommendedCoverageFcfa: safeBudget,
    partners: ["NSIA Assurances Bénin", "Sanlam Assurance", "UAB Assurances"],
  };
}
