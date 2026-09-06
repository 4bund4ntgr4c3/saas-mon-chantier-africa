/**
 * Module de dimensionnement de l'assainissement autonome (Fosse septique toutes eaux, bac à graisse, puits perdu).
 */

export interface SepticTankSizingInputs {
  occupantsCount: number; // Nombre d'habitants permanents (EH)
  hasGreaseTrap: boolean; // Bac à graisse pour eaux de cuisine
  soilPermeability: "sable_permeable" | "terre_moyenne" | "argile_impermeable";
  isHighWaterTable: boolean; // Nappe haute (Cotonou, zones lagunaires)
}

export function sizeSepticSanitation(inputs: SepticTankSizingInputs): {
  septicTankVolumeM3: number;
  septicTankDimensions: { lengthM: number; widthM: number; heightWaterM: number };
  greaseTrapVolumeLiters: number;
  soakawayDiameterM: number;
  soakawayDepthM: number;
  isSoakawayFeasible: boolean;
  recommendations: string[];
} {
  const safeOccupants = Math.max(1, inputs.occupantsCount);

  // Règle de dimensionnement standard :
  // Jusqu'à 5 pièces principales / personnes : 3 m³
  // Au-delà : + 0.5 m³ par occupant supplémentaire
  let volumeM3 = 3.0;
  if (safeOccupants > 5) {
    volumeM3 += (safeOccupants - 5) * 0.5;
  }
  volumeM3 = Number(volumeM3.toFixed(1));

  // Dimensions types (proportion L = 2 à 3 x l, hauteur d'eau utile 1.5m)
  const widthM = 1.2;
  const heightWaterM = 1.5;
  const lengthM = Number((volumeM3 / (widthM * heightWaterM)).toFixed(2));

  // Bac dégraisseur : 200 Litres pour cuisine standard, 500L si > 6 personnes
  const greaseTrapVolumeLiters = safeOccupants > 6 ? 500 : 200;

  // Puits perdu (puits d'infiltration) : diamètre 1.5m à 2m, profondeur 2m à 3m
  const soakawayDiameterM = 1.5;
  const soakawayDepthM = inputs.isHighWaterTable ? 1.5 : 2.5;

  // Si nappe trop haute (< 1m) ou argile imperméable, le puits perdu simple est déconseillé -> micro-station ou filtre à sable surélevé
  const isSoakawayFeasible = !(
    inputs.isHighWaterTable || inputs.soilPermeability === "argile_impermeable"
  );

  const recommendations: string[] = [
    "Séparer les eaux vannes (WC) et les eaux ménagères (douche, cuisine) en amont du bac à graisse.",
    "Installer un évent de ventilation haute (Ø 100 mm) au-dessus du toit avec chapeau d'aération contre les mauvaises odeurs.",
    "Vidange préventive des boues tous les 3 à 4 ans lorsque le volume des boues atteint 50% de la cuve.",
  ];

  if (!isSoakawayFeasible) {
    recommendations.unshift(
      "ATTENTION : Nappe phréatique affleurante ou sol imperméable. Prévoir un tertre d'infiltration surélevé ou filtre zéolithe / micro-station pour éviter la remontée des effluents.",
    );
  }

  return {
    septicTankVolumeM3: volumeM3,
    septicTankDimensions: { lengthM, widthM, heightWaterM },
    greaseTrapVolumeLiters,
    soakawayDiameterM,
    soakawayDepthM,
    isSoakawayFeasible,
    recommendations,
  };
}
