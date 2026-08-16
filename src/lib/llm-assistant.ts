import { askLlm } from "@/lib/llm-assistant.functions";

export type ChatTurn = { role: "user" | "assistant"; text: string };

/** Nombre de tours conservés en mémoire de conversation envoyée au LLM. */
export const LLM_HISTORY_MAX = 6;

/** Résumé structurel du chantier injecté dans le prompt système (sans données sensibles). */
export interface AnalysisSummaryInput {
  requirements: {
    name: string | null;
    quantity_needed: number | string;
    quantity_delivered: number | string;
    quantity_consumed: number | string;
  }[];
  products: unknown[];
  stores: { name: string }[];
  forecast: { name: string | null; status: string }[];
  cartCount: number;
  budgetLines: { category_id: string | null; planned_amount: number | string }[];
  expenses: { label: string | null; amount: number | string }[];
  tasks: { title: string | null; status: string }[];
}

const num = (v: number | string) => Number(v) || 0;

/** Format monétaire lisible (espaces simples, insensible à l'environnement Node). */
const fcfaFmt = (v: number) => v.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ");

/** Compacte l'analyse de chantier en quelques lignes de contexte pour le LLM. */
export function summarizeAnalysis(a: AnalysisSummaryInput): string {
  const lines: string[] = [];

  const budget = a.budgetLines.reduce((s, l) => s + num(l.planned_amount), 0);
  const spent = a.expenses.reduce((s, e) => s + num(e.amount), 0);
  lines.push(
    `Budget planifié : ${fcfaFmt(budget)} FCFA · Dépensé : ${fcfaFmt(spent)} FCFA · Reste : ${fcfaFmt(budget - spent)} FCFA`,
  );

  const done = a.tasks.filter((t) => t.status === "terminee").length;
  lines.push(`Tâches : ${done}/${a.tasks.length} terminée(s)`);
  const pending = a.tasks.filter((t) => t.status !== "terminee").slice(0, 5);
  if (pending.length > 0) {
    lines.push(`Tâches en cours : ${pending.map((t) => t.title ?? "—").join(", ")}`);
  }

  if (a.requirements.length > 0) {
    const reqs = a.requirements
      .slice(0, 8)
      .map(
        (r) =>
          `${r.name ?? "—"} ×${Math.max(
            0,
            num(r.quantity_needed) - num(r.quantity_delivered) - num(r.quantity_consumed),
          )}`,
      )
      .join(", ");
    lines.push(`Besoins matériaux restants : ${reqs}`);
  }

  const low = a.forecast.filter((f) => f.status !== "ok");
  if (low.length > 0) {
    lines.push(`Risques rupture (boutique) : ${low.map((f) => f.name ?? "—").join(", ")}`);
  }

  lines.push(
    `Catalogue : ${a.products.length} produit(s) · ${a.stores.length} boutique(s) · Panier : ${a.cartCount} article(s)`,
  );

  return lines.join("\n");
}

/** Prompt système du LLM : rôle, style et garde-fous BâtiBénin. */
export function buildLlmSystemPrompt(roleLabel: string, summary: string): string {
  return [
    `Tu es l'assistant BâtiBénin, plateforme africaine de gestion de chantiers et de marketplace matériaux (Bénin).`,
    `Tu réponds à un utilisateur de type « ${roleLabel} ».`,
    `Règles : réponds toujours en français, de façon concise (180 mots maximum), en monnaie FCFA.`,
    `Utilise uniquement le contexte de chantier ci-dessous pour les chiffres ; ne les invente jamais, et dis-le si une donnée manque.`,
    `Termine par une action concrète possible sur la plateforme (acheter, planifier, suivre un budget…).`,
    ``,
    `Contexte du chantier :`,
    summary,
  ].join("\n");
}

/** Garde les N derniers tours non vides de conversation. */
export function clipHistory(history: ChatTurn[], max = LLM_HISTORY_MAX): ChatTurn[] {
  return history.filter((t) => t.text.trim().length > 0).slice(-max);
}

/**
 * Pose une question ouverte au LLM via la server function.
 * Retourne le texte de la réponse, ou null si le LLM n'est pas configuré
 * ou a échoué (repli sur le moteur de règles).
 */
export async function askLlmAssistant(input: {
  question: string;
  history: ChatTurn[];
  roleLabel: string;
  summary: string;
}): Promise<string | null> {
  try {
    const res = await askLlm({
      data: {
        question: input.question,
        system: buildLlmSystemPrompt(input.roleLabel, input.summary),
        history: clipHistory(input.history),
      },
    });
    return res.text;
  } catch {
    return null;
  }
}
