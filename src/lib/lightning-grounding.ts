/**
 * Module de calcul de prise de terre et dimensionnement de la protection contre les surtensions et la foudre.
 */

export type GroundingGroundType =
  "terre_humide" | "terre_de_barre" | "sable_sec_littoral" | "roche";

export interface GroundingCalculationInputs {
  groundType: GroundingGroundType;
  hasFoundationLoop: boolean; // Boucle en cuivre nu 25mm² en fond de fouille
  foundationLoopLengthMeters: number; // ex: 40m
  copperRodsCount: number; // Piquets de terre de 2m
}

export function calculateGroundingResistance(inputs: GroundingCalculationInputs): {
  groundResistivityOhmMeter: number;
  estimatedResistanceOhms: number;
  isCompliantStrict: boolean; // < 10 Ohms (recommandé pour électronique & parafoudre)
  isCompliantStandard: boolean; // < 100 Ohms (norme minimale NF C 15-100)
  verdict: string;
  surgeProtectorAdvice: string;
  installationChecklist: string[];
} {
  let resistivity = 100;
  switch (inputs.groundType) {
    case "terre_humide":
      resistivity = 60;
      break;
    case "terre_de_barre":
      resistivity = 120;
      break;
    case "sable_sec_littoral":
      resistivity = 300;
      break;
    case "roche":
      resistivity = 800;
      break;
  }

  // Résistance de la boucle fond de fouille : R1 ≈ 2 * ρ / L
  let rLoop = 999;
  if (inputs.hasFoundationLoop && inputs.foundationLoopLengthMeters > 0) {
    rLoop = (2 * resistivity) / inputs.foundationLoopLengthMeters;
  }

  // Résistance d'un piquet de 2m : R2 ≈ ρ / (n * 2)
  let rRods = 999;
  if (inputs.copperRodsCount > 0) {
    rRods = resistivity / (inputs.copperRodsCount * 2);
  }

  // Mise en parallèle de la boucle et des piquets
  let totalResistance = 999;
  if (inputs.hasFoundationLoop && inputs.copperRodsCount > 0) {
    totalResistance = (rLoop * rRods) / (rLoop + rRods);
  } else if (inputs.hasFoundationLoop) {
    totalResistance = rLoop;
  } else if (inputs.copperRodsCount > 0) {
    totalResistance = rRods;
  }

  const estimatedResistance = Number(totalResistance.toFixed(1));
  const isCompliantStrict = estimatedResistance < 10;
  const isCompliantStandard = estimatedResistance <= 100;

  let verdict =
    "Excellente prise de terre (< 10 Ohms) ! Protection optimale des personnes et du matériel.";
  if (!isCompliantStandard) {
    verdict =
      "Prise de terre non conforme (> 100 Ohms) ! Danger d'électrocution mortelle. Ajoutez des piquets.";
  } else if (!isCompliantStrict) {
    verdict =
      "Conforme aux normes basiques (< 100 Ohms), mais insuffisant pour protéger efficacement les équipements électroniques sensibles contre la foudre (< 10 Ohms requis).";
  }

  const surgeProtectorAdvice =
    "Installation obligatoire d'un parafoudre Type 2 (In = 20 kA, Imax = 40 kA) en tête du tableau électrique général (TGBT).";

  const installationChecklist = [
    "Utiliser du câble cuivre nu de 25 mm² pour la boucle à fond de fouille.",
    "Installer une barrette de coupure de terre pour permettre les mesures au telluromètre.",
    "Liaison équipotentielle principale (LEP) reliant les canalisations métalliques d'eau et armatures béton.",
  ];

  return {
    groundResistivityOhmMeter: resistivity,
    estimatedResistanceOhms: estimatedResistance,
    isCompliantStrict,
    isCompliantStandard,
    verdict,
    surgeProtectorAdvice,
    installationChecklist,
  };
}
