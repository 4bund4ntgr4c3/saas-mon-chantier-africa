/**
 * Module de calcul de métré et de cubage de matériaux de construction (Afrique de l'Ouest).
 * Basé sur les standards de dosage usuels (350 kg/m³ pour béton armé, agglos standard 15x20x40).
 */

export interface ConcreteRequirement {
  volumeM3: number;
  cementBags50kg: number;
  sandTonnes: number;
  gravelTonnes: number;
  waterLiters: number;
  steelKgEstimated: number;
  steelBars12mCount: number; // estimation en barres équivalent HA 10/12
}

export interface MasonryRequirement {
  wallAreaM2: number;
  blocksCount: number; // agglos (avec 5% de casse)
  cementBags50kg: number;
  sandTonnes: number;
}

export interface RoofingRequirement {
  surfaceM2: number;
  corrugatedSheetsCount: number; // tôles bacs (ex: 3m ou 4m)
  roofingNailsKg: number;
  ridgeCapsCount: number; // faîtières
}

/**
 * Calcule les besoins pour un élément en béton armé (dalle, semelle, poteau, poutre).
 * @param length Longueur en mètres
 * @param width Largeur en mètres
 * @param thickness Épaisseur ou hauteur en mètres
 * @param dosageKgPerM3 Dosage en ciment (350 kg/m³ par défaut pour béton armé)
 */
export function calculateConcrete(
  length: number,
  width: number,
  thickness: number,
  dosageKgPerM3: number = 350,
): ConcreteRequirement {
  const volumeM3 = Number(
    (Math.max(0, length) * Math.max(0, width) * Math.max(0, thickness)).toFixed(2),
  );

  // 350 kg/m³ = 7 sacs de 50 kg par m³
  const cementKg = volumeM3 * dosageKgPerM3;
  const cementBags50kg = Math.ceil(cementKg / 50);

  // ~0.8 tonne de sable par m³ de béton
  const sandTonnes = Number((volumeM3 * 0.8).toFixed(2));

  // ~1.2 tonne de gravier (concassé 15/25 ou 5/15) par m³
  const gravelTonnes = Number((volumeM3 * 1.2).toFixed(2));

  // ~175 L d'eau par m³
  const waterLiters = Math.round(volumeM3 * 175);

  // Ratio moyen d'acier : 80 kg d'acier / m³ de béton
  const steelKgEstimated = Math.round(volumeM3 * 80);

  // Poids d'une barre de fer de 12m en HA10 ~ 7.4 kg, HA12 ~ 10.65 kg (moyenne ~ 9 kg)
  const steelBars12mCount = Math.ceil(steelKgEstimated / 9);

  return {
    volumeM3,
    cementBags50kg,
    sandTonnes,
    gravelTonnes,
    waterLiters,
    steelKgEstimated,
    steelBars12mCount,
  };
}

/**
 * Calcule les besoins pour un mur en maçonnerie (agglos de 10, 15 ou 20 cm).
 * @param length Longueur du mur en mètres
 * @param height Hauteur du mur en mètres
 * @param openingsAreaM2 Surface totale des ouvertures (portes, fenêtres) à déduire
 * @param blockThickness Épaisseur de l'agglo en cm (10, 15, ou 20)
 */
export function calculateMasonry(
  length: number,
  height: number,
  openingsAreaM2: number = 0,
  blockThickness: 10 | 15 | 20 = 15,
): MasonryRequirement {
  const grossArea = Math.max(0, length) * Math.max(0, height);
  const wallAreaM2 = Number(Math.max(0, grossArea - Math.max(0, openingsAreaM2)).toFixed(2));

  // Standard : ~10 agglos au m² pour du 15x20x40 ou 20x20x40 + 5% de perte/casse
  const rawBlocks = wallAreaM2 * 10;
  const blocksCount = Math.ceil(rawBlocks * 1.05);

  // Mortier de pose :
  // Agglo de 15 : ~0.022 m³ mortier/m² (dosage mortier 250 kg/m³ => ~0.11 sac ciment/m² et 0.035 t sable/m²)
  const factor = blockThickness === 20 ? 1.3 : blockThickness === 10 ? 0.7 : 1.0;
  const cementBags50kg = Math.ceil(wallAreaM2 * 0.12 * factor);
  const sandTonnes = Number((wallAreaM2 * 0.035 * factor).toFixed(2));

  return {
    wallAreaM2,
    blocksCount,
    cementBags50kg,
    sandTonnes,
  };
}

/**
 * Calcule les besoins pour une toiture en tôles bacs.
 * @param groundLength Longueur du bâtiment au sol en mètres
 * @param groundWidth Largeur du bâtiment au sol en mètres
 * @param pitchAngleDegrees Pente du toit en degrés (ex: 15° à 25°)
 * @param sheetLengthM Longueur standard des tôles utilisées (ex: 3m, 4m ou 6m)
 */
export function calculateRoofing(
  groundLength: number,
  groundWidth: number,
  pitchAngleDegrees: number = 20,
  sheetLengthM: number = 3,
): RoofingRequirement {
  const pitchRad = (pitchAngleDegrees * Math.PI) / 180;
  const pitchFactor = 1 / Math.cos(pitchRad);

  // Débords de toiture standard : +0.6m de chaque côté
  const totalLength = Math.max(0, groundLength) + 1.2;
  const totalWidth = (Math.max(0, groundWidth) + 1.2) * pitchFactor;

  const surfaceM2 = Number((totalLength * totalWidth).toFixed(2));

  // Largeur utile d'une tôle bac : ~0.90 m (avec chevauchement d'une onde)
  const usefulWidth = 0.9;
  const sheetSurfaceUseful = usefulWidth * Math.max(1, sheetLengthM);

  // +10% de recouvrement et découpes
  const corrugatedSheetsCount = Math.ceil((surfaceM2 / sheetSurfaceUseful) * 1.1);

  // Pointes à toiture : environ 6 pointes par m² (1 kg ~ 100 pointes)
  const roofingNailsKg = Math.ceil((surfaceM2 * 6) / 100);

  // Faîtières : longueur du faîtage / 1.8m (longueur utile faîtière de 2m)
  const ridgeCapsCount = Math.ceil(totalLength / 1.8);

  return {
    surfaceM2,
    corrugatedSheetsCount,
    roofingNailsKg,
    ridgeCapsCount,
  };
}
