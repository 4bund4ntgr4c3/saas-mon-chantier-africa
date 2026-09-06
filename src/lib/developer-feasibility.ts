/**
 * Module d'étude de faisabilité et bilan financier d'opération immobilière pour promoteur et maître d'ouvrage.
 */

export interface DeveloperFeasibilityInputs {
  landCostFcfa: number; // Coût d'achat du terrain
  studiesAndPermitsFcfa: number; // Études géotechniques, plans archi, permis de construire, notaire
  constructionCostFcfa: number; // Coût global des travaux BTP
  contingencyPercent: number; // Imprévus et aléas (ex: 5%)
  commercializationCostFcfa: number; // Frais marketing et agence commerciale
  totalSalesRevenueFcfa: number; // Chiffre d'affaires prévisionnel des ventes (ou valeur vénale)
  durationMonths: number; // Durée de l'opération
}

export interface DeveloperFeasibilityResult {
  totalExpenditureFcfa: number;
  grossMarginFcfa: number;
  netMarginPercent: number;
  returnOnInvestmentPercent: number; // ROI
  breakEvenSalesRevenueFcfa: number; // Seuil de rentabilité en FCFA
  isFinanciallyViable: boolean;
}

export function calculateDeveloperFeasibility(
  inputs: DeveloperFeasibilityInputs,
): DeveloperFeasibilityResult {
  const land = Math.max(0, inputs.landCostFcfa);
  const studies = Math.max(0, inputs.studiesAndPermitsFcfa);
  const construction = Math.max(0, inputs.constructionCostFcfa);
  const contingencies = (construction * Math.max(0, inputs.contingencyPercent)) / 100;
  const marketing = Math.max(0, inputs.commercializationCostFcfa);
  const revenue = Math.max(0, inputs.totalSalesRevenueFcfa);

  const totalExpenditure = Math.round(land + studies + construction + contingencies + marketing);
  const grossMargin = Math.round(revenue - totalExpenditure);

  const netMarginPercent = revenue > 0 ? Number(((grossMargin / revenue) * 100).toFixed(1)) : 0;
  const returnOnInvestmentPercent =
    totalExpenditure > 0 ? Number(((grossMargin / totalExpenditure) * 100).toFixed(1)) : 0;

  return {
    totalExpenditureFcfa: totalExpenditure,
    grossMarginFcfa: grossMargin,
    netMarginPercent,
    returnOnInvestmentPercent,
    breakEvenSalesRevenueFcfa: totalExpenditure,
    isFinanciallyViable: grossMargin > 0 && netMarginPercent >= 12, // Standard promoteur min 12%
  };
}
