/**
 * Courbe en S de chantier : budget cumulé prévu (phasing smoothstep, standard
 * BTP — démarrage lent, accélération en gros œuvre, tassement en finition)
 * confronté aux dépenses réelles cumulées, par mois.
 */

export type SCurveExpense = { amount: number | string; expense_date: string | null };

export type SCurveTask = { status: string };

export type SCurvePoint = {
  moisKey: string;
  prevu: number;
  realise: number;
};

/** Fonction de répartition cumulée en S (smoothstep) : 0 → 0, 1 → 1. */
export function smoothstep(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return 3 * p * p - 2 * p * p * p;
}

/** Liste les mois [YYYY-MM] entre deux dates ISO (inclus). */
export function monthsBetween(startIso: string | null, endIso: string | null): string[] {
  if (!startIso || !endIso) return [];
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const months: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  // Garde-fou : un chantier ne dépasse pas 15 ans d'historique mensuel.
  while (cursor <= last && months.length < 180) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

/**
 * Courbe en S mensuelle : `prevu` suit le phasing smoothstep de l'enveloppe
 * sur la durée du chantier, `realise` cumule les dépenses réelles.
 */
export function computeSCurve(params: {
  budget: number;
  startDate: string | null;
  endDate: string | null;
  expenses: readonly SCurveExpense[];
}): SCurvePoint[] {
  const { budget, startDate, endDate, expenses } = params;
  const months = monthsBetween(startDate, endDate);
  if (months.length === 0) return [];

  const byMonth = new Map<string, number>();
  expenses.forEach((e) => {
    if (!e.expense_date) return;
    const key = `${e.expense_date.slice(0, 7)}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(e.amount));
  });

  const totalMonths = Math.max(months.length, 1);
  let cumul = 0;
  return months.map((key, i) => {
    cumul += byMonth.get(key) ?? 0;
    const prevu = budget > 0 ? budget * smoothstep(i / (totalMonths - 1 || 1)) : 0;
    return { moisKey: key, prevu: Math.round(prevu), realise: Math.round(cumul) };
  });
}

/**
 * Avancement physique d'un chantier à partir des tâches :
 * terminée = 1, en cours = 0,5, à faire/annulée = 0 (les annulées ne comptent pas).
 */
export function physicalProgress(tasks: readonly SCurveTask[]): number | null {
  const counted = tasks.filter((t) => t.status !== "annulee");
  if (counted.length === 0) return null;
  const sum = counted.reduce((s, t) => {
    if (t.status === "terminee") return s + 1;
    if (t.status === "en_cours") return s + 0.5;
    return s;
  }, 0);
  return (sum / counted.length) * 100;
}
