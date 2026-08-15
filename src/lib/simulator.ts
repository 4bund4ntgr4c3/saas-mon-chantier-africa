/**
 * Module d'estimation et de simulation de coût global de construction (Bénin / Afrique de l'Ouest).
 */

export type BuildingType = "villa_basse" | "duplex_r1" | "immeuble_r2_r3" | "cloture";
export type StandingLevel = "economique" | "moyen" | "haut_standing";

export interface CostBreakdown {
  grosOeuvre: number; // ~48%
  secondOeuvre: number; // ~24% (plomberie, électricité, étanchéité)
  finitions: number; // ~22% (carrelage, peinture, menuiserie, sanitaires)
  etudesEtPermis: number; // ~6% (plans d'architecte, étude de sol, permis de construire)
}

export interface SimulationResult {
  buildingType: BuildingType;
  buildingTypeLabel: string;
  standing: StandingLevel;
  standingLabel: string;
  surfaceM2: number;
  pricePerM2: number;
  totalCostEstimated: number;
  breakdown: CostBreakdown;
  durationMonthsEstimated: number;
}

const BASE_RATES: Record<BuildingType, Record<StandingLevel, number>> = {
  villa_basse: {
    economique: 180000,
    moyen: 250000,
    haut_standing: 360000,
  },
  duplex_r1: {
    economique: 230000,
    moyen: 320000,
    haut_standing: 450000,
  },
  immeuble_r2_r3: {
    economique: 280000,
    moyen: 390000,
    haut_standing: 520000,
  },
  cloture: {
    economique: 18000, // prix au mètre linéaire
    moyen: 28000,
    haut_standing: 45000,
  },
};

export const BUILDING_TYPE_OPTIONS: {
  value: BuildingType;
  label: string;
  defaultArea: number;
  unit: string;
}[] = [
  { value: "villa_basse", label: "Villa basse (F3 / F4 / F5)", defaultArea: 120, unit: "m²" },
  { value: "duplex_r1", label: "Villa duplex / R+1", defaultArea: 200, unit: "m²" },
  { value: "immeuble_r2_r3", label: "Immeuble locatif (R+2 / R+3)", defaultArea: 450, unit: "m²" },
  { value: "cloture", label: "Clôture de parcelle (500m²)", defaultArea: 90, unit: "m linéaire" },
];

export const STANDING_OPTIONS: { value: StandingLevel; label: string; description: string }[] = [
  {
    value: "economique",
    label: "Économique",
    description: "Matériaux standards locaux, finitions sobres.",
  },
  {
    value: "moyen",
    label: "Moyen standing",
    description: "Carrelage grès cérame, sanitaires de qualité, baies alu.",
  },
  {
    value: "haut_standing",
    label: "Haut standing / Luxe",
    description: "Staff moderne, domotique, marbre, climatisation gainable.",
  },
];

export function simulateConstructionCost(
  buildingType: BuildingType,
  standing: StandingLevel,
  surface: number,
): SimulationResult {
  const safeSurface = Math.max(1, surface);
  const pricePerM2 = BASE_RATES[buildingType][standing];
  const totalCostEstimated = Math.round(safeSurface * pricePerM2);

  const breakdown: CostBreakdown = {
    grosOeuvre: Math.round(totalCostEstimated * 0.48),
    secondOeuvre: Math.round(totalCostEstimated * 0.24),
    finitions: Math.round(totalCostEstimated * 0.22),
    etudesEtPermis: Math.round(totalCostEstimated * 0.06),
  };

  const durationMonthsEstimated =
    buildingType === "cloture"
      ? 1
      : buildingType === "villa_basse"
        ? 5
        : buildingType === "duplex_r1"
          ? 8
          : 14;

  const typeMeta = BUILDING_TYPE_OPTIONS.find((t) => t.value === buildingType);
  const standingMeta = STANDING_OPTIONS.find((s) => s.value === standing);

  return {
    buildingType,
    buildingTypeLabel: typeMeta?.label ?? "Bâtiment",
    standing,
    standingLabel: standingMeta?.label ?? "Moyen",
    surfaceM2: safeSurface,
    pricePerM2,
    totalCostEstimated,
    breakdown,
    durationMonthsEstimated,
  };
}
