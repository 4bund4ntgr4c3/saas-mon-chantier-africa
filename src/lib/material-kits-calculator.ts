/**
 * Module de calcul et génération de kits de matériaux par ouvrage type BTP au Bénin.
 */

export interface MaterialKitItem {
  name: string;
  category: "ciment" | "fer_a_beton" | "agregats" | "plomberie" | "coffrage";
  quantity: number;
  unit: string;
  estimatedUnitPriceFcfa: number;
  totalEstimatedPriceFcfa: number;
}

export interface MaterialKitStructure {
  id: string;
  title: string;
  description: string;
  items: MaterialKitItem[];
  totalEstimatedCostFcfa: number;
}

export function generateMaterialKit(
  kitType: "cloture" | "fosse_septique" | "dalle_pleine",
): MaterialKitStructure {
  if (kitType === "cloture") {
    const items: MaterialKitItem[] = [
      {
        name: "Agglos creux de 15x20x40",
        category: "agregats",
        quantity: 1800,
        unit: "unités",
        estimatedUnitPriceFcfa: 425,
        totalEstimatedPriceFcfa: 765000,
      },
      {
        name: "Ciment CPJ 42.5 (Sacs 50kg)",
        category: "ciment",
        quantity: 90,
        unit: "sacs",
        estimatedUnitPriceFcfa: 4500,
        totalEstimatedPriceFcfa: 405000,
      },
      {
        name: "Fer à béton FeE500 Tor 8mm",
        category: "fer_a_beton",
        quantity: 45,
        unit: "barres",
        estimatedUnitPriceFcfa: 3200,
        totalEstimatedPriceFcfa: 144000,
      },
      {
        name: "Fer à béton FeE500 Tor 10mm",
        category: "fer_a_beton",
        quantity: 35,
        unit: "barres",
        estimatedUnitPriceFcfa: 5200,
        totalEstimatedPriceFcfa: 182000,
      },
      {
        name: "Sable lagunaire de dragage",
        category: "agregats",
        quantity: 2,
        unit: "voyages (16m³)",
        estimatedUnitPriceFcfa: 85000,
        totalEstimatedPriceFcfa: 170000,
      },
    ];
    return {
      id: "kit-cloture",
      title: "Kit Clôture Périphérique (150 m² de mur)",
      description:
        "Fondations en semelles filantes, raidisseurs en BA tous les 3m et élévation agglos de 15.",
      items,
      totalEstimatedCostFcfa: items.reduce((s, i) => s + i.totalEstimatedPriceFcfa, 0),
    };
  }

  if (kitType === "fosse_septique") {
    const items: MaterialKitItem[] = [
      {
        name: "Ciment hydrofuge CPJ 42.5",
        category: "ciment",
        quantity: 40,
        unit: "sacs",
        estimatedUnitPriceFcfa: 4700,
        totalEstimatedPriceFcfa: 188000,
      },
      {
        name: "Agglos pleins de 15",
        category: "agregats",
        quantity: 650,
        unit: "unités",
        estimatedUnitPriceFcfa: 550,
        totalEstimatedPriceFcfa: 357500,
      },
      {
        name: "Fer à béton Tor 10mm",
        category: "fer_a_beton",
        quantity: 20,
        unit: "barres",
        estimatedUnitPriceFcfa: 5200,
        totalEstimatedPriceFcfa: 104000,
      },
      {
        name: "Tuyauterie PVC Évacuation Ø110",
        category: "plomberie",
        quantity: 6,
        unit: "barres (4m)",
        estimatedUnitPriceFcfa: 6500,
        totalEstimatedPriceFcfa: 39000,
      },
      {
        name: "Gravier concassé 15/25 pour lit filtrant",
        category: "agregats",
        quantity: 1,
        unit: "voyage (10m³)",
        estimatedUnitPriceFcfa: 120000,
        totalEstimatedPriceFcfa: 120000,
      },
    ];
    return {
      id: "kit-fosse",
      title: "Kit Fosse Septique Toutes Eaux & Puisard (6-10 personnes)",
      description:
        "2 compartiments de décantation étanches + bac dégraisseur + puisard d'infiltration.",
      items,
      totalEstimatedCostFcfa: items.reduce((s, i) => s + i.totalEstimatedPriceFcfa, 0),
    };
  }

  // Dalle pleine 100m²
  const items: MaterialKitItem[] = [
    {
      name: "Ciment CPJ 42.5 dosé à 350 kg/m³",
      category: "ciment",
      quantity: 120,
      unit: "sacs",
      estimatedUnitPriceFcfa: 4500,
      totalEstimatedPriceFcfa: 540000,
    },
    {
      name: "Fer à béton FeE500 Tor 10mm (Quadrillage)",
      category: "fer_a_beton",
      quantity: 70,
      unit: "barres",
      estimatedUnitPriceFcfa: 5200,
      totalEstimatedPriceFcfa: 364000,
    },
    {
      name: "Fer à béton FeE500 Tor 12mm (Poutres)",
      category: "fer_a_beton",
      quantity: 40,
      unit: "barres",
      estimatedUnitPriceFcfa: 7500,
      totalEstimatedPriceFcfa: 300000,
    },
    {
      name: "Gravier concassé 15/25",
      category: "agregats",
      quantity: 2,
      unit: "voyages (16m³)",
      estimatedUnitPriceFcfa: 190000,
      totalEstimatedPriceFcfa: 380000,
    },
    {
      name: "Sable de dragage lavé",
      category: "agregats",
      quantity: 2,
      unit: "voyages (16m³)",
      estimatedUnitPriceFcfa: 85000,
      totalEstimatedPriceFcfa: 170000,
    },
    {
      name: "Planches & chevrons de coffrage",
      category: "coffrage",
      quantity: 1,
      unit: "lot",
      estimatedUnitPriceFcfa: 250000,
      totalEstimatedPriceFcfa: 250000,
    },
  ];
  return {
    id: "kit-dalle",
    title: "Kit Dalle Pleine Béton Armé (100 m² / ép. 15 cm)",
    description:
      "Hourdis ou dalle pleine coulée sur étaiement avec armatures renforcées et béton 350 kg/m³.",
    items,
    totalEstimatedCostFcfa: items.reduce((s, i) => s + i.totalEstimatedPriceFcfa, 0),
  };
}
