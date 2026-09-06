/**
 * Module de calcul de bilan de puissance électrique et raccordement au réseau SBEE.
 */

export interface ElectricalLoadInputs {
  airConditionersCount: number; // Split 1.5 CV (~1100W) ou 2 CV
  waterHeatersCount: number; // Chauffe-eau électrique (~1500W - 2000W)
  electricOvenOrCooktop: boolean; // Four / Plaque induction (~3000W)
  waterBoosterPump: boolean; // Surpresseur / Pompe (~750W - 1500W)
  lightingAndSocketsAreaM2: number; // Surface pour prises et éclairage (~30W/m²)
  cableDistanceToPoleMeters: number; // Distance compteur - coffret général (m)
}

export function calculateElectricalLoadAndService(inputs: ElectricalLoadInputs): {
  totalInstalledPowerWatts: number;
  diversifiedDemandPowerWatts: number;
  apparentPowerKva: number;
  recommendedServiceType: "monophase_30A" | "monophase_60A" | "triphase_30A" | "triphase_60A";
  recommendedServiceLabel: string;
  recommendedCableSectionMm2: number;
  voltageDropPercent: number;
  recommendations: string[];
} {
  // Puissances unitaires types
  const acWatts = inputs.airConditionersCount * 1300;
  const heaterWatts = inputs.waterHeatersCount * 1800;
  const cookingWatts = inputs.electricOvenOrCooktop ? 3000 : 0;
  const pumpWatts = inputs.waterBoosterPump ? 1100 : 0;
  const baseSocketsWatts = Math.max(50, inputs.lightingAndSocketsAreaM2) * 30;

  const totalInstalledPowerWatts =
    acWatts + heaterWatts + cookingWatts + pumpWatts + baseSocketsWatts;

  // Facteur de foisonnement / simultanéité (NF C 15-100) : ~0.75 pour une villa standard
  const diversityFactor = 0.75;
  const diversifiedDemandPowerWatts = Math.round(totalInstalledPowerWatts * diversityFactor);

  // Puissance apparente en kVA (cos phi = 0.9)
  const apparentPowerKva = Number((diversifiedDemandPowerWatts / (1000 * 0.9)).toFixed(1));

  let recommendedServiceType: "monophase_30A" | "monophase_60A" | "triphase_30A" | "triphase_60A" =
    "monophase_30A";
  let recommendedServiceLabel = "Monophasé 30A (6 kVA)";

  if (apparentPowerKva > 18) {
    recommendedServiceType = "triphase_60A";
    recommendedServiceLabel = "Triphasé 60A (36 kVA) — Gros équipement";
  } else if (apparentPowerKva > 12) {
    recommendedServiceType = "triphase_30A";
    recommendedServiceLabel = "Triphasé 30A (18 kVA) — Recommandé pour équilibrage";
  } else if (apparentPowerKva > 6) {
    recommendedServiceType = "monophase_60A";
    recommendedServiceLabel = "Monophasé 60A (12 kVA)";
  }

  // Dimensionnement section câble cuivre (selon distance et ampérage) pour chute < 3%
  const isTri = recommendedServiceType.startsWith("triphase");
  const currentAmps = isTri
    ? (apparentPowerKva * 1000) / (400 * Math.sqrt(3))
    : (apparentPowerKva * 1000) / 230;

  let recommendedCableSectionMm2 = 10;
  if (inputs.cableDistanceToPoleMeters > 50 || currentAmps > 40) {
    recommendedCableSectionMm2 = 25;
  } else if (inputs.cableDistanceToPoleMeters > 30 || currentAmps > 25) {
    recommendedCableSectionMm2 = 16;
  }

  // Calcul approché de chute de tension (Cuivre rho = 0.023 ohm.mm²/m)
  const resistance = (0.023 * inputs.cableDistanceToPoleMeters * 2) / recommendedCableSectionMm2;
  const deltaU = currentAmps * resistance;
  const nominalVoltage = isTri ? 400 : 230;
  const voltageDropPercent = Number(((deltaU / nominalVoltage) * 100).toFixed(2));

  const recommendations: string[] = [
    "Prévoir un disjoncteur différentiel général 500mA sélectif en tête d'installation SBEE.",
    "Installer des interrupteurs différentiels 30mA Type A pour les circuits sensibles (plaque, prises) et Type AC pour l'éclairage.",
    "Équilibrer rigoureusement les charges entre les 3 phases si abonnement triphasé.",
  ];

  return {
    totalInstalledPowerWatts,
    diversifiedDemandPowerWatts,
    apparentPowerKva,
    recommendedServiceType,
    recommendedServiceLabel,
    recommendedCableSectionMm2,
    voltageDropPercent,
    recommendations,
  };
}
