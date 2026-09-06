/**
 * Module de calcul de la dotation en extincteurs et conformité sécurité incendie.
 */

export type FireBuildingCategory = "habitation_rdc" | "habitation_etages" | "bureaux_commerce";

export interface FireSafetyInputs {
  buildingCategory: FireBuildingCategory;
  totalFloorAreaM2: number;
  levelsCount: number;
  bedroomsCount: number;
  hasGeneratorOrSolarInverter: boolean;
  hasEnclosedGarage: boolean;
}

export function evaluateFireSafetyEquipment(inputs: FireSafetyInputs): {
  waterExtinguishers6LCount: number;
  co2Extinguishers2kgCount: number;
  powderExtinguishers6kgCount: number;
  smokeDetectorsDaafCount: number;
  estimatedEquipmentCostFcfa: number;
  fireSafetyRules: string[];
} {
  const levels = Math.max(1, inputs.levelsCount);
  const area = Math.max(20, inputs.totalFloorAreaM2);

  // Règle Eau 6L : Minimum 1 par niveau, ou 1 pour 200m²
  const waterByArea = Math.ceil(area / 200);
  const waterExtinguishers6LCount = Math.max(levels, waterByArea);

  // Règle CO2 2kg : 1 pour le tableau électrique général + 1 si groupe électrogène/local solaire
  let co2Extinguishers2kgCount = 1;
  if (inputs.hasGeneratorOrSolarInverter) {
    co2Extinguishers2kgCount += 1;
  }

  // Règle Poudre ABC 6kg : 1 si garage fermé ou stockage inflammable
  const powderExtinguishers6kgCount = inputs.hasEnclosedGarage ? 1 : 0;

  // DAAF (Détecteurs de fumée) : 1 par chambre + 1 par palier/couloir
  const smokeDetectorsDaafCount = inputs.bedroomsCount + levels;

  // Coûts indicatifs moyens au Bénin (Extincteur Eau 6L ~ 35 000 FCFA, CO2 2kg ~ 45 000 FCFA, Poudre 6kg ~ 30 000 FCFA, DAAF ~ 10 000 FCFA)
  const totalCost =
    waterExtinguishers6LCount * 35000 +
    co2Extinguishers2kgCount * 45000 +
    powderExtinguishers6kgCount * 30000 +
    smokeDetectorsDaafCount * 10000;

  const fireSafetyRules = [
    "Placer les extincteurs sur des supports muraux à une hauteur maximale de 1.20m du sol, bien visibles et dégagés.",
    "Contrôle et vérification annuelle obligatoire de la pression des manomètres et des scellés.",
    "Ne JAMAIS utiliser un extincteur à eau sur un feu d'origine électrique (utiliser impérativement le CO2).",
    "Installer les détecteurs de fumée (DAAF) au plafond, au centre des pièces et à plus de 30 cm des angles de murs.",
  ];

  return {
    waterExtinguishers6LCount,
    co2Extinguishers2kgCount,
    powderExtinguishers6kgCount,
    smokeDetectorsDaafCount,
    estimatedEquipmentCostFcfa: totalCost,
    fireSafetyRules,
  };
}
