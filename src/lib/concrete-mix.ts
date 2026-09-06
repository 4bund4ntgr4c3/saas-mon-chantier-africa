/**
 * Module de formulation des bétons et calcul des dosages volumétriques & pondéraux.
 */

export type ConcreteClass = "B15" | "B20" | "B25" | "B30";

export interface ConcreteMixRecipe {
  className: ConcreteClass;
  targetStrength28DaysMpa: number;
  applicationUsage: string;
  cementDosageKgPerM3: number;
  sandLitersPer50kgBag: number;
  gravelLitersPer50kgBag: number;
  waterLitersPer50kgBag: number;
  waterCementRatio: number;
}

export const CONCRETE_RECIPES: Record<ConcreteClass, ConcreteMixRecipe> = {
  B15: {
    className: "B15",
    targetStrength28DaysMpa: 15,
    applicationUsage: "Béton de propreté, formes de pente, dallages non armés",
    cementDosageKgPerM3: 250,
    sandLitersPer50kgBag: 80,
    gravelLitersPer50kgBag: 120,
    waterLitersPer50kgBag: 30,
    waterCementRatio: 0.6,
  },
  B20: {
    className: "B20",
    targetStrength28DaysMpa: 20,
    applicationUsage: "Semelles filantes, radiers, poteaux d'habitations RDC",
    cementDosageKgPerM3: 300,
    sandLitersPer50kgBag: 65,
    gravelLitersPer50kgBag: 100,
    waterLitersPer50kgBag: 27,
    waterCementRatio: 0.54,
  },
  B25: {
    className: "B25",
    targetStrength28DaysMpa: 25,
    applicationUsage:
      "Béton armé structural standard : Poteaux, Poutres, Dalles pleines, Chaînages (R+1/R+2)",
    cementDosageKgPerM3: 350,
    sandLitersPer50kgBag: 50, // ~1 brouette rase de 50L
    gravelLitersPer50kgBag: 80, // ~1.5 brouette
    waterLitersPer50kgBag: 25, // ~2.5 seaux de maçon de 10L
    waterCementRatio: 0.5,
  },
  B30: {
    className: "B30",
    targetStrength28DaysMpa: 30,
    applicationUsage:
      "Ouvrages d'art, voiles périphériques sous-sol, radiers immergés, R+3 et plus",
    cementDosageKgPerM3: 400,
    sandLitersPer50kgBag: 40,
    gravelLitersPer50kgBag: 70,
    waterLitersPer50kgBag: 22,
    waterCementRatio: 0.44,
  },
};

export function calculateConcreteBatchMaterials(
  volumeM3: number,
  concreteClass: ConcreteClass,
): {
  cementBags50kg: number;
  sandM3: number;
  gravelM3: number;
  waterLiters: number;
  recommendations: string[];
} {
  const recipe = CONCRETE_RECIPES[concreteClass];
  const safeVolume = Math.max(0.1, volumeM3);

  // Avec 5% de marge de pertes sur chantier
  const totalCementKg = safeVolume * recipe.cementDosageKgPerM3 * 1.05;
  const cementBags50kg = Math.ceil(totalCementKg / 50);

  // Sand : 0.45 m³ de sable par m³ de béton coulé en moyenne
  const sandM3 = Number((safeVolume * 0.45 * 1.05).toFixed(2));

  // Gravel : 0.80 m³ de gravier par m³ de béton coulé
  const gravelM3 = Number((safeVolume * 0.8 * 1.05).toFixed(2));

  const waterLiters = Math.round(cementBags50kg * recipe.waterLitersPer50kgBag);

  const recommendations = [
    "Cure humide obligatoire pendant 7 jours minimaux (arrosage matin et soir sous géotextile ou sacs de ciment humides).",
    "Respectez scrupuleusement le volume d'eau : un excès d'eau affaiblit considérablement la résistance finale du béton.",
    "Vibration à l'aiguille vibrante par passes de 30 cm pour éliminer les poches d'air et nids de gravier.",
  ];

  return {
    cementBags50kg,
    sandM3,
    gravelM3,
    waterLiters,
    recommendations,
  };
}
