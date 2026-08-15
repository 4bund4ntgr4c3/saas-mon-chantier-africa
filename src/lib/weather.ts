/**
 * Module météo de chantier et aide à la décision pour le coulage de béton en Afrique de l'Ouest.
 */

export interface WeatherReport {
  city: string;
  temperature: number;
  condition: "sunny" | "partly_cloudy" | "rain" | "thunderstorm";
  conditionLabel: string;
  humidity: number;
  windSpeedKmh: number;
  rainProbabilityPercent: number;
  concretingStatus: "favorable" | "caution_rain" | "caution_heat";
  concretingAdvice: string;
}

export const CITIES_WEST_AFRICA = [
  "Cotonou",
  "Abomey-Calavi",
  "Porto-Novo",
  "Parakou",
  "Ouidah",
  "Bohicon",
  "Natitingou",
  "Lomé",
  "Abidjan",
] as const;

export type CityName = (typeof CITIES_WEST_AFRICA)[number];

export function getWeatherForCity(city: string): WeatherReport {
  const normalized = city.trim().toLowerCase();

  if (normalized.includes("parakou") || normalized.includes("natitingou")) {
    return {
      city: "Parakou",
      temperature: 34,
      condition: "sunny",
      conditionLabel: "Ensoleillé et chaud",
      humidity: 45,
      windSpeedKmh: 12,
      rainProbabilityPercent: 10,
      concretingStatus: "caution_heat",
      concretingAdvice:
        "Forte chaleur : coulez tôt le matin (avant 10h) et prévoyez une cure de béton (arrosage régulier) pour éviter les fissures de retrait.",
    };
  }

  if (normalized.includes("porto") || normalized.includes("ouidah")) {
    return {
      city: "Porto-Novo",
      temperature: 29,
      condition: "partly_cloudy",
      conditionLabel: "Éclaircies",
      humidity: 78,
      windSpeedKmh: 18,
      rainProbabilityPercent: 25,
      concretingStatus: "favorable",
      concretingAdvice:
        "Conditions optimales pour le coulage et la maçonnerie. Prévoyez des bâches au cas où une ondée surviendrait.",
    };
  }

  // Par défaut : Cotonou / Abomey-Calavi
  return {
    city: "Cotonou / Abomey-Calavi",
    temperature: 30,
    condition: "partly_cloudy",
    conditionLabel: "Partiellement nuageux",
    humidity: 82,
    windSpeedKmh: 20,
    rainProbabilityPercent: 20,
    concretingStatus: "favorable",
    concretingAdvice: "Bonnes conditions de coulage. Température modérée et bonne prise du liant.",
  };
}
