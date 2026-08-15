/**
 * Module de dimensionnement photovoltaïque et solaire pour chantiers et habitations en Afrique de l'Ouest.
 */

export interface SolarAppliance {
  id: string;
  name: string;
  powerWatts: number;
  quantity: number;
  hoursPerDay: number;
}

export interface SolarRequirement {
  totalPowerWatts: number;
  dailyConsumptionWh: number;
  peakSolarPowerWp: number; // Puissance crête en Watt-crête (Wc)
  panelsCount450W: number;
  batteryCapacityKWh: number;
  inverterPowerKVA: number;
  estimatedCostFcfa: number;
}

export const COMMON_APPLIANCES: SolarAppliance[] = [
  {
    id: "borehole",
    name: "Pompe de forage chantier (1 CV)",
    powerWatts: 750,
    quantity: 1,
    hoursPerDay: 3,
  },
  {
    id: "lighting",
    name: "Éclairage LED chantier / maison (10x10W)",
    powerWatts: 100,
    quantity: 1,
    hoursPerDay: 6,
  },
  {
    id: "fridge",
    name: "Réfrigérateur / Congélateur A+",
    powerWatts: 150,
    quantity: 1,
    hoursPerDay: 12,
  },
  {
    id: "tools",
    name: "Outillage électroportatif / bétonnière",
    powerWatts: 1200,
    quantity: 1,
    hoursPerDay: 2,
  },
  { id: "ac", name: "Climatiseur Inverter 1.5 CV", powerWatts: 1100, quantity: 1, hoursPerDay: 5 },
];

export function calculateSolarSystem(appliances: SolarAppliance[]): SolarRequirement {
  let totalPowerWatts = 0;
  let dailyConsumptionWh = 0;

  for (const app of appliances) {
    const qty = Math.max(0, app.quantity);
    const p = Math.max(0, app.powerWatts) * qty;
    totalPowerWatts += p;
    dailyConsumptionWh += p * Math.max(0, app.hoursPerDay);
  }

  // Heures d'ensoleillement effectif au Bénin / Golfe de Guinée : ~5.0 h/jour
  // Facteur de performance système (câbles, onduleur, poussière) : 0.75
  const sunHours = 5.0;
  const systemEfficiency = 0.75;
  const peakSolarPowerWp = Math.ceil(dailyConsumptionWh / (sunHours * systemEfficiency));

  // Panneaux standards monocristallins 450 Wc
  const panelsCount450W = Math.max(1, Math.ceil(peakSolarPowerWp / 450));

  // Batterie Lithium (profondeur de décharge utile ~80%, 1 jour d'autonomie)
  const batteryCapacityKWh = Number((dailyConsumptionWh / 1000 / 0.8).toFixed(2));

  // Onduleur hybride : Puissance de pointe avec coef sécurité 1.3
  const inverterPowerKVA = Number(Math.max(1.5, (totalPowerWatts * 1.3) / 1000).toFixed(1));

  // Estimation budgétaire globale (panneaux + batterie lithium + onduleur hybride + structure + pose) :
  // ~800 FCFA / Wc de kit complet installé
  const estimatedCostFcfa = Math.round(Math.max(650000, peakSolarPowerWp * 850));

  return {
    totalPowerWatts,
    dailyConsumptionWh,
    peakSolarPowerWp,
    panelsCount450W,
    batteryCapacityKWh,
    inverterPowerKVA,
    estimatedCostFcfa,
  };
}
