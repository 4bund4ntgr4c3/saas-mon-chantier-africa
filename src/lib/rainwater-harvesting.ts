/**
 * Module de dimensionnement de cuve et récupération d'eau pluviale au Bénin.
 */

export type BeninRainZone = "cotonou_calavi" | "porto_novo" | "parakou" | "natitingou";

export const BENIN_RAIN_ZONES: Record<BeninRainZone, { label: string; annualRainfallMm: number }> =
  {
    cotonou_calavi: { label: "Cotonou / Abomey-Calavi (Littoral)", annualRainfallMm: 1300 },
    porto_novo: { label: "Porto-Novo / Sèmè-Kpodji (Ouémé)", annualRainfallMm: 1200 },
    parakou: { label: "Parakou / Tchaourou (Borgou)", annualRainfallMm: 1100 },
    natitingou: { label: "Natitingou / Djougou (Atacora / Donga)", annualRainfallMm: 1350 },
  };

export interface RainwaterHarvestingInputs {
  roofSurfaceM2: number;
  roofType: "bac_alu" | "tuiles" | "dalle_beton";
  zone: BeninRainZone;
  householdMembersCount: number;
}

export function calculateRainwaterCapacity(inputs: RainwaterHarvestingInputs): {
  annualHarvestableLiters: number;
  monthlyAverageLiters: number;
  recommendedTankSizeLiters: number;
  autonomyDaysWithoutSoneb: number;
  annualSonebSavingsFcfa: number;
} {
  const rainfallMm = BENIN_RAIN_ZONES[inputs.zone].annualRainfallMm;
  const runoffCoeff =
    inputs.roofType === "bac_alu" ? 0.9 : inputs.roofType === "tuiles" ? 0.8 : 0.7;

  // 1 mm de pluie sur 1 m² = 1 Litre d'eau
  const annualLiters = Math.round(inputs.roofSurfaceM2 * rainfallMm * runoffCoeff);
  const monthlyAverage = Math.round(annualLiters / 12);

  // Consommation ménage quotidienne de substitution (WC, lessive, arrosage, nettoyage) = 40 L / personne / j
  const dailyNeedsLiters = Math.max(1, inputs.householdMembersCount) * 40;

  // Dimensionnement cuve recommandé = réserve pour 21 jours d'autonomie moyenne
  const rawTankSize = dailyNeedsLiters * 21;
  // Arrondi aux standards du marché béninois (1 000, 2 000, 3 000, 5 000, 10 000 L)
  let recommendedTankSize = 3000;
  if (rawTankSize <= 1500) recommendedTankSize = 1500;
  else if (rawTankSize <= 3000) recommendedTankSize = 3000;
  else if (rawTankSize <= 5000) recommendedTankSize = 5000;
  else recommendedTankSize = 10000;

  const autonomyDays = Math.round(recommendedTankSize / dailyNeedsLiters);

  // Tarif moyen SONEB : ~550 FCFA / m³ (1 000 L)
  const annualSavings = Math.round((annualLiters / 1000) * 550);

  return {
    annualHarvestableLiters: annualLiters,
    monthlyAverageLiters: monthlyAverage,
    recommendedTankSizeLiters: recommendedTankSize,
    autonomyDaysWithoutSoneb: autonomyDays,
    annualSonebSavingsFcfa: annualSavings,
  };
}
