/**
 * Module du cockpit exécutif pour propriétaire et membres de la diaspora.
 */

export interface OwnerProjectHealth {
  projectName: string;
  physicalProgressPercent: number;
  budgetAllocatedFcfa: number;
  budgetSpentFcfa: number;
  budgetRemainingFcfa: number;
  healthScorePercent: number; // Score de santé globale (qualité + respect des délais)
  nextKeyMilestone: string;
  nextMilestoneDate: string;
  pendingOwnerActions: string[];
}

export function computeOwnerProjectHealth(
  projectName: string,
  progress: number,
  totalBudget: number,
  spent: number,
): OwnerProjectHealth {
  const allocated = Math.max(1, totalBudget);
  const consumed = Math.max(0, spent);
  const remaining = Math.max(0, allocated - consumed);

  // Score de santé basé sur l'adéquation entre l'avancement physique et la consommation budgétaire
  const financialRate = (consumed / allocated) * 100;
  const delta = Math.abs(progress - financialRate);
  const healthScore = Math.max(50, Math.min(100, Math.round(100 - delta * 0.8)));

  const pendingActions: string[] = [];
  if (financialRate > 80 && progress < 70) {
    pendingActions.push(
      "Alerte dépassement budgétaire potentiel : vérifier les devis supplémentaires",
    );
  }
  if (remaining < 2000000 && progress < 90) {
    pendingActions.push("Prévoir le déblocage de la tranche suivante de trésorerie");
  }

  return {
    projectName,
    physicalProgressPercent: progress,
    budgetAllocatedFcfa: allocated,
    budgetSpentFcfa: consumed,
    budgetRemainingFcfa: remaining,
    healthScorePercent: healthScore,
    nextKeyMilestone:
      progress < 30
        ? "Coulage des longrines et poteaux"
        : progress < 70
          ? "Pose de la toiture et étanchéité"
          : "Finitions peintures et carrelages",
    nextMilestoneDate: "Dans 12 jours",
    pendingOwnerActions:
      pendingActions.length > 0 ? pendingActions : ["Toutes les validations sont à jour ✅"],
  };
}
