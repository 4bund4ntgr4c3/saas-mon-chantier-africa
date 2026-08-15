/**
 * Module d'intégration des passerelles de paiement réelles (FedaPay / Kkiapay) et traitement des webhooks.
 */

export type GatewayProvider = "fedapay" | "kkiapay" | "mtn_momo_direct" | "moov_money_direct";

export interface WebhookEventPayload {
  event: "transaction.approved" | "transaction.failed" | "transaction.pending";
  provider: GatewayProvider;
  transactionId: string;
  reference: string;
  amountFcfa: number;
  customerPhone?: string | null;
  timestamp: string;
}

export interface WebhookProcessResult {
  success: boolean;
  orderOrInvoiceStatus: "paye" | "en_attente" | "echoue";
  message: string;
}

export function processPaymentWebhook(payload: WebhookEventPayload): WebhookProcessResult {
  if (payload.event === "transaction.approved") {
    return {
      success: true,
      orderOrInvoiceStatus: "paye",
      message: `Paiement de ${payload.amountFcfa} FCFA validé avec succès via ${payload.provider} (Réf: ${payload.reference}).`,
    };
  }

  if (payload.event === "transaction.failed") {
    return {
      success: false,
      orderOrInvoiceStatus: "echoue",
      message: `Échec de transaction ${payload.transactionId} via ${payload.provider}.`,
    };
  }

  return {
    success: true,
    orderOrInvoiceStatus: "en_attente",
    message: `Paiement en cours de confirmation sur ${payload.provider}.`,
  };
}
