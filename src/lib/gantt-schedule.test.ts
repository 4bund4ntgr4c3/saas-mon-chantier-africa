import { describe, expect, it } from "vitest";
import { generateConstructionSchedule } from "./gantt-schedule";

describe("generateConstructionSchedule", () => {
  it("generates sequential schedule with mandatory 21 days curing phase", () => {
    const schedule = generateConstructionSchedule("2026-09-01");

    expect(schedule.tasks.length).toBe(9);
    expect(schedule.totalDurationDays).toBe(140);
    expect(schedule.projectStartDate).toBe("2026-09-01");

    const curingTask = schedule.tasks.find((t) => t.isCuringPhase);
    expect(curingTask).toBeDefined();
    expect(curingTask?.durationDays).toBe(21);
  });
});
