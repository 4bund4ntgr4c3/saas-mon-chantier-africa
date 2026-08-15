import { describe, expect, it } from "vitest";
import { calculateTontineStats, TontinePot } from "./tontine";

describe("calculateTontineStats", () => {
  it("calculates progress percent and remaining correctly", () => {
    const pot: TontinePot = {
      id: "pot1",
      projectId: "proj1",
      title: "Dalle de toiture",
      targetAmount: 1000000,
      collectedAmount: 0,
      status: "active",
      contributions: [
        { id: "c1", contributorName: "Oncle Jean", amount: 200000, date: "2026-08-10" },
        { id: "c2", contributorName: "Tante Marie", amount: 300000, date: "2026-08-11" },
      ],
    };

    const stats = calculateTontineStats(pot);
    expect(stats.collected).toBe(500000);
    expect(stats.progressPercent).toBe(50);
    expect(stats.remaining).toBe(500000);
    expect(stats.contributorCount).toBe(2);
  });
});
