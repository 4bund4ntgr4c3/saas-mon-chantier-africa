import { describe, expect, it } from "vitest";
import { evaluateInvoiceReminder } from "./payment-reminders";

describe("evaluateInvoiceReminder", () => {
  it("flags overdue invoices accurately with custom reminder messages", () => {
    // Échéance le 2026-08-01 vs Aujourd'hui 2026-08-13 => 12 jours de retard
    const reminder = evaluateInvoiceReminder(
      "inv_1",
      "Acompte Dalle R+1",
      "M. Koudjo",
      1500000,
      "2026-08-01",
      "2026-08-13",
      "+229 97 00 00 00",
    );

    expect(reminder.status).toBe("overdue");
    expect(reminder.daysDifference).toBe(12);
    expect(reminder.suggestedMessage).toContain("RETARD DE 12 JOUR(S)");
  });

  it("handles upcoming invoices gracefully", () => {
    const reminder = evaluateInvoiceReminder(
      "inv_2",
      "Solde Finitions",
      "M. Koudjo",
      500000,
      "2026-08-20",
      "2026-08-13",
    );

    expect(reminder.status).toBe("upcoming");
    expect(reminder.daysDifference).toBeLessThan(0);
  });
});
