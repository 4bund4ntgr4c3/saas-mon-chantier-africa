/**
 * Module de dimensionnement hydraulique de surpresseur et ballon à vessie pour alimentation SONEB.
 */

export interface WaterBoosterInputs {
  buildingHeightMeters: number; // Dénivelé géométrique (ex: 6m pour R+1)
  bathroomsCount: number; // Nb salles d'eau
  kitchensCount: number; // Nb cuisines
  pipeLengthMeters: number; // Longueur linéaire canalisations
  pipeType: "multicouche_pehd" | "pvc_pression" | "galva_ancien";
}

export function calculateWaterBoosterAndHmt(inputs: WaterBoosterInputs): {
  peakFlowRateM3h: number;
  peakFlowRateLmin: number;
  geometricHeightM: number;
  frictionLossesM: number;
  residualPressureRequiredM: number;
  totalDynamicHeadHmtMce: number;
  totalDynamicHeadHmtBars: number;
  recommendedPumpPowerHp: number;
  recommendedBladderTankVolumeLiters: number;
  recommendations: string[];
} {
  const bathrooms = Math.max(1, inputs.bathroomsCount);
  const kitchens = Math.max(1, inputs.kitchensCount);

  // Débit brut de base : Douche ~12 L/min, Lavabo ~6 L/min, WC ~9 L/min, Évier ~12 L/min
  // Pour chaque SDB complète (douche+lavabo+WC) ~ 27 L/min, cuisine ~ 12 L/min
  const totalBaseFlow = bathrooms * 27 + kitchens * 12;

  // Coefficient de simultanéité k = 1 / sqrt(x - 1)
  const simultaneousFactor = Math.min(1.0, 0.4 + 0.6 / Math.sqrt(bathrooms + kitchens));
  const peakFlowRateLmin = Math.round(totalBaseFlow * simultaneousFactor);
  const peakFlowRateM3h = Number((peakFlowRateLmin * 0.06).toFixed(2));

  // Pertes de charge régulières et singulières (~0.05 mCE par mètre de tuyau en PEHD/multicouche)
  const lossFactor = inputs.pipeType === "galva_ancien" ? 0.08 : 0.04;
  const frictionLossesM = Number((inputs.pipeLengthMeters * lossFactor * 1.15).toFixed(1));

  // Pression résiduelle souhaitée au robinet le plus haut : minimum 2.0 bars (20 mCE) pour un confort de jet optimal
  const residualPressureRequiredM = 20.0;

  // HMT = Dénivelé + Pertes de charge + Pression résiduelle
  const totalDynamicHeadHmtMce = Number(
    (inputs.buildingHeightMeters + frictionLossesM + residualPressureRequiredM).toFixed(1),
  );
  const totalDynamicHeadHmtBars = Number((totalDynamicHeadHmtMce / 10).toFixed(2));

  // Puissance estimée de la pompe (CV / HP)
  let recommendedPumpPowerHp = 0.5;
  if (totalDynamicHeadHmtMce > 40 || peakFlowRateM3h > 3.0) {
    recommendedPumpPowerHp = 1.5;
  } else if (totalDynamicHeadHmtMce > 30 || peakFlowRateM3h > 1.8) {
    recommendedPumpPowerHp = 1.0;
  } else if (totalDynamicHeadHmtMce > 22 || peakFlowRateM3h > 1.2) {
    recommendedPumpPowerHp = 0.75;
  }

  // Volume du réservoir à vessie (pour limiter les démarrages moteur à < 20 / heure)
  let recommendedBladderTankVolumeLiters = 50;
  if (bathrooms >= 4 || peakFlowRateM3h >= 2.5) {
    recommendedBladderTankVolumeLiters = 200;
  } else if (bathrooms >= 2 || peakFlowRateM3h >= 1.5) {
    recommendedBladderTankVolumeLiters = 100;
  }

  const recommendations: string[] = [
    "Toujours installer le surpresseur après un clapet anti-retour et un filtre à sédiments (50 microns).",
    "Gonfler la membrane du réservoir à vessie à 0.2 bar en-dessous de la pression d'enclenchement de la pompe (P_enclenchement - 0.2 bar).",
    "Ne jamais brancher la pompe en aspiration directe sur le compteur SONEB (illégal et risque de dépression) — aspirer depuis une bâche ou cuve tampon.",
  ];

  return {
    peakFlowRateM3h,
    peakFlowRateLmin,
    geometricHeightM: inputs.buildingHeightMeters,
    frictionLossesM,
    residualPressureRequiredM,
    totalDynamicHeadHmtMce,
    totalDynamicHeadHmtBars,
    recommendedPumpPowerHp,
    recommendedBladderTankVolumeLiters,
    recommendations,
  };
}
