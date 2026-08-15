import { describe, expect, it } from "vitest";
import { generateAccessBadge } from "./access-badge";

describe("generateAccessBadge", () => {
  it("generates a complete access badge with QR payload", () => {
    const badge = generateAccessBadge("Moussa ALAO", "artisan", "Villa Calavi", "+229 97 12 34 56");

    expect(badge.badgeId).toMatch(/^PASS-/);
    expect(badge.fullName).toBe("Moussa ALAO");
    expect(badge.roleLabel).toBe("Artisan / Ouvrier Qualifié");
    expect(badge.qrPayload).toContain("Moussa ALAO");
    expect(badge.qrPayload).toContain("Villa Calavi");
  });
});
