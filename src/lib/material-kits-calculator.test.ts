import { describe, expect, it } from "vitest";
import { generateMaterialKit } from "./material-kits-calculator";

describe("generateMaterialKit", () => {
  it("generates correct kit items and total budget for a perimeter fence", () => {
    const kit = generateMaterialKit("cloture");

    expect(kit.id).toBe("kit-cloture");
    expect(kit.items.length).toBeGreaterThanOrEqual(4);
    expect(kit.totalEstimatedCostFcfa).toBeGreaterThan(1000000);
    const cement = kit.items.find((i) => i.category === "ciment");
    expect(cement).toBeDefined();
    expect(cement!.quantity).toBe(90);
  });
});
