/**
 * Module d'arbitrage locatif : Location nue vs Location meublée courte durée (Airbnb) au Bénin.
 */

export interface RentalStrategyInputs {
  propertyAcquisitionCostFcfa: number;
  unfurnishedMonthlyRentFcfa: number;
  furnishedNightlyRateFcfa: number;
  furnishedOccupancyRatePercent: number; // ex: 60%
}

export function compareRentalStrategies(inputs: RentalStrategyInputs): {
  unfurnished: {
    grossAnnualFcfa: number;
    netAnnualFcfa: number;
    netMonthlyCashflowFcfa: number;
    netYieldPercent: number;
  };
  furnished: {
    grossAnnualFcfa: number;
    netAnnualFcfa: number;
    netMonthlyCashflowFcfa: number;
    netYieldPercent: number;
  };
  advantageFcfaAnnual: number;
  recommendedStrategy: "meuble" | "nu";
} {
  // 1. LOCATION NUE (Longue durée)
  const unfurnishedGrossMonthly = inputs.unfurnishedMonthlyRentFcfa;
  const unfurnishedGrossAnnual = unfurnishedGrossMonthly * 12;
  // Déductions : 5% vacance + 8% gestion agence + 1 mois taxe foncière TFU/entretien
  const unfurnishedDeductions = unfurnishedGrossAnnual * 0.13 + unfurnishedGrossMonthly;
  const unfurnishedNetAnnual = Math.round(unfurnishedGrossAnnual - unfurnishedDeductions);
  const unfurnishedNetMonthly = Math.round(unfurnishedNetAnnual / 12);
  const unfurnishedYield =
    inputs.propertyAcquisitionCostFcfa > 0
      ? Number(((unfurnishedNetAnnual / inputs.propertyAcquisitionCostFcfa) * 100).toFixed(2))
      : 0;

  // 2. LOCATION MEUBLÉE COURTE DURÉE (Airbnb)
  const daysInMonth = 30;
  const occupiedNightsPerMonth = Math.round(
    daysInMonth * (inputs.furnishedOccupancyRatePercent / 100),
  );
  const furnishedGrossMonthly = occupiedNightsPerMonth * inputs.furnishedNightlyRateFcfa;
  const furnishedGrossAnnual = furnishedGrossMonthly * 12;

  // Déductions : 20% conciergerie/plateforme + charges eau/élec/fibre (65 000 FCFA/mois) + amortissement mobilier (30 000 FCFA/mois)
  const monthlyOperatingCosts = furnishedGrossMonthly * 0.2 + 65000 + 30000;
  const furnishedNetAnnual = Math.round((furnishedGrossMonthly - monthlyOperatingCosts) * 12);
  const furnishedNetMonthly = Math.round(furnishedNetAnnual / 12);
  const furnishedYield =
    inputs.propertyAcquisitionCostFcfa > 0
      ? Number(((furnishedNetAnnual / inputs.propertyAcquisitionCostFcfa) * 100).toFixed(2))
      : 0;

  const advantageFcfaAnnual = Math.abs(furnishedNetAnnual - unfurnishedNetAnnual);
  const recommendedStrategy = furnishedNetAnnual >= unfurnishedNetAnnual ? "meuble" : "nu";

  return {
    unfurnished: {
      grossAnnualFcfa: unfurnishedGrossAnnual,
      netAnnualFcfa: unfurnishedNetAnnual,
      netMonthlyCashflowFcfa: unfurnishedNetMonthly,
      netYieldPercent: unfurnishedYield,
    },
    furnished: {
      grossAnnualFcfa: furnishedGrossAnnual,
      netAnnualFcfa: furnishedNetAnnual,
      netMonthlyCashflowFcfa: furnishedNetMonthly,
      netYieldPercent: furnishedYield,
    },
    advantageFcfaAnnual,
    recommendedStrategy,
  };
}
