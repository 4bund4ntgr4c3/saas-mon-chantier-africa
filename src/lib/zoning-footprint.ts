/**
 * Module de calcul d'emprise au sol (CES), coefficient d'occupation (COS) et conformité reculs d'urbanisme.
 */

export interface ZoningFootprintInputs {
  plotAreaM2: number; // Surface du terrain (ex: 400 m²)
  groundFloorFootprintM2: number; // Emprise bâtie au RDC (m²)
  totalFloorAreaM2: number; // Surface de plancher cumulée tous niveaux (m²)
  frontSetbackMeters: number; // Recul voie publique (m)
  sideSetbackMeters: number; // Recul limites latérales (m)
  rearSetbackMeters: number; // Recul fond de parcelle (m)
}

export function calculateZoningCompliance(inputs: ZoningFootprintInputs): {
  cesRatioPercent: number;
  cosRatio: number;
  isCesCompliant: boolean; // Max 60% standard
  isFrontSetbackCompliant: boolean; // Min 3m standard
  isSideSetbackCompliant: boolean; // Min 2m standard
  isRearSetbackCompliant: boolean; // Min 2m standard
  greenSpaceAreaM2: number; // Espace libre perméable (jardin, cour)
  complianceNotes: string[];
} {
  const plot = Math.max(50, inputs.plotAreaM2);
  const footprint = Math.max(10, inputs.groundFloorFootprintM2);
  const totalFloor = Math.max(footprint, inputs.totalFloorAreaM2);

  const cesRatioPercent = Number(((footprint / plot) * 100).toFixed(1));
  const cosRatio = Number((totalFloor / plot).toFixed(2));

  // Règles standards du code d'urbanisme (Bénin / Afrique de l'Ouest) :
  // CES max = 60% en zone résidentielle
  // Recul voie >= 3m, Recul latéral >= 2m, Recul fond >= 2m
  const isCesCompliant = cesRatioPercent <= 60.0;
  const isFrontSetbackCompliant = inputs.frontSetbackMeters >= 3.0;
  const isSideSetbackCompliant = inputs.sideSetbackMeters >= 2.0;
  const isRearSetbackCompliant = inputs.rearSetbackMeters >= 2.0;

  const greenSpaceAreaM2 = Math.max(0, plot - footprint);

  const complianceNotes: string[] = [];

  if (!isCesCompliant) {
    complianceNotes.push(
      `Attention : Emprise au sol de ${cesRatioPercent}% supérieure au plafond habituel de 60%. Risque de refus de Permis de Construire.`,
    );
  } else {
    complianceNotes.push(`Emprise au sol (CES) conforme : ${cesRatioPercent}% du terrain bâti.`);
  }

  if (!isFrontSetbackCompliant) {
    complianceNotes.push(
      `Recul sur voie insuffisant (${inputs.frontSetbackMeters}m). Prévoir au moins 3.0m par rapport à l'alignement de la rue.`,
    );
  }

  if (!isSideSetbackCompliant || !isRearSetbackCompliant) {
    complianceNotes.push(
      "Respecter au moins 2.0m de marge de recul avec les voisins ou bâtir en limite séparative aveugle (sans vue directe).",
    );
  }

  return {
    cesRatioPercent,
    cosRatio,
    isCesCompliant,
    isFrontSetbackCompliant,
    isSideSetbackCompliant,
    isRearSetbackCompliant,
    greenSpaceAreaM2,
    complianceNotes,
  };
}
