/**
 * Module d'estimation des coûts de transport logistique et camions de matériaux BTP.
 */

export type TruckType = "benne_6_roues" | "benne_10_roues" | "camion_plateau";
export type MaterialCategory = "sable_gravier" | "ciment" | "agglos" | "aciers";

export interface TransportCalculation {
  truckType: TruckType;
  truckLabel: string;
  distanceKm: number;
  rotationsCount: number;
  baseFareFcfa: number;
  distanceCostFcfa: number;
  unloadingLaborFcfa: number;
  totalTransportCostFcfa: number;
}

export const TRUCK_OPTIONS: {
  value: TruckType;
  label: string;
  capacity: string;
  baseFare: number;
  pricePerKm: number;
}[] = [
  {
    value: "benne_6_roues",
    label: "Camion Benne 6 roues",
    capacity: "10 m³ (~16 Tonnes)",
    baseFare: 25000,
    pricePerKm: 800,
  },
  {
    value: "benne_10_roues",
    label: "Camion Benne 10 roues",
    capacity: "16 m³ (~25 Tonnes)",
    baseFare: 35000,
    pricePerKm: 1200,
  },
  {
    value: "camion_plateau",
    label: "Camion Plateau / Semi-remorque",
    capacity: "20 à 30 Tonnes (Ciment / Fers)",
    baseFare: 45000,
    pricePerKm: 1500,
  },
];

export function calculateTransportCost(
  truckType: TruckType,
  distanceKm: number,
  rotations: number,
  includeUnloadingLabor: boolean,
): TransportCalculation {
  const fallback = TRUCK_OPTIONS[0] as (typeof TRUCK_OPTIONS)[0];
  const truckMeta = TRUCK_OPTIONS.find((t) => t.value === truckType) ?? fallback;
  const safeDistance = Math.max(1, distanceKm);
  const safeRotations = Math.max(1, rotations);

  const baseFareTotal = truckMeta.baseFare * safeRotations;
  const distanceCostTotal = Math.round(safeDistance * 2 * truckMeta.pricePerKm * safeRotations); // Aller-retour
  const unloadingLaborTotal = includeUnloadingLabor ? 5000 * safeRotations : 0; // Forfait manœuvres

  const totalTransportCostFcfa = baseFareTotal + distanceCostTotal + unloadingLaborTotal;

  return {
    truckType,
    truckLabel: truckMeta.label,
    distanceKm: safeDistance,
    rotationsCount: safeRotations,
    baseFareFcfa: baseFareTotal,
    distanceCostFcfa: distanceCostTotal,
    unloadingLaborFcfa: unloadingLaborTotal,
    totalTransportCostFcfa,
  };
}
