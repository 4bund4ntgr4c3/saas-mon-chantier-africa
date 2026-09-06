import { describe, expect, it } from "vitest";
import { computeSCurve, monthsBetween, physicalProgress, smoothstep } from "./s-curve";

describe("smoothstep", () => {
  it("vaut 0 au départ et 1 à la fin", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
  });

  it("est croissant et symétrique autour de 0,5 (forme en S)", () => {
    expect(smoothstep(0.25)).toBeGreaterThan(0);
    expect(smoothstep(0.25)).toBeLessThan(0.5);
    expect(smoothstep(0.5)).toBe(0.5);
    expect(smoothstep(0.75)).toBeGreaterThan(0.5);
    expect(smoothstep(0.75)).toBeLessThan(1);
  });

  it("borne les valeurs hors [0, 1]", () => {
    expect(smoothstep(-3)).toBe(0);
    expect(smoothstep(4)).toBe(1);
  });
});

describe("monthsBetween", () => {
  it("liste les mois inclus entre deux dates", () => {
    expect(monthsBetween("2026-01-15", "2026-03-02")).toEqual(["2026-01", "2026-02", "2026-03"]);
  });

  it("retourne un seul mois si début = fin", () => {
    expect(monthsBetween("2026-05-10", "2026-05-28")).toEqual(["2026-05"]);
  });

  it("retourne [] si la fin précède le début", () => {
    expect(monthsBetween("2026-06-01", "2026-01-01")).toEqual([]);
  });
});

describe("computeSCurve", () => {
  it("cumule les dépenses réelles par mois", () => {
    const points = computeSCurve({
      budget: 0,
      startDate: "2026-01-01",
      endDate: "2026-03-31",
      expenses: [
        { amount: 100, expense_date: "2026-01-10" },
        { amount: 50, expense_date: "2026-02-01" },
        { amount: 25, expense_date: "2026-01-20" },
      ],
    });
    expect(points).toHaveLength(3);
    expect(points[0]!.realise).toBe(125);
    expect(points[1]!.realise).toBe(175);
    expect(points[2]!.realise).toBe(175);
  });

  it("répartit le budget en S (premier mois faible, dernier mois = budget)", () => {
    const points = computeSCurve({
      budget: 1000,
      startDate: "2026-01-01",
      endDate: "2026-05-31",
      expenses: [],
    });
    expect(points).toHaveLength(5);
    expect(points[0]!.prevu).toBe(0);
    expect(points[2]!.prevu).toBe(500);
    expect(points[4]!.prevu).toBe(1000);
    // Démarrage lent : sous la répartition linéaire (200) au premier quart…
    expect(points[1]!.prevu).toBeLessThan(200);
    // …et rattrapage au dernier quart (au-dessus de 800).
    expect(points[3]!.prevu).toBeGreaterThan(800);
  });

  it("ignore les dépenses sans date", () => {
    const points = computeSCurve({
      budget: 0,
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      expenses: [{ amount: 300, expense_date: null }],
    });
    expect(points[0]!.realise).toBe(0);
  });

  it("retourne [] sans période exploitable", () => {
    expect(computeSCurve({ budget: 10, startDate: null, endDate: null, expenses: [] })).toEqual([]);
  });
});

describe("physicalProgress", () => {
  it("pondère terminée = 1, en cours = 0,5, à faire = 0", () => {
    expect(
      physicalProgress([
        { status: "terminee" },
        { status: "en_cours" },
        { status: "a_faire" },
        { status: "a_faire" },
      ]),
    ).toBe(37.5);
  });

  it("exclut les tâches annulées", () => {
    expect(physicalProgress([{ status: "terminee" }, { status: "annulee" }])).toBe(100);
  });

  it("retourne null sans tâche comptable", () => {
    expect(physicalProgress([])).toBeNull();
    expect(physicalProgress([{ status: "annulee" }])).toBeNull();
  });
});
