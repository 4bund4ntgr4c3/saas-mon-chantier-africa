/**
 * Module de calcul de planning d'exécution et diagramme de Gantt BTP.
 */

export interface ScheduleTask {
  id: string;
  name: string;
  category: "gros_oeuvre" | "sechage" | "second_oeuvre" | "finitions";
  durationDays: number;
  startDate: string;
  endDate: string;
  isCuringPhase?: boolean; // Temps de séchage béton armé 21 jours
  progressPercent: number;
}

export interface ScheduleModel {
  totalDurationDays: number;
  projectStartDate: string;
  projectEstimatedEndDate: string;
  tasks: ScheduleTask[];
}

const DEFAULT_PHASE_TEMPLATES = [
  {
    id: "t1",
    name: "Implantation, fouilles & terrassement",
    category: "gros_oeuvre" as const,
    days: 10,
  },
  {
    id: "t2",
    name: "Semelles, longrines & fondations",
    category: "gros_oeuvre" as const,
    days: 14,
  },
  {
    id: "t3",
    name: "Élévation des murs & poteaux RDC",
    category: "gros_oeuvre" as const,
    days: 20,
  },
  {
    id: "t4",
    name: "Coffrage, ferraillage & coulage dalle",
    category: "gros_oeuvre" as const,
    days: 8,
  },
  {
    id: "t5",
    name: "Séchage incompressible de la dalle béton (21j)",
    category: "sechage" as const,
    days: 21,
    isCuring: true,
  },
  { id: "t6", name: "Charpente, toiture & étanchéité", category: "gros_oeuvre" as const, days: 14 },
  {
    id: "t7",
    name: "Plomberie & électricité (incorporations)",
    category: "second_oeuvre" as const,
    days: 18,
  },
  {
    id: "t8",
    name: "Enduits muraux, ragréage & carrelage",
    category: "finitions" as const,
    days: 20,
  },
  { id: "t9", name: "Peinture, sanitaires & finitions", category: "finitions" as const, days: 15 },
];

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateConstructionSchedule(startDateStr: string): ScheduleModel {
  let currentDate = startDateStr;
  let totalDurationDays = 0;
  const tasks: ScheduleTask[] = [];

  for (const t of DEFAULT_PHASE_TEMPLATES) {
    const taskStart = currentDate;
    const taskEnd = addDaysToDate(taskStart, t.days);

    tasks.push({
      id: t.id,
      name: t.name,
      category: t.category,
      durationDays: t.days,
      startDate: taskStart,
      endDate: taskEnd,
      isCuringPhase: t.isCuring ?? false,
      progressPercent: 0,
    });

    totalDurationDays += t.days;
    currentDate = taskEnd;
  }

  return {
    totalDurationDays,
    projectStartDate: startDateStr,
    projectEstimatedEndDate: currentDate,
    tasks,
  };
}
