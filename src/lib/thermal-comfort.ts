/**
 * Module d'évaluation du confort thermique passif et économies d'énergie en climat tropical.
 */

export type WallMaterial = "agglo_creux_15" | "btc_terre_stabilisee" | "brique_cuite_alveolaire";

export interface ThermalComfortSimulation {
  materialLabel: string;
  thermalPhaseShiftHours: number; // Déphasage thermique en heures
  indoorTemperatureDropCelsius: number; // Baisse de température ressentie sans clim
  acEnergySavingPercent: number; // Économie sur la climatisation
  annualSavingsFcfa: number; // Économie annuelle estimée
  passiveDesignAdvices: string[];
}

export function simulateTropicalThermalComfort(
  material: WallMaterial,
  hasOverhangingRoof: boolean,
  hasEastWestSunshades: boolean,
  baseAnnualAcBillFcfa: number = 360000, // 30 000 FCFA/mois de clim
): ThermalComfortSimulation {
  let materialLabel = "";
  let basePhaseShift = 0;
  let baseTempDrop = 0;
  let baseSavingPct = 0;

  switch (material) {
    case "agglo_creux_15":
      materialLabel = "Agglos creux ciment standard (15 cm)";
      basePhaseShift = 4;
      baseTempDrop = 0.5;
      baseSavingPct = 5;
      break;
    case "btc_terre_stabilisee":
      materialLabel = "Briques de Terre Compressée (BTC 14-20 cm)";
      basePhaseShift = 11;
      baseTempDrop = 3.5;
      baseSavingPct = 35;
      break;
    case "brique_cuite_alveolaire":
      materialLabel = "Briques rouges alvéolaires en terre cuite";
      basePhaseShift = 8;
      baseTempDrop = 2.0;
      baseSavingPct = 20;
      break;
  }

  // Bonus débords de toiture et brise-soleil
  let totalSavingPct = baseSavingPct;
  let totalTempDrop = baseTempDrop;

  if (hasOverhangingRoof) {
    totalSavingPct += 10;
    totalTempDrop += 1.0;
  }

  if (hasEastWestSunshades) {
    totalSavingPct += 15;
    totalTempDrop += 1.5;
  }

  totalSavingPct = Math.min(60, totalSavingPct);
  const annualSavingsFcfa = Math.round((baseAnnualAcBillFcfa * totalSavingPct) / 100);

  const passiveDesignAdvices = [
    "Favoriser la ventilation traversante naturelle (ouvertures face aux vents dominants Sud-Ouest à Cotonou).",
    "Installer des faux-plafonds isolés (laine de roche ou panneaux isolants) sous les toitures en bac alu.",
    "Créer des débords de toiture d'au moins 60 cm pour ombrager les façades et protéger de la pluie battante.",
  ];

  return {
    materialLabel,
    thermalPhaseShiftHours: basePhaseShift,
    indoorTemperatureDropCelsius: Number(totalTempDrop.toFixed(1)),
    acEnergySavingPercent: totalSavingPct,
    annualSavingsFcfa,
    passiveDesignAdvices,
  };
}
