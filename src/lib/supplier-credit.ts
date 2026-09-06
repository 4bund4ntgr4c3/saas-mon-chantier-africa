/**
 * Simulation de crédit fournisseur (« payez vos matériaux en plusieurs fois ») :
 * découpage d'un montant en versements avec éventuel frais de dossier/service.
 */

export type SupplierCreditResult = {
  /** Total à payer, frais inclus. */
  total: number;
  /** Montant d'un versement (frais inclus). */
  perInstallment: number;
  /** Frais de service totaux. */
  fees: number;
  schedule: { index: number; amount: number; label: string }[];
};

export function simulateSupplierCredit(params: {
  amount: number;
  installments: number;
  /** Frais de service en % du montant (défaut 0). */
  feePct?: number;
}): SupplierCreditResult {
  const amount = Math.max(0, params.amount);
  const n = Math.max(1, Math.round(params.installments));
  const fees = Math.round((amount * Math.max(0, params.feePct ?? 0)) / 100);
  const total = amount + fees;
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  const schedule = Array.from({ length: n }, (_, i) => ({
    index: i + 1,
    amount: i === n - 1 ? base + remainder : base,
    label: `${i + 1}/${n}`,
  }));
  return { total, perInstallment: Math.round(total / n), fees, schedule };
}
