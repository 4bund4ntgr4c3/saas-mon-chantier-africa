/**
 * Détection d'anomalies dans les dépenses d'un chantier (moteur de règles) :
 * doublons potentiels, prix unitaires aberrants, gros montants chez un
 * fournisseur jamais utilisé. Pure et testable — alimente un panneau d'alerte.
 */

export type AnomalyExpense = {
  id: string;
  label: string;
  amount: number | string;
  expense_date: string | null;
  category_id: string | null;
  supplier_id: string | null;
  unit_price?: number | string | null;
  quantity?: number | string | null;
};

export type ExpenseAnomaly = {
  kind: "doublon" | "prix_aberrant" | "nouveau_fournisseur";
  expenseId: string;
  title: string;
  detail: string;
  severity: "haute" | "moyenne";
};

const DAY_MS = 86400000;

/** Fingerprint d'une dépense pour la détection de doublons. */
function fingerprint(e: AnomalyExpense): string {
  return [Math.round(Number(e.amount)), e.supplier_id ?? "", e.label.trim().toLowerCase()].join(
    "|",
  );
}

export function detectExpenseAnomalies(expenses: readonly AnomalyExpense[]): ExpenseAnomaly[] {
  const anomalies: ExpenseAnomaly[] = [];
  const sorted = [...expenses].sort((a, b) =>
    (a.expense_date ?? "").localeCompare(b.expense_date ?? ""),
  );

  // 1. Doublons : même montant + même fournisseur + même libellé à moins de 48 h.
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    for (let j = i - 1; j >= 0; j--) {
      const prev = sorted[j]!;
      const dCur = cur.expense_date ? new Date(cur.expense_date).getTime() : NaN;
      const dPrev = prev.expense_date ? new Date(prev.expense_date).getTime() : NaN;
      if (Number.isNaN(dCur) || Number.isNaN(dPrev) || dCur - dPrev > 2 * DAY_MS) break;
      if (fingerprint(cur) === fingerprint(prev)) {
        anomalies.push({
          kind: "doublon",
          expenseId: cur.id,
          title: `Doublon possible — ${cur.label}`,
          detail: `${Number(cur.amount).toLocaleString("fr-FR")} FCFA, identique à une dépense du ${prev.expense_date}`,
          severity: "haute",
        });
        break;
      }
    }
  }

  // 2. Prix unitaires aberrants vs moyenne de la catégorie (écart > 40 %, 3+ échantillons).
  const byCategory = new Map<string, number[]>();
  sorted.forEach((e) => {
    const unit = Number(e.unit_price);
    if (!e.category_id || !Number.isFinite(unit) || unit <= 0) return;
    const list = byCategory.get(e.category_id) ?? [];
    list.push(unit);
    byCategory.set(e.category_id, list);
  });
  const catAverage = new Map<string, number>();
  byCategory.forEach((list, cat) => {
    if (list.length >= 3) catAverage.set(cat, list.reduce((s, v) => s + v, 0) / list.length);
  });
  sorted.forEach((e) => {
    const unit = Number(e.unit_price);
    const avg = e.category_id ? catAverage.get(e.category_id) : undefined;
    if (!Number.isFinite(unit) || unit <= 0 || !avg || avg <= 0) return;
    const deviation = ((unit - avg) / avg) * 100;
    if (Math.abs(deviation) > 40) {
      anomalies.push({
        kind: "prix_aberrant",
        expenseId: e.id,
        title: `Prix unitaire inhabituel — ${e.label}`,
        detail: `${unit.toLocaleString("fr-FR")} FCFA contre ${Math.round(avg).toLocaleString("fr-FR")} FCFA en moyenne sur ce poste (${deviation > 0 ? "+" : ""}${Math.round(deviation)} %)`,
        severity: deviation > 0 ? "moyenne" : "moyenne",
      });
    }
  });

  // 3. Gros montant (>= seuil) chez un fournisseur utilisé pour la première fois.
  const FIRST_USE_THRESHOLD = 200000;
  const seenSuppliers = new Set<string>();
  sorted.forEach((e) => {
    const sup = e.supplier_id;
    if (sup && !seenSuppliers.has(sup)) {
      if (Number(e.amount) >= FIRST_USE_THRESHOLD) {
        anomalies.push({
          kind: "nouveau_fournisseur",
          expenseId: e.id,
          title: `Nouveau fournisseur, montant élevé — ${e.label}`,
          detail: `Première dépense chez ce fournisseur : ${Number(e.amount).toLocaleString("fr-FR")} FCFA — vérifiez la facture.`,
          severity: "moyenne",
        });
      }
      seenSuppliers.add(sup);
    } else if (sup) {
      seenSuppliers.add(sup);
    }
  });

  return anomalies;
}
