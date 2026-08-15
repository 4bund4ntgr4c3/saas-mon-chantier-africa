/**
 * Module d'évaluation de l'empreinte carbone BTP et solutions d'éco-construction.
 */

export interface CarbonFootprintInput {
  cementBags50kg: number;
  steelTons: number;
  transportKmTotal: number;
  dieselLiters: number;
}

export interface CarbonFootprintResult {
  cementEmissionsTons: number;
  steelEmissionsTons: number;
  transportEmissionsTons: number;
  energyEmissionsTons: number;
  totalEmissionsTons: number;
  ecoSavingsTonsWithBtc: number; // Économie estimée avec Briques de Terre Compressée
  treesEquivalentToOffset: number; // 1 arbre ~25kg CO2/an = 40 arbres pour 1 tonne
}

export function calculateCarbonFootprint(input: CarbonFootprintInput): CarbonFootprintResult {
  // Ciment : 50kg * 0.82 kg CO2/kg = 41 kg CO2 par sac
  const cementEmissionsTons = Number(((input.cementBags50kg * 41) / 1000).toFixed(2));

  // Acier : 1.85 tonne CO2 par tonne d'acier
  const steelEmissionsTons = Number((input.steelTons * 1.85).toFixed(2));

  // Transport : ~0.15 kg CO2 par km (moyenne camion)
  const transportEmissionsTons = Number(((input.transportKmTotal * 0.15) / 1000).toFixed(2));

  // Énergie / Gasoil : 2.68 kg CO2 / L
  const energyEmissionsTons = Number(((input.dieselLiters * 2.68) / 1000).toFixed(2));

  const totalEmissionsTons = Number(
    (
      cementEmissionsTons +
      steelEmissionsTons +
      transportEmissionsTons +
      energyEmissionsTons
    ).toFixed(2),
  );

  // Économie potentielle avec alternatives écologiques (BTC + Solaire ~30% du ciment/énergie)
  const ecoSavingsTonsWithBtc = Number(
    (cementEmissionsTons * 0.35 + energyEmissionsTons).toFixed(2),
  );
  const treesEquivalentToOffset = Math.round(totalEmissionsTons * 40);

  return {
    cementEmissionsTons,
    steelEmissionsTons,
    transportEmissionsTons,
    energyEmissionsTons,
    totalEmissionsTons,
    ecoSavingsTonsWithBtc,
    treesEquivalentToOffset,
  };
}
