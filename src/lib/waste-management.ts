/**
 * Module de gestion, valorisation et évacuation des déchets de chantier (inertes, gravats, terre).
 */

export interface WasteManagementInputs {
  excavationVolumeM3: number; // Volume de fouilles / terre excavée
  demolitionVolumeM3: number; // Volume gravats de démolition / décapage
  onsiteBackfillNeedsM3: number; // Besoin en remblai sous dallage / cour
  truckCapacityM3: 8 | 12; // Capacité du camion benne
}

export function calculateWastePlanAndDisposal(inputs: WasteManagementInputs): {
  totalWasteGeneratedM3: number;
  reusedVolumeM3: number;
  netVolumeToDisposeM3: number;
  truckTripsCount: number;
  reusedSavingsFcfa: number;
  disposalCostFcfa: number;
  netBudgetImpactFcfa: number;
  wasteManagementTips: string[];
} {
  const totalWaste = inputs.excavationVolumeM3 + inputs.demolitionVolumeM3;
  const reusedVolume = Math.min(totalWaste, inputs.onsiteBackfillNeedsM3);
  const netVolumeToDispose = Math.max(0, totalWaste - reusedVolume);

  const truckTripsCount = Math.ceil(netVolumeToDispose / inputs.truckCapacityM3);

  // Prix moyen au Bénin :
  // Achat d'un camion de terre de remblai épargné : ~35 000 FCFA / benne de 8m³ (~4 375 FCFA / m³)
  // Coût évacuation + mise en décharge autorisée : ~45 000 FCFA / rotation de 8m³ ou ~65 000 FCFA pour 12m³
  const costPerTrip = inputs.truckCapacityM3 === 12 ? 65000 : 45000;
  const disposalCostFcfa = truckTripsCount * costPerTrip;

  const reusedSavingsFcfa = Math.round(reusedVolume * 4375);
  const netBudgetImpactFcfa = disposalCostFcfa;

  const wasteManagementTips: string[] = [
    "Trier les gravats de béton/agglos propres pour les concasser et les utiliser en hérisson drainant sous dallage.",
    "Stocker la terre végétale supérieure décapée dans un angle de la parcelle pour le futur aménagement paysager/jardin.",
    "Vendre ou donner les chutes de ferraille et fers à béton aux ferrailleurs recycleurs locaux.",
    "Exiger un bon de décharge officielle pour garantir l'absence de dépôts sauvages.",
  ];

  return {
    totalWasteGeneratedM3: totalWaste,
    reusedVolumeM3: reusedVolume,
    netVolumeToDisposeM3: netVolumeToDispose,
    truckTripsCount,
    reusedSavingsFcfa,
    disposalCostFcfa,
    netBudgetImpactFcfa,
    wasteManagementTips,
  };
}
