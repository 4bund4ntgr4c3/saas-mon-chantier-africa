import { describe, expect, it } from "vitest";
import { evaluateSoilAndFoundations } from "./soil-foundations";

describe("soil-foundations", () => {
  it("recommends a ribbed raft foundation for R+2 on coastal sandy soil", () => {
    const advice = evaluateSoilAndFoundations("sable_littoral", "r_plus_2");

    expect(advice.admissibleBearingCapacityBars).toBe(1.5);
    expect(advice.recommendedFoundation).toContain("Radier général");
    expect(advice.antiCapillaryLayerRecommended).toBe(true);
    expect(advice.engineeringAdvice.length).toBeGreaterThan(1);
  });

  it("identifies high bearing capacity for terre de barre", () => {
    const advice = evaluateSoilAndFoundations("terre_de_barre", "rdc");

    expect(advice.admissibleBearingCapacityBars).toBe(2.5);
    expect(advice.recommendedFoundation).toContain("Semelles filantes");
    expect(advice.waterTableRisk).toContain("profonde");
  });
});
