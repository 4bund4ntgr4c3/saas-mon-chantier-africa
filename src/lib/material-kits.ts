/**
 * Packs matériaux « clé en main » : listes pré-remplies (quantités issues du
 * métré BTP, prix indicatifs marché) ajoutables au panier en un clic depuis
 * la boutique. Le matching produit se fait par nom normalisé côté boutique.
 */

export type MaterialKitItem = {
  label: string;
  unit: string;
  quantity: number;
  unitPriceRef: number; // FCFA indicatif
};

export type MaterialKit = {
  id: string;
  name: string;
  phase: string;
  description: string;
  items: readonly MaterialKitItem[];
};

export const MATERIAL_KITS: readonly MaterialKit[] = [
  {
    id: "kit-gros-oeuvre-villa-basse",
    name: "Kit gros œuvre — villa basse (120 m²)",
    phase: "Gros œuvre",
    description:
      "Fondations, murs porteurs et dalle d'une villa basse de 120 m² : agglos, ciment, acier, sable et gravier aux quantités du métré.",
    items: [
      { label: "Ciment CPJ 50 kg", unit: "sac", quantity: 320, unitPriceRef: 4500 },
      { label: "Agglos 20x20x40", unit: "pièce", quantity: 2200, unitPriceRef: 425 },
      { label: "Acier HA 10 (barres 12 m)", unit: "barre", quantity: 130, unitPriceRef: 5800 },
      { label: "Acier HA 6 (barres 12 m)", unit: "barre", quantity: 70, unitPriceRef: 3100 },
      { label: "Sable de mer", unit: "voyage", quantity: 14, unitPriceRef: 55000 },
      { label: "Gravier 15/25", unit: "voyage", quantity: 10, unitPriceRef: 65000 },
      { label: "Fil d'attache et pointes", unit: "lot", quantity: 1, unitPriceRef: 75000 },
    ],
  },
  {
    id: "kit-fondations",
    name: "Kit fondations — terrain 300 m²",
    phase: "Gros œuvre",
    description:
      "Fouilles, semelles filantes et chaînage bas : le démarrage de chantier livré en une commande.",
    items: [
      { label: "Ciment CPJ 50 kg", unit: "sac", quantity: 90, unitPriceRef: 4500 },
      { label: "Acier HA 8 (barres 12 m)", unit: "barre", quantity: 45, unitPriceRef: 4200 },
      { label: "Sable de mer", unit: "voyage", quantity: 4, unitPriceRef: 55000 },
      { label: "Gravier 15/25", unit: "voyage", quantity: 3, unitPriceRef: 65000 },
      { label: "Brique de blocage", unit: "pièce", quantity: 800, unitPriceRef: 350 },
    ],
  },
  {
    id: "kit-second-oeuvre",
    name: "Kit second œuvre — villa 3 chambres",
    phase: "Second œuvre",
    description:
      "Électricité, plomberie et carrelage d'une villa 3 chambres : gaines, câbles, sanitaires et revêtements.",
    items: [
      { label: "Câble électrique 2,5 mm²", unit: "rouleau", quantity: 8, unitPriceRef: 22000 },
      { label: "Câble électrique 1,5 mm²", unit: "rouleau", quantity: 6, unitPriceRef: 18500 },
      { label: " Gaines électriques 20 mm", unit: "barre", quantity: 40, unitPriceRef: 1200 },
      { label: "Disjoncteur + tableau", unit: "lot", quantity: 1, unitPriceRef: 145000 },
      { label: "Tube PVC Ø63 (plomberie)", unit: "barre", quantity: 18, unitPriceRef: 4500 },
      { label: "Carrelage 60x60 (m²)", unit: "m²", quantity: 130, unitPriceRef: 8500 },
      { label: "WC + lavabo + douche", unit: "lot", quantity: 2, unitPriceRef: 175000 },
    ],
  },
  {
    id: "kit-toiture",
    name: "Kit toiture — bac alu (120 m² au sol)",
    phase: "Toiture",
    description:
      "Charpente bois, tôles bac alu, faîtières et accessoires d'étanchéité pour 120 m² au sol.",
    items: [
      { label: "Tôle bac alu (laquée)", unit: "pièce", quantity: 46, unitPriceRef: 16500 },
      { label: "Faîtière", unit: "pièce", quantity: 12, unitPriceRef: 8500 },
      { label: "Chevrons bois 8x8", unit: "pièce", quantity: 60, unitPriceRef: 3500 },
      { label: "Madriers 27x8", unit: "pièce", quantity: 22, unitPriceRef: 6800 },
      { label: "Vis + croix de toiture", unit: "lot", quantity: 1, unitPriceRef: 95000 },
    ],
  },
] as const;

/** Total indicatif d'un kit (FCFA). */
export function kitTotal(kit: MaterialKit): number {
  return kit.items.reduce((s, i) => s + i.quantity * i.unitPriceRef, 0);
}

export function findMaterialKit(id: string): MaterialKit | undefined {
  return MATERIAL_KITS.find((k) => k.id === id);
}
