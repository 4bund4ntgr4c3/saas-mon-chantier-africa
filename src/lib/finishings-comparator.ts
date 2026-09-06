/**
 * Module d'arbitrage et comparateur des gammes de finitions pour le propriétaire.
 */

export type FinishingTier = "eco" | "standard" | "luxe";

export interface FinishingOption {
  id: string;
  category: "carrelage" | "peinture" | "sanitaires" | "portes";
  categoryLabel: string;
  surfaceOrQuantity: number;
  unit: string;
  selectedTier: FinishingTier;
  rates: {
    eco: { name: string; unitPriceFcfa: number; durabilityYears: number };
    standard: { name: string; unitPriceFcfa: number; durabilityYears: number };
    luxe: { name: string; unitPriceFcfa: number; durabilityYears: number };
  };
}

export function getDefaultFinishingOptions(): FinishingOption[] {
  return [
    {
      id: "opt-carrelage",
      category: "carrelage",
      categoryLabel: "Carrelage sols & murs",
      surfaceOrQuantity: 150,
      unit: "m²",
      selectedTier: "standard",
      rates: {
        eco: { name: "Grès émaillé 40x40", unitPriceFcfa: 4500, durabilityYears: 8 },
        standard: { name: "Grès cérame poli 60x60", unitPriceFcfa: 8500, durabilityYears: 20 },
        luxe: { name: "Marbre d'importation / Granit", unitPriceFcfa: 22000, durabilityYears: 40 },
      },
    },
    {
      id: "opt-peinture",
      category: "peinture",
      categoryLabel: "Peinture intérieure & extérieure",
      surfaceOrQuantity: 400,
      unit: "m²",
      selectedTier: "standard",
      rates: {
        eco: { name: "Acrylique mate standard", unitPriceFcfa: 1200, durabilityYears: 3 },
        standard: {
          name: "Acrylique satinée lavable anti-moisissures",
          unitPriceFcfa: 2500,
          durabilityYears: 7,
        },
        luxe: {
          name: "Stuc vénitien & peinture texturée haut de gamme",
          unitPriceFcfa: 6000,
          durabilityYears: 15,
        },
      },
    },
    {
      id: "opt-sanitaires",
      category: "sanitaires",
      categoryLabel: "Équipements sanitaires & Salles de bain",
      surfaceOrQuantity: 3,
      unit: "salles de bain",
      selectedTier: "standard",
      rates: {
        eco: {
          name: "Pack WC sur pied + vasque basique",
          unitPriceFcfa: 75000,
          durabilityYears: 5,
        },
        standard: {
          name: "WC suspendu + meuble vasque + colonne douche",
          unitPriceFcfa: 180000,
          durabilityYears: 12,
        },
        luxe: {
          name: "Robinetterie thermostatique encastrée + douche italienne verre",
          unitPriceFcfa: 450000,
          durabilityYears: 25,
        },
      },
    },
    {
      id: "opt-portes",
      category: "portes",
      categoryLabel: "Menuiseries & Portes d'accès",
      surfaceOrQuantity: 8,
      unit: "portes",
      selectedTier: "standard",
      rates: {
        eco: { name: "Portes isoplanes pré-peintes", unitPriceFcfa: 35000, durabilityYears: 6 },
        standard: {
          name: "Portes en bois massif Iroko local",
          unitPriceFcfa: 95000,
          durabilityYears: 25,
        },
        luxe: {
          name: "Portes blindées aluminium & serrures biométriques",
          unitPriceFcfa: 280000,
          durabilityYears: 35,
        },
      },
    },
  ];
}

export function computeTotalFinishingBudget(options: FinishingOption[]): {
  totalEstimatedFcfa: number;
  totalEcoFcfa: number;
  totalStandardFcfa: number;
  totalLuxeFcfa: number;
} {
  let totalEstimated = 0;
  let totalEco = 0;
  let totalStandard = 0;
  let totalLuxe = 0;

  for (const opt of options) {
    const qty = opt.surfaceOrQuantity;
    totalEco += qty * opt.rates.eco.unitPriceFcfa;
    totalStandard += qty * opt.rates.standard.unitPriceFcfa;
    totalLuxe += qty * opt.rates.luxe.unitPriceFcfa;
    totalEstimated += qty * opt.rates[opt.selectedTier].unitPriceFcfa;
  }

  return {
    totalEstimatedFcfa: totalEstimated,
    totalEcoFcfa: totalEco,
    totalStandardFcfa: totalStandard,
    totalLuxeFcfa: totalLuxe,
  };
}
