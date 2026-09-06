/**
 * Module de gestion du réseau de quincailleries partenaires et multi-dépôts régionaux.
 */

export interface RegionalWarehouse {
  id: string;
  name: string;
  city: string;
  zone: string;
  cementStockBags: number;
  steelStockTons: number;
  estimatedDeliveryHours: number;
  contactPhone: string;
}

export const REGIONAL_WAREHOUSES: RegionalWarehouse[] = [
  {
    id: "depot-cotonou",
    name: "Quincaillerie Centrale Portuaire",
    city: "Cotonou",
    zone: "Akpakpa / Zone Industrielle",
    cementStockBags: 3500,
    steelStockTons: 45,
    estimatedDeliveryHours: 2,
    contactPhone: "+229 97 00 11 22",
  },
  {
    id: "depot-calavi",
    name: "Comptoir BTP Calavi",
    city: "Abomey-Calavi",
    zone: "Bidossessi / Arconville",
    cementStockBags: 2200,
    steelStockTons: 30,
    estimatedDeliveryHours: 3,
    contactPhone: "+229 96 33 44 55",
  },
  {
    id: "depot-porto-novo",
    name: "Dépôt Matériaux Ouando",
    city: "Porto-Novo",
    zone: "Ouando / Carrefour Cinquantenaire",
    cementStockBags: 1800,
    steelStockTons: 20,
    estimatedDeliveryHours: 4,
    contactPhone: "+229 95 66 77 88",
  },
  {
    id: "depot-parakou",
    name: "Hub BTP Grand Nord",
    city: "Parakou",
    zone: "Zongo / Titirou",
    cementStockBags: 1400,
    steelStockTons: 15,
    estimatedDeliveryHours: 6,
    contactPhone: "+229 94 99 88 77",
  },
];

export function findBestWarehouse(targetCity: string): RegionalWarehouse {
  const match = REGIONAL_WAREHOUSES.find((w) => w.city.toLowerCase() === targetCity.toLowerCase());
  return match ?? REGIONAL_WAREHOUSES[0]!;
}
