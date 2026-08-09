import { describe, expect, it } from "vitest";
import { compactFcfa, formatBytes, fcfa, frDate, labelOf, monthLabel, num } from "./format";

/** Normalise les espaces étroites/insécables propres à la locale française. */
function norm(value: string) {
  return value.replace(/[\u202f\u00a0\u2009]/g, " ");
}

describe("format.ts", () => {
  describe("fcfa", () => {
    it("formate en FCFA par défaut", () => {
      const out = norm(fcfa(1500000));
      expect(out).toMatch(/1 500 000/);
      expect(out.replace(/ /g, "")).toContain("FCFA");
    });

    it("gère null et undefined comme zéro", () => {
      expect(norm(fcfa(null)).replace(/ /g, "")).toContain("FCFA");
      expect(norm(fcfa(undefined)).replace(/ /g, "")).toContain("FCFA");
      expect(norm(fcfa(0)).replace(/ /g, "")).toContain("FCFA");
    });

    it("résout la devise RDC depuis la préférence pays", () => {
      localStorage.setItem("batibenin.country", "cd");
      expect(norm(fcfa(1000)).replace(/ /g, "")).toContain("FC");
      localStorage.setItem("batibenin.country", "bj");
      expect(norm(fcfa(1000)).replace(/ /g, "")).toContain("FCFA");
      localStorage.removeItem("batibenin.country");
    });
  });

  describe("compactFcfa", () => {
    it("compacte les millions en M", () => {
      expect(compactFcfa(2_500_000)).toContain("M");
    });
    it("compacte les milliers en k", () => {
      expect(compactFcfa(3_500)).toContain("k");
    });
    it("laisse les petites valeurs telles quelles", () => {
      expect(compactFcfa(420)).toBe("420");
    });
    it("gère zéro", () => {
      expect(compactFcfa(0)).toBe("0");
    });
  });

  describe("num", () => {
    it("formate les entiers", () => {
      expect(norm(num(1234567))).toMatch(/1 234 567/);
    });
    it("limite les décimales", () => {
      expect(num(12.3, 1)).toMatch(/12,3/);
    });
  });

  describe("frDate", () => {
    it("renvoie un tiret pour une valeur vide", () => {
      expect(frDate(null)).toBe("—");
      expect(frDate(undefined)).toBe("—");
    });
    it("formate une date valide", () => {
      expect(frDate("2026-08-09")).toContain("2026");
    });
    it("renvoie un tiret pour une date invalide", () => {
      expect(frDate("pas-une-date")).toBe("—");
    });
  });

  describe("labelOf", () => {
    const list = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Bêta" },
    ];
    it("retrouve le libellé", () => {
      expect(labelOf(list, "a")).toBe("Alpha");
    });
    it("retourne un tiret si absent", () => {
      expect(labelOf(list, "z")).toBe("—");
      expect(labelOf(list, null)).toBe("—");
    });
  });

  describe("monthLabel", () => {
    it("formate une clé mois (année abrégée)", () => {
      expect(monthLabel("2026-08")).toContain("26");
    });
  });

  describe("formatBytes", () => {
    it("formate les octets", () => {
      expect(formatBytes(500)).toBe("500 o");
      expect(formatBytes(2048)).toContain("Ko");
      expect(formatBytes(5 * 1024 * 1024)).toContain("Mo");
    });
  });
});
