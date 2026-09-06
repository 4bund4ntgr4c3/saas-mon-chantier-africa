import { describe, expect, it } from "vitest";
import { evaluateFireSafetyEquipment } from "./fire-safety";

describe("fire-safety", () => {
  it("sizes extinguishers and smoke detectors for R+1 villa with generator and garage", () => {
    const res = evaluateFireSafetyEquipment({
      buildingCategory: "habitation_etages",
      totalFloorAreaM2: 250,
      levelsCount: 2,
      bedroomsCount: 4,
      hasGeneratorOrSolarInverter: true,
      hasEnclosedGarage: true,
    });

    expect(res.waterExtinguishers6LCount).toBe(2); // 2 niveaux
    expect(res.co2Extinguishers2kgCount).toBe(2); // Tableau + Groupe
    expect(res.powderExtinguishers6kgCount).toBe(1); // Garage
    expect(res.smokeDetectorsDaafCount).toBe(6); // 4 chambres + 2 paliers
    expect(res.estimatedEquipmentCostFcfa).toBeGreaterThan(200000);
    expect(res.fireSafetyRules.length).toBeGreaterThan(2);
  });
});
