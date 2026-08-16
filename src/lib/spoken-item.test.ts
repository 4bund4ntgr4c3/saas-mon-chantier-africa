import { describe, expect, it } from "vitest";
import { collapseNumberWords, normalizeSpokenNumber, parseSpokenItems } from "./spoken-item";

describe("parseSpokenItems", () => {
  it("analyse une phrase complète avec quantité, unité et prix", () => {
    const items = parseSpokenItems("10 sacs de ciment à 4500 francs");
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      designation: "Ciment",
      quantity: 10,
      unit: "sac",
      unit_price: 4500,
    });
  });

  it("convertit les nombres et prix dictés en lettres", () => {
    const items = parseSpokenItems("dix barres de fer à huit mille francs");
    expect(items[0]?.quantity).toBe(10);
    expect(items[0]?.unit).toBe("barre");
    expect(items[0]?.unit_price).toBe(8000);
    expect(items[0]?.designation).toBe("Fer");
  });

  it("gère « un/une » comme quantité 1", () => {
    const items = parseSpokenItems("un pot de peinture");
    expect(items[0]?.quantity).toBe(1);
    expect(items[0]?.unit).toBe("pot");
    expect(items[0]?.designation).toBe("Peinture");
  });

  it("reconnaît plusieurs éléments dans une même phrase", () => {
    const items = parseSpokenItems("20 barres de fer 12 et 10 sacs de ciment à 4500");
    expect(items).toHaveLength(2);
    expect(items[0]?.designation).toBe("Fer 12");
    expect(items[0]?.quantity).toBe(20);
    expect(items[1]?.designation).toBe("Ciment");
    expect(items[1]?.unit_price).toBe(4500);
  });

  it("garde une désignation seule sans quantité ni prix", () => {
    const items = parseSpokenItems("ciment");
    expect(items).toHaveLength(1);
    expect(items[0]?.designation).toBe("Ciment");
    expect(items[0]?.quantity).toBeNull();
    expect(items[0]?.unit_price).toBeNull();
  });

  it("canonise les unités mètre carré / mètre cube", () => {
    const items = parseSpokenItems("3 mètres cubes de sable à 35000");
    expect(items[0]?.unit).toBe("m³");
    expect(items[0]?.designation).toBe("Sable");
    const m2 = parseSpokenItems("15 mètres carrés de carrelage");
    expect(m2[0]?.unit).toBe("m²");
  });

  it("détecte un prix « à l'unité » et les nombres composés", () => {
    const items = parseSpokenItems("quatre-vingt-dix agglos à 280 francs l'unité");
    expect(items[0]?.quantity).toBe(90);
    expect(items[0]?.unit_price).toBe(280);
    expect(items[0]?.designation).toBe("Agglos");
  });

  it("ignore les formules d'introduction", () => {
    const items = parseSpokenItems("il me faut 10 sacs de ciment à 4500 francs");
    expect(items[0]?.quantity).toBe(10);
    expect(items[0]?.designation).toBe("Ciment");
  });

  it("ne coupe pas les décimales et préserve les références numériques", () => {
    const items = parseSpokenItems("5 sacs de ciment CPJ 42.5 à 4200 fcfa");
    expect(items[0]?.designation).toBe("Ciment cpj 42.5");
    expect(items[0]?.unit_price).toBe(4200);
  });

  it("retourne un tableau vide sans entrée exploitable", () => {
    expect(parseSpokenItems("")).toEqual([]);
    expect(parseSpokenItems("   ")).toEqual([]);
  });
});

describe("collapseNumberWords", () => {
  it("convertit les suites de mots-nombres", () => {
    expect(collapseNumberWords("quatre mille cinq cents")).toBe("4500");
    expect(collapseNumberWords("vingt et un barres")).toBe("21 barres");
    expect(collapseNumberWords("deux cent mille")).toBe("200000");
  });

  it("laisse les chiffres inchangés", () => {
    expect(collapseNumberWords("10 sacs de ciment")).toBe("10 sacs de ciment");
  });
});

describe("normalizeSpokenNumber", () => {
  it("convertit une dictée en lettres pour un champ nombre", () => {
    expect(normalizeSpokenNumber("quatre mille cinq cents")).toBe("4500");
    expect(normalizeSpokenNumber("environ 2500")).toBe("2500");
    expect(normalizeSpokenNumber("4500")).toBe("4500");
  });
});
