/**
 * Module d'estimation des futures factures d'énergie (SBEE) et d'eau (SONEB) post-emménagement au Bénin.
 */

export interface UtilityBillsInputs {
  acUnitsCount: number;
  hasElectricWaterHeater: boolean;
  hasWaterBoreholePump: boolean;
  hasSolarHybridKit: boolean;
  householdMembersCount: number;
}

export function estimateMonthlyUtilityBills(inputs: UtilityBillsInputs): {
  sbeeElectricityFcfa: number;
  sonebWaterFcfa: number;
  totalMonthlyFcfa: number;
  annualTotalFcfa: number;
  solarSavingsAnnualFcfa: number;
} {
  // Base électricité domestique (réfrigérateur, éclairage LED, TV, box internet) : ~15 000 FCFA
  let electricity = 15000;

  // Climatiseurs (1.5 CV moyen ~ 15 000 FCFA / split / mois pour 6h/j)
  electricity += Math.max(0, inputs.acUnitsCount) * 15000;

  // Chauffe-eau électrique classique
  if (inputs.hasElectricWaterHeater) {
    electricity += 12000;
  }

  // Pompe immergée forage
  if (inputs.hasWaterBoreholePump) {
    electricity += 3500;
  }

  // Si kit solaire hybride : 65% d'économie sur la facture SBEE
  const rawElectricity = electricity;
  if (inputs.hasSolarHybridKit) {
    electricity = Math.round(electricity * 0.35);
  }

  // Facture eau SONEB : ~2 500 FCFA / habitant / mois si pas de forage, sinon forfait entretien pompe
  const water = inputs.hasWaterBoreholePump
    ? 2000 // Entretien filtre / appoint minime
    : Math.max(1, inputs.householdMembersCount) * 2500;

  const totalMonthly = Math.round(electricity + water);
  const annualTotal = totalMonthly * 12;
  const solarSavingsAnnual = inputs.hasSolarHybridKit
    ? Math.round((rawElectricity - electricity) * 12)
    : Math.round(rawElectricity * 0.65 * 12);

  return {
    sbeeElectricityFcfa: Math.round(electricity),
    sonebWaterFcfa: Math.round(water),
    totalMonthlyFcfa: totalMonthly,
    annualTotalFcfa: annualTotal,
    solarSavingsAnnualFcfa: solarSavingsAnnual,
  };
}
