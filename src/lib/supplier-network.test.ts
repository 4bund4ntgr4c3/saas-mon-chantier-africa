import { describe, expect, it } from "vitest";
import { findBestWarehouse, REGIONAL_WAREHOUSES } from "./supplier-network";

describe("findBestWarehouse", () => {
  it("finds closest warehouse by target city", () => {
    const warehouse = findBestWarehouse("Abomey-Calavi");

    expect(warehouse.city).toBe("Abomey-Calavi");
    expect(warehouse.cementStockBags).toBeGreaterThan(1000);
    expect(warehouse.estimatedDeliveryHours).toBeLessThanOrEqual(3);
  });

  it("defaults to Cotonou warehouse when unknown city is passed", () => {
    const warehouse = findBestWarehouse("Inconnu");
    expect(warehouse.city).toBe("Cotonou");
  });
});
