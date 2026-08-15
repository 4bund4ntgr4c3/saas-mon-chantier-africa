/**
 * Module de gestion des tontines et cagnottes de chantier collaboratives.
 */

export interface TontineContribution {
  id: string;
  contributorName: string;
  amount: number;
  date: string;
  message?: string | null;
  phoneNumber?: string | null;
}

export interface TontinePot {
  id: string;
  projectId: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  contributions: TontineContribution[];
  status: "active" | "completed" | "converted_to_voucher";
}

export function calculateTontineStats(pot: TontinePot) {
  const collected = pot.contributions.reduce((sum, c) => sum + c.amount, 0);
  const target = Math.max(1, pot.targetAmount);
  const progressPercent = Math.min(100, Math.round((collected / target) * 100));
  const remaining = Math.max(0, target - collected);

  return {
    collected,
    target,
    progressPercent,
    remaining,
    contributorCount: pot.contributions.length,
  };
}
