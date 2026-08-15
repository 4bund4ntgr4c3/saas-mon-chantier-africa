import { describe, expect, it } from "vitest";
import { processPaymentWebhook, WebhookEventPayload } from "./payment-gateway";

describe("processPaymentWebhook", () => {
  it("processes approved FedaPay webhook successfully", () => {
    const payload: WebhookEventPayload = {
      event: "transaction.approved",
      provider: "fedapay",
      transactionId: "trx_987654321",
      reference: "INV-2026-0814",
      amountFcfa: 450000,
      customerPhone: "+229 97 00 00 00",
      timestamp: "2026-08-14T00:00:00Z",
    };

    const res = processPaymentWebhook(payload);
    expect(res.success).toBe(true);
    expect(res.orderOrInvoiceStatus).toBe("paye");
    expect(res.message).toContain("450000 FCFA validé");
  });

  it("handles failed transaction webhook", () => {
    const payload: WebhookEventPayload = {
      event: "transaction.failed",
      provider: "kkiapay",
      transactionId: "trx_failed_123",
      reference: "ORD-999",
      amountFcfa: 120000,
      timestamp: "2026-08-14T00:00:00Z",
    };

    const res = processPaymentWebhook(payload);
    expect(res.success).toBe(false);
    expect(res.orderOrInvoiceStatus).toBe("echoue");
  });
});
