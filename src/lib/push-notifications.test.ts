import { describe, expect, it } from "vitest";
import { createSiteNotification } from "./push-notifications";

describe("createSiteNotification", () => {
  it("creates accurate curing completion notification", () => {
    const notif = createSiteNotification("sechage_dalle", "Villa Akpakpa");

    expect(notif.type).toBe("sechage_dalle");
    expect(notif.title).toContain("Fin des 21 jours");
    expect(notif.body).toContain("Villa Akpakpa");
    expect(notif.id).toMatch(/^NOTIF-/);
  });
});
