/**
 * Bibliothèque de modèles de maisons béninoises avec coûts indicatifs
 * (fourchettes FCFA, terrain exclu) — vitrine publique /modeles + création
 * de chantier en 1 clic via le simulateur. Coûts indicatifs marché 2026,
 * à affiner avec les données réelles de la plateforme.
 */

import type { BuildingType, StandingLevel } from "@/lib/simulator";

export type HouseModel = {
  id: string;
  name: string;
  buildingType: BuildingType;
  standing: StandingLevel;
  description: string;
  landArea: number; // m²
  builtArea: number; // m²
  levels: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  /** Fourchette de coût indicatif FCFA (construction, hors terrain). */
  costMin: number;
  costMax: number;
  features: string[];
};

export const HOUSE_MODELS: readonly HouseModel[] = [
  {
    id: "villa-basse-3ch",
    name: "Villa basse 3 chambres",
    buildingType: "villa_basse",
    standing: "moyen",
    description:
      "La maison familiale classique : séjour spacieux, 3 chambres dont une suite, varangue — le modèle le plus construit à Calavi et Abomey-Calavi.",
    landArea: 300,
    builtArea: 120,
    levels: 1,
    rooms: 5,
    bedrooms: 3,
    bathrooms: 2,
    costMin: 24000000,
    costMax: 35000000,
    features: ["Varangue", "Suite parentale", "Cuisine américaine", "Fosse septique béton"],
  },
  {
    id: "villa-basse-eco",
    name: "Villa basse économique 2 chambres",
    buildingType: "villa_basse",
    standing: "economique",
    description:
      "Premier accession à la propriété : 2 chambres, séjour, cour arrière — pensée pour un budget serré sans sacrifier la durabilité (fondations et fer aux normes).",
    landArea: 200,
    builtArea: 75,
    levels: 1,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    costMin: 14000000,
    costMax: 20000000,
    features: ["Structure béton armé", "Toiture bac alu", "Économie éco-matériaux possible (BTC)"],
  },
  {
    id: "duplex-r1-4ch",
    name: "Duplex R+1 4 chambres",
    buildingType: "duplex_r1",
    standing: "moyen",
    description:
      "Duplex avec 4 chambres réparties sur deux niveaux, balcon et terrasse — la valeur sûre pour la location à Cotonou (départiement possible en 2 logements).",
    landArea: 300,
    builtArea: 180,
    levels: 2,
    rooms: 7,
    bedrooms: 4,
    bathrooms: 3,
    costMin: 38000000,
    costMax: 55000000,
    features: ["Balcon", "Terrasse accessible", "Départiement en 2 logements", "Place parking"],
  },
  {
    id: "duplex-r1-standing",
    name: "Duplex R+1 haut standing",
    buildingType: "duplex_r1",
    standing: "haut_standing",
    description:
      "Version haut standing : finitions carrelage grand format, climatisation multi-splits, cuisine équipée, bureau — pour les quartiers résidentiels (Haie Vive, Fidjrossè).",
    landArea: 500,
    builtArea: 240,
    levels: 2,
    rooms: 8,
    bedrooms: 5,
    bathrooms: 4,
    costMin: 65000000,
    costMax: 95000000,
    features: [
      "Piscine optionnelle",
      "Climatisation multi-splits",
      "Groupe électrogène",
      "Vidéosurveillance",
    ],
  },
  {
    id: "immeuble-r2-6app",
    name: "Immeuble R+2 — 6 appartements",
    buildingType: "immeuble_r2_r3",
    standing: "moyen",
    description:
      "Investissement locatif : 6 appartements 2 pièces meublés (2 par niveau), ascenseur optionnel — rentabilisé par la location courte durée aux voyageurs et diaspora.",
    landArea: 400,
    builtArea: 540,
    levels: 3,
    rooms: 24,
    bedrooms: 12,
    bathrooms: 6,
    costMin: 95000000,
    costMax: 140000000,
    features: ["6 logements locatifs", "Compteurs individuels", "Local commercial en RDC possible"],
  },
  {
    id: "cloture-terrain",
    name: "Clôture de terrain 500 m²",
    buildingType: "cloture",
    standing: "economique",
    description:
      "Première sécurisation du terrain : mur en agglos 20, fondations béton, portail métallique — étape indispensable avant tout stock de matériaux.",
    landArea: 500,
    builtArea: 0,
    levels: 0,
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    costMin: 2500000,
    costMax: 4500000,
    features: ["Mur agglos 20 cm", "Portail métallique", "Pieux béton armé"],
  },
] as const;

export function findHouseModel(id: string): HouseModel | undefined {
  return HOUSE_MODELS.find((m) => m.id === id);
}
