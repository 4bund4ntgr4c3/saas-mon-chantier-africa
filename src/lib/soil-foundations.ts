/**
 * Module géotechnique simplifié pour le calcul de portance des sols et recommandation de fondations au Bénin.
 */

export type SoilType =
  | "sable_littoral" // Cotonou, Sèmè-Kpodji, Ouidah
  | "argile_marecageuse" // Bas-fonds, Ganvié, zones inondables Calavi
  | "terre_de_barre" // Plateau d'Abomey-Calavi, Allada, Bohicon
  | "cuirasse_rocheuse"; // Dassa, Parakou, Natitingou

export type BuildingType = "rdc" | "r_plus_1" | "r_plus_2" | "r_plus_3_et_plus";

export interface SoilFoundationAdvice {
  soilLabel: string;
  admissibleBearingCapacityBars: number; // en bars (1 bar = 0.1 MPa = 100 kPa)
  recommendedFoundation: string;
  waterTableRisk: string;
  recommendedConcreteGrade: string;
  antiCapillaryLayerRecommended: boolean;
  engineeringAdvice: string[];
}

export function evaluateSoilAndFoundations(
  soilType: SoilType,
  buildingType: BuildingType,
): SoilFoundationAdvice {
  switch (soilType) {
    case "sable_littoral": {
      const isHeavy = buildingType === "r_plus_2" || buildingType === "r_plus_3_et_plus";
      return {
        soilLabel: "Sable fin à moyen littoral (Cotonou / Sèmè / Ouidah)",
        admissibleBearingCapacityBars: 1.5,
        recommendedFoundation: isHeavy
          ? "Radier général nervuré étanche en béton armé B25"
          : "Semelles filantes croisées sous murs et semelles isolées sous poteaux",
        waterTableRisk:
          "Nappe phréatique très superficielle (0.5m à 1.5m de profondeur). Risque d'inondation par remontée.",
        recommendedConcreteGrade: "Béton B25 avec adjuvant hydrofuge de masse",
        antiCapillaryLayerRecommended: true,
        engineeringAdvice: [
          "Mettre en place un hérisson en gravier ou tout-venant compacté de 20 cm minimum.",
          "Poser un film polyane 200 microns sous le dallage pour bloquer les remontées d'humidité.",
          "Enrobage des armatures de 5 cm pour prévenir la corrosion saline.",
        ],
      };
    }
    case "argile_marecageuse": {
      return {
        soilLabel: "Argile molle compressible / Zone marécageuse",
        admissibleBearingCapacityBars: 0.8,
        recommendedFoundation:
          buildingType === "rdc"
            ? "Radier général étanche après purge et remblai d'apport compacté"
            : "Pieux ou micro-pieux ancrés dans le bon sol porteur profond",
        waterTableRisk:
          "Sol saturé d'eau en permanence. Risque majeur de tassements différentiels et de fissuration.",
        recommendedConcreteGrade: "Béton B30 hydrofugé avec ciment résistant aux sulfates",
        antiCapillaryLayerRecommended: true,
        engineeringAdvice: [
          "Étude de sol géotechnique G2 obligatoire avec pénétromètre statique ou carottage.",
          "Purge des terres végétales et vaseuses jusqu'au substratum dur.",
          "Longrines de rigidification renforcées.",
        ],
      };
    }
    case "terre_de_barre": {
      const isTower = buildingType === "r_plus_3_et_plus";
      return {
        soilLabel: "Terre de barre ferme (Plateau d'Allada / Abomey-Calavi / Bohicon)",
        admissibleBearingCapacityBars: 2.5,
        recommendedFoundation: isTower
          ? "Radier général ou gros plots de semelles isolées liaisonnées par longrines"
          : "Semelles filantes en béton armé à 1.0m / 1.2m de profondeur",
        waterTableRisk: "Nappe phréatique profonde (> 15m). Excellent comportement au drainage.",
        recommendedConcreteGrade: "Béton B25 structural standard",
        antiCapillaryLayerRecommended: false,
        engineeringAdvice: [
          "Excellente portance naturelle, sol idéal pour la construction résidentielle.",
          "Descendre les fouilles d'au moins 1 mètre pour atteindre la terre rouge consolidée.",
          "Soigner le remblaiement périphérique contre le ravinement des eaux de pluie.",
        ],
      };
    }
    case "cuirasse_rocheuse": {
      return {
        soilLabel: "Cuirasse latéritique / Substratum rocheux (Collines, Nord-Bénin)",
        admissibleBearingCapacityBars: 4.0,
        recommendedFoundation: "Semelles isolées superficielles peu profondes (0.6m à 0.8m)",
        waterTableRisk: "Nappe très profonde, aucun risque de remontée capillaire.",
        recommendedConcreteGrade: "Béton B20 / B25",
        antiCapillaryLayerRecommended: false,
        engineeringAdvice: [
          "Portance exceptionnelle, aucune déformation sous charge.",
          "Prévoir des marteaux-piqueurs pour l'ouverture des fouilles dans la roche.",
          "Ancrage direct des poteaux dans le rocher sain.",
        ],
      };
    }
  }
}
