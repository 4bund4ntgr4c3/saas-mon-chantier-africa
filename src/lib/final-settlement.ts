/**
 * Module de calcul du Décompte Général Définitif (DGD) et gestion de la retenue de garantie.
 */

export interface FinalSettlementInputs {
  initialContractAmountFcfa: number;
  approvedAmendmentsFcfa: number;
  totalPaymentsAlreadyMadeFcfa: number;
  liquidatedDamagesPenaltiesFcfa: number;
  retentionRatePercent?: number; // Défaut 5%
  provisionalAcceptanceDate: string; // YYYY-MM-DD
}

export function calculateFinalSettlement(inputs: FinalSettlementInputs): {
  finalContractTotalFcfa: number;
  guaranteeRetentionFcfa: number;
  finalNetDueBeforeRetentionFcfa: number;
  immediateBalancePayableFcfa: number;
  guaranteeReleaseDate: string;
  isFullySettled: boolean;
  settlementSummaryText: string;
} {
  const rate = inputs.retentionRatePercent ?? 5;
  const finalContractTotal = Math.max(
    0,
    inputs.initialContractAmountFcfa + inputs.approvedAmendmentsFcfa,
  );
  const guaranteeRetention = Math.round((finalContractTotal * rate) / 100);
  const finalNetDueBeforeRetention = Math.max(
    0,
    finalContractTotal - inputs.liquidatedDamagesPenaltiesFcfa,
  );

  // Solde immédiat à verser à la réception provisoire
  const immediateBalancePayable = Math.max(
    0,
    finalNetDueBeforeRetention - guaranteeRetention - inputs.totalPaymentsAlreadyMadeFcfa,
  );

  // Date de libération de la retenue de garantie (1 an jour pour jour après la réception provisoire)
  const provDate = new Date(inputs.provisionalAcceptanceDate);
  const releaseDate = new Date(provDate);
  releaseDate.setFullYear(releaseDate.getFullYear() + 1);

  const guaranteeReleaseDate = isNaN(releaseDate.getTime())
    ? inputs.provisionalAcceptanceDate
    : releaseDate.toISOString().slice(0, 10);

  const isFullySettled = immediateBalancePayable === 0;

  const settlementSummaryText = `Décompte Définitif : Marché révisé à ${finalContractTotal.toLocaleString("fr-FR")} FCFA. Solde immédiat exigible : ${immediateBalancePayable.toLocaleString("fr-FR")} FCFA. Retenue de garantie (5%) de ${guaranteeRetention.toLocaleString("fr-FR")} FCFA libérable le ${guaranteeReleaseDate}.`;

  return {
    finalContractTotalFcfa: finalContractTotal,
    guaranteeRetentionFcfa: guaranteeRetention,
    finalNetDueBeforeRetentionFcfa: finalNetDueBeforeRetention,
    immediateBalancePayableFcfa: immediateBalancePayable,
    guaranteeReleaseDate,
    isFullySettled,
    settlementSummaryText,
  };
}
