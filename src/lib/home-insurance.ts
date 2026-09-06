/**
 * Module d'assurance habitation multirisque (MRH) et couverture inondation/incendie au Bénin.
 */

export interface HomeInsuranceInputs {
  propertyValueFcfa: number;
  contentsValueFcfa: number;
  includeFloodAndWaterDamage: boolean;
  includeElectricalSurgeProtection: boolean;
}

export function calculateHomeInsuranceQuote(inputs: HomeInsuranceInputs): {
  baseAnnualPremiumFcfa: number;
  floodCoverageFcfa: number;
  electricalSurgeFcfa: number;
  totalAnnualPremiumFcfa: number;
  monthlyEquivalentFcfa: number;
} {
  // Base bâtiment : ~0.15% de la valeur de reconstruction + 0.3% mobilier
  const buildingRate = 0.0015;
  const contentsRate = 0.003;

  const baseAnnual = Math.round(
    inputs.propertyValueFcfa * buildingRate + inputs.contentsValueFcfa * contentsRate,
  );

  // Option Inondations / remontées de nappe phréatique (Cotonou, Calavi)
  const floodCoverage = inputs.includeFloodAndWaterDamage
    ? Math.round(inputs.propertyValueFcfa * 0.0005)
    : 0;

  // Option Surtension électrique SBEE
  const electricalSurge = inputs.includeElectricalSurgeProtection
    ? Math.round(inputs.contentsValueFcfa * 0.001)
    : 0;

  const totalAnnual = baseAnnual + floodCoverage + electricalSurge;
  const monthlyEquivalent = Math.round(totalAnnual / 12);

  return {
    baseAnnualPremiumFcfa: baseAnnual,
    floodCoverageFcfa: floodCoverage,
    electricalSurgeFcfa: electricalSurge,
    totalAnnualPremiumFcfa: totalAnnual,
    monthlyEquivalentFcfa: monthlyEquivalent,
  };
}
