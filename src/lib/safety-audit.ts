/**
 * Module d'audit et de registre de sécurité HSE (Hygiène, Sécurité, Environnement) et EPI BTP.
 */

export interface HseChecklistItem {
  id: string;
  label: string;
  category: "epi" | "hauteur" | "secours" | "environnement";
  compliant: boolean;
}

export interface HseAuditReport {
  scorePercent: number;
  status: "conforme" | "ameliorations_requises" | "danger_critique";
  totalPoints: number;
  maxPoints: number;
  recommendations: string[];
}

export const DEFAULT_HSE_CHECKLIST: HseChecklistItem[] = [
  {
    id: "c1",
    label: "Port du casque & chaussures de sécurité par tous les ouvriers",
    category: "epi",
    compliant: true,
  },
  {
    id: "c2",
    label: "Harnais de sécurité & garde-corps pour le travail en hauteur (>2m)",
    category: "hauteur",
    compliant: true,
  },
  {
    id: "c3",
    label: "Trousse de premiers secours & extincteur vérifiés et accessibles",
    category: "secours",
    compliant: true,
  },
  {
    id: "c4",
    label: "Balisage et protection des fouilles et tranchées ouvertes",
    category: "environnement",
    compliant: true,
  },
  {
    id: "c5",
    label: "Stockage sécurisé des carburants et solvants",
    category: "environnement",
    compliant: true,
  },
];

export function evaluateHseAudit(checklist: HseChecklistItem[]): HseAuditReport {
  if (checklist.length === 0) {
    return {
      scorePercent: 0,
      status: "danger_critique",
      totalPoints: 0,
      maxPoints: 0,
      recommendations: ["Effectuer un premier audit de sécurité complet."],
    };
  }

  const compliantCount = checklist.filter((item) => item.compliant).length;
  const scorePercent = Math.round((compliantCount / checklist.length) * 100);

  let status: "conforme" | "ameliorations_requises" | "danger_critique" = "conforme";
  if (scorePercent < 60) {
    status = "danger_critique";
  } else if (scorePercent < 100) {
    status = "ameliorations_requises";
  }

  const recommendations: string[] = [];
  checklist.forEach((item) => {
    if (!item.compliant) {
      recommendations.push(`Corriger d'urgence : ${item.label}`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("Chantier 100% conforme aux règles de sécurité BTP.");
  }

  return {
    scorePercent,
    status,
    totalPoints: compliantCount,
    maxPoints: checklist.length,
    recommendations,
  };
}
