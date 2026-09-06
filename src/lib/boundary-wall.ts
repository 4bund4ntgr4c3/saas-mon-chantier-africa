/**
 * Module de calcul des matériaux et ferraillage pour mur de clôture et sécurisation périphérique.
 */

export interface BoundaryWallInputs {
  perimeterLinearMeters: number; // Linéaire total (ex: 80m)
  gateWidthMeters: number; // Largeur portail à déduire (ex: 4m)
  wallHeightMeters: number; // Hauteur hors sol (ex: 2.2m)
  postSpacingMeters: number; // Espacement raidisseurs (ex: 3m)
  hasTopChaperonCover: boolean; // Chaperons béton 2 pentes
  hasBarbedWireSecurity: boolean; // Concertina / Razeau anti-intrusion
}

export function calculateBoundaryWallMaterials(inputs: BoundaryWallInputs): {
  netWallLengthMeters: number;
  wallSurfaceM2: number;
  hollowBlocks15Count: number;
  stiffenerPostsCount: number;
  cementBags50kgTotal: number;
  sandM3Total: number;
  gravelM3Total: number;
  rebarBarsHA8Count: number;
  rebarBarsHA10Count: number;
  chaperonsCount: number;
  estimatedCostFcfa: number;
} {
  const netLength = Math.max(1, inputs.perimeterLinearMeters - inputs.gateWidthMeters);
  const wallSurface = Number((netLength * inputs.wallHeightMeters).toFixed(1));

  // 1 m² de mur = 10 agglos de 15x20x40 cm (+ 5% casse)
  const hollowBlocks15Count = Math.ceil(wallSurface * 10 * 1.05);

  // Nombre de raidisseurs (poteaux) : 1 à chaque angle + tous les 3m
  const stiffenerPostsCount = Math.ceil(netLength / inputs.postSpacingMeters) + 1;

  // Béton pour fondation filante (40x20 cm) + chaînage bas (15x20 cm) + chaînage haut (15x20 cm) + poteaux
  const footingVolume = netLength * 0.4 * 0.2;
  const beamVolume = netLength * 0.15 * 0.2 * 2; // Bas + Haut
  const postsVolume = stiffenerPostsCount * (0.15 * 0.15 * inputs.wallHeightMeters);
  const totalConcreteM3 = footingVolume + beamVolume + postsVolume;

  // Ciment pour béton (350kg/m³) + mortier de pose des agglos & enduits 2 faces
  const cementForConcreteKg = totalConcreteM3 * 350;
  const cementForMortarAndPlasterKg = wallSurface * 22; // ~22kg ciment / m² de mur maçonné + enduit
  const cementBags50kgTotal = Math.ceil((cementForConcreteKg + cementForMortarAndPlasterKg) / 50);

  // Sable et gravier
  const sandM3Total = Number((totalConcreteM3 * 0.45 + wallSurface * 0.04).toFixed(1));
  const gravelM3Total = Number((totalConcreteM3 * 0.8).toFixed(1));

  // Aciers : Longrines + chaînage haut (4 barres HA10) + raidisseurs (4 barres HA10) + cadres HA6/HA8
  const totalLinearBeams = netLength * 2 + stiffenerPostsCount * inputs.wallHeightMeters;
  const rebarBarsHA10Count = Math.ceil((totalLinearBeams * 4 * 1.1) / 12); // Barres de 12m
  const rebarBarsHA8Count = Math.ceil((totalLinearBeams * 3.5 * 1.1) / 12); // Cadres tous les 20cm

  const chaperonsCount = inputs.hasTopChaperonCover ? Math.ceil(netLength / 0.5) : 0; // Chaperons de 50cm

  // Estimation financière indicative moyenne (agglos + béton + ferraille + main d'œuvre au Bénin)
  // ~ 28 000 FCFA le mètre linéaire de clôture fini 2.20m
  let costPerMeter = 28000;
  if (inputs.hasTopChaperonCover) costPerMeter += 2500;
  if (inputs.hasBarbedWireSecurity) costPerMeter += 3500;
  const estimatedCostFcfa = Math.round(netLength * costPerMeter);

  return {
    netWallLengthMeters: Number(netLength.toFixed(1)),
    wallSurfaceM2: wallSurface,
    hollowBlocks15Count,
    stiffenerPostsCount,
    cementBags50kgTotal,
    sandM3Total,
    gravelM3Total,
    rebarBarsHA8Count,
    rebarBarsHA10Count,
    chaperonsCount,
    estimatedCostFcfa,
  };
}
