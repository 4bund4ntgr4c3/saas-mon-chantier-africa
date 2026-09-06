/**
 * Module de carnet d'entretien numérique et plan de maintenance post-réception BTP.
 */

export interface MaintenanceTask {
  id: string;
  category: "assainissement" | "toiture" | "electricite" | "climatisation" | "peinture";
  title: string;
  frequencyMonths: number;
  estimatedCostFcfa: number;
  nextDueDate: string;
  recommendedSeason: string;
}

export function getRecommendedMaintenanceSchedule(): MaintenanceTask[] {
  const now = new Date();
  const year = now.getFullYear();

  return [
    {
      id: "maint-toiture",
      category: "toiture",
      title: "Inspection étanchéité toiture & nettoyage des gouttières",
      frequencyMonths: 12,
      estimatedCostFcfa: 25000,
      nextDueDate: `${year}-04-15`, // Avant la saison des pluies de mai
      recommendedSeason: "Avril (Avant la grande saison des pluies)",
    },
    {
      id: "maint-fosse",
      category: "assainissement",
      title: "Curage fosse septique & vidange du bac à graisse",
      frequencyMonths: 24,
      estimatedCostFcfa: 45000,
      nextDueDate: `${year + 1}-02-01`,
      recommendedSeason: "Saison sèche (Décembre - Février)",
    },
    {
      id: "maint-elec",
      category: "electricite",
      title: "Contrôle différentiels 30mA & resserrage tableau électrique",
      frequencyMonths: 12,
      estimatedCostFcfa: 15000,
      nextDueDate: `${year}-11-15`,
      recommendedSeason: "Novembre",
    },
    {
      id: "maint-clim",
      category: "climatisation",
      title: "Nettoyage filtres et contrôle gaz des climatiseurs",
      frequencyMonths: 6,
      estimatedCostFcfa: 15000,
      nextDueDate: `${year}-09-01`,
      recommendedSeason: "Tous les 6 mois",
    },
    {
      id: "maint-peinture",
      category: "peinture",
      title: "Ravalement de façade et peinture anti-moisissures",
      frequencyMonths: 48,
      estimatedCostFcfa: 250000,
      nextDueDate: `${year + 2}-01-15`,
      recommendedSeason: "Saison sèche (Janvier)",
    },
  ];
}
