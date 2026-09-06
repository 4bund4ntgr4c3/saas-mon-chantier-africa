import { describe, expect, it } from "vitest";
import { formatWhatsAppCloudMessage } from "./whatsapp-cloud";

describe("formatWhatsAppCloudMessage", () => {
  it("normalizes Benin phone number and builds direct wa.me link", () => {
    const payload = formatWhatsAppCloudMessage("97 00 11 22", "paiement_recu", {
      amount: "500 000",
      recipient: "Artisan Maçon",
      reference: "PAY-2026-001",
    });

    expect(payload.toPhoneNumber).toBe("22997001122");
    expect(payload.generatedDirectUrl).toContain("https://wa.me/22997001122");
    expect(payload.generatedDirectUrl).toContain("500%20000");
  });
});
