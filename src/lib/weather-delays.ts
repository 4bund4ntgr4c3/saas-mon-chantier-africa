/**
 * Module de suivi des jours d'intempéries pluvieuses et replanification calendaire.
 */

export interface WeatherStoppageRecord {
  id: string;
  date: string;
  reason: "forte_pluie_coulage" | "inondation_fouille" | "orage_securite_grue";
  reasonLabel: string;
  lostHours: number;
}

export function getDefaultWeatherStoppages(): WeatherStoppageRecord[] {
  return [
    {
      id: "st-1",
      date: "2026-06-12",
      reason: "forte_pluie_coulage",
      reasonLabel: "Pluie torrentielle empêchant le coulage de la dalle",
      lostHours: 8,
    },
    {
      id: "st-2",
      date: "2026-06-18",
      reason: "inondation_fouille",
      reasonLabel: "Inondation des fouilles de fondations (pompage requis)",
      lostHours: 8,
    },
    {
      id: "st-3",
      date: "2026-06-25",
      reason: "forte_pluie_coulage",
      reasonLabel: "Orage tropical violent avec vent fort",
      lostHours: 8,
    },
  ];
}

export function computeWeatherDelayExtension(
  stoppages: WeatherStoppageRecord[],
  initialDeliveryDateStr: string,
  dailyPenaltyFcfa: number = 50000,
): {
  totalLostDays: number;
  totalLostHours: number;
  newDeliveryDateStr: string;
  savedPenaltiesFcfa: number;
} {
  const totalLostHours = stoppages.reduce((sum, s) => sum + s.lostHours, 0);
  const totalLostDays = Math.ceil(totalLostHours / 8);

  const initialDate = new Date(initialDeliveryDateStr);
  const newDate = new Date(initialDate);
  newDate.setDate(newDate.getDate() + totalLostDays);

  const newDeliveryDateStr = isNaN(newDate.getTime())
    ? initialDeliveryDateStr
    : newDate.toISOString().slice(0, 10);

  const savedPenalties = totalLostDays * dailyPenaltyFcfa;

  return {
    totalLostDays,
    totalLostHours,
    newDeliveryDateStr,
    savedPenaltiesFcfa: savedPenalties,
  };
}
