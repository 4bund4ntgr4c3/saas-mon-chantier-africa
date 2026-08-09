import { describe, expect, it } from "vitest";
import {
  computeProgramStats,
  computeRentalPrice,
  computeStockForecast,
  generateReturnCode,
  hasRentalConflict,
  suggestProductDescription,
} from "@/lib/data";

describe("computeStockForecast", () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it("marque rupture quand le stock est à zéro", () => {
    const forecast = computeStockForecast(
      [{ id: "p1", name: "Ciment", unit: "sac", price: 4000, stock: 0, min_order_quantity: 5 }],
      [],
      [],
      now,
    );
    expect(forecast[0]).toMatchObject({ status: "rupture", daysLeft: null });
  });

  it("estime les jours de couverture d'après les ventes des 30 derniers jours", () => {
    const orderId = "o1";
    const forecast = computeStockForecast(
      [{ id: "p1", name: "Ciment", unit: "sac", price: 4000, stock: 30, min_order_quantity: 5 }],
      [{ id: orderId, store_id: "s1", status: "livree" }],
      [
        { order_id: orderId, product_id: "p1", quantity: 30 },
        { order_id: orderId, product_id: "p1", quantity: 30 },
      ],
      now,
    );
    // 60 vendus / 30 j = 2/j de vélocité → 15 jours de stock (au-delà du seuil de 14 j → ok)
    expect(forecast[0]).toMatchObject({ soldLast30d: 60, avgDaily: 2, daysLeft: 15, status: "ok" });
  });

  it("ignore les commandes annulées ou remboursées", () => {
    const forecast = computeStockForecast(
      [{ id: "p1", name: "Sable", unit: "m3", price: 12000, stock: 10, min_order_quantity: 1 }],
      [
        { id: "o1", store_id: "s1", status: "annulee" },
        { id: "o2", store_id: "s1", status: "remboursee" },
      ],
      [{ order_id: "o1", product_id: "p1", quantity: 50 }],
      now,
    );
    expect(forecast[0]).toMatchObject({ soldLast30d: 0, daysLeft: null, status: "ok" });
  });

  it("suggère un réappro au moins égal à la commande minimale", () => {
    const forecast = computeStockForecast(
      [
        {
          id: "p1",
          name: "Peinture",
          unit: "bidon",
          price: 9000,
          stock: 4,
          min_order_quantity: 10,
        },
      ],
      [{ id: "o1", store_id: "s1", status: "payee" }],
      [{ order_id: "o1", product_id: "p1", quantity: 60 }],
      now,
    );
    // 60/30 = 2/j → stock 4 → couverture 2 j → critique ; réappro ~28 mais ≥ 10
    expect(forecast[0]!.suggestedReorder).toBeGreaterThanOrEqual(10);
    expect(forecast[0]!.status).toBe("critique");
  });

  it("trie par criticité (rupture avant ok)", () => {
    const forecast = computeStockForecast(
      [
        { id: "p1", name: "Az", unit: null, price: 1, stock: 0, min_order_quantity: 1 },
        { id: "p2", name: "Aa", unit: null, price: 1, stock: 99, min_order_quantity: 1 },
      ],
      [],
      [],
      now,
    );
    expect(forecast[0]!.productId).toBe("p1");
  });
});

describe("suggestProductDescription", () => {
  it("construit une description à partir du nom et de la catégorie", () => {
    const d = suggestProductDescription(
      {
        name: "Ciment CIMBENIN 42.5",
        brand: "CIMBENIN",
        unit: "sac",
        features: null,
        warranty: "1 an",
      },
      "Ciment & liants",
    );
    expect(d).toContain("Ciment CIMBENIN 42.5");
    expect(d).toContain("Ciment & liants");
    expect(d).toContain("CIMBENIN");
    expect(d).toContain("Garantie : 1 an");
  });

  it("inclut des caractéristiques plurilignes", () => {
    const d = suggestProductDescription(
      {
        name: "Peinture blanche",
        brand: null,
        unit: "bidon",
        features: "Résistance UV\nSéchage rapide",
        warranty: null,
      },
      null,
    );
    expect(d).toContain("Résistance UV");
    expect(d).toContain("Séchage rapide");
    expect(d).toContain("bidon");
  });
});

describe("computeRentalPrice", () => {
  it("tarifie une location de 3 jours au tarif journalier", () => {
    const r = computeRentalPrice(10000, 50000, "2026-08-01", "2026-08-04");
    expect(r.days).toBe(3);
    expect(r.weeks).toBe(0);
    expect(r.total).toBe(30000);
  });

  it("applique le tarif hebdomadaire pour 7 jours", () => {
    const r = computeRentalPrice(10000, 50000, "2026-08-01", "2026-08-08");
    expect(r.days).toBe(7);
    expect(r.weeks).toBe(1);
    expect(r.total).toBe(50000);
  });

  it("combine semaines et jours restants", () => {
    const r = computeRentalPrice(10000, 50000, "2026-08-01", "2026-08-10");
    expect(r.days).toBe(9);
    expect(r.weeks).toBe(1);
    expect(r.total).toBe(70000);
  });

  it("force au minimum un jour", () => {
    const r = computeRentalPrice(10000, 50000, "2026-08-01", "2026-08-01");
    expect(r.days).toBe(1);
    expect(r.total).toBe(10000);
  });
});

describe("hasRentalConflict", () => {
  const rentals = [
    {
      id: "a",
      equipment_id: "eq1",
      start_date: "2026-08-10",
      end_date: "2026-08-15",
      status: "confirmee" as const,
    },
    {
      id: "b",
      equipment_id: "eq1",
      start_date: "2026-08-20",
      end_date: "2026-08-25",
      status: "en_cours" as const,
    },
    {
      id: "c",
      equipment_id: "eq1",
      start_date: "2026-09-01",
      end_date: "2026-09-05",
      status: "terminee" as const,
    },
    {
      id: "d",
      equipment_id: "eq2",
      start_date: "2026-09-10",
      end_date: "2026-09-15",
      status: "confirmee" as const,
    },
  ];

  it("détecte un chevauchement avec une location active", () => {
    expect(hasRentalConflict(rentals, "eq1", "2026-08-14", "2026-08-16")).toBe(true);
    expect(hasRentalConflict(rentals, "eq1", "2026-08-09", "2026-08-10")).toBe(true);
    expect(hasRentalConflict(rentals, "eq1", "2026-08-10", "2026-08-10")).toBe(true);
  });

  it("ignore les locations terminées", () => {
    expect(hasRentalConflict(rentals, "eq1", "2026-09-03", "2026-09-04")).toBe(false);
  });

  it("ne tient pas compte des autres équipements", () => {
    expect(hasRentalConflict(rentals, "eq2", "2026-08-12", "2026-08-13")).toBe(false);
    expect(hasRentalConflict(rentals, "eq1", "2026-08-12", "2026-08-13")).toBe(true);
  });

  it("ignore la location exclue (modification en cours)", () => {
    expect(hasRentalConflict(rentals, "eq1", "2026-08-12", "2026-08-13", "a")).toBe(false);
  });

  it("autorise une période libre", () => {
    expect(hasRentalConflict(rentals, "eq1", "2026-08-16", "2026-08-19")).toBe(false);
  });
});

describe("generateReturnCode", () => {
  it("génère un code de 6 caractères sans caractères ambigus", () => {
    const code = generateReturnCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z2-9]{6}$/);
  });

  it("produit deux codes différents", () => {
    const a = generateReturnCode();
    const b = generateReturnCode();
    expect(a).not.toBe(b);
  });
});

describe("computeProgramStats", () => {
  const units = [
    { status: "disponible" as const, price: 32000000 },
    { status: "reserve" as const, price: 35000000 },
    { status: "vendu" as const, price: 45000000 },
    { status: "vendu" as const, price: 30000000 },
  ];

  it("compte les lots par statut et le montant vendu", () => {
    const s = computeProgramStats(units);
    expect(s.total).toBe(4);
    expect(s.disponible).toBe(1);
    expect(s.reserve).toBe(1);
    expect(s.vendu).toBe(2);
    expect(s.montantVendu).toBe(75000000);
  });

  it("calcule l'avancement en pourcentage des lots vendus", () => {
    expect(computeProgramStats(units).avancementPct).toBe(50);
    expect(computeProgramStats([units[0]!]).avancementPct).toBe(0);
    expect(computeProgramStats([units[2]!]).avancementPct).toBe(100);
  });

  it("gère un programme sans lots", () => {
    const s = computeProgramStats([]);
    expect(s.total).toBe(0);
    expect(s.montantVendu).toBe(0);
    expect(s.avancementPct).toBe(0);
  });
});
