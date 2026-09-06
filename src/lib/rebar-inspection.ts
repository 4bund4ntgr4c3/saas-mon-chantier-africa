/**
 * Module d'inspection du ferraillage et contrôle des enrobages anti-corrosion marine.
 */

export interface RebarInspectionInputs {
  rebarDiameterMm: number; // ex: 10, 12, 14, 16
  isCoastalMarineZone: boolean; // Cotonou, Sèmè, Ouidah-Plage
  measuredOverlapLengthCm: number;
  measuredCoverThicknessCm: number;
  spacersPerM2Count: number;
}

export function evaluateRebarCompliance(inputs: RebarInspectionInputs): {
  requiredOverlapLengthCm: number;
  requiredCoverThicknessCm: number;
  isOverlapCompliant: boolean;
  isCoverCompliant: boolean;
  isSpacersCompliant: boolean;
  overallCompliant: boolean;
  verdict: string;
} {
  // Longueur de recouvrement minimale réglementaire : 40 diamètres (en cm)
  const requiredOverlapCm = Math.round((40 * inputs.rebarDiameterMm) / 10);
  // Enrobage minimal : 5cm en bord de mer, 3cm en zone continentale
  const requiredCoverCm = inputs.isCoastalMarineZone ? 5 : 3;

  const isOverlapCompliant = inputs.measuredOverlapLengthCm >= requiredOverlapCm;
  const isCoverCompliant = inputs.measuredCoverThicknessCm >= requiredCoverCm;
  const isSpacersCompliant = inputs.spacersPerM2Count >= 4;

  const overallCompliant = isOverlapCompliant && isCoverCompliant && isSpacersCompliant;

  let verdict = "Ferraillage 100% conforme aux règles BAEL avant coulage du béton ✅";
  if (!isCoverCompliant) {
    verdict = `Enrobage insuffisant (< ${requiredCoverCm} cm). Risque élevé de corrosion saline et d'éclatement du béton ⚠️`;
  } else if (!isOverlapCompliant) {
    verdict = `Recouvrement trop court (< ${requiredOverlapCm} cm). Risque de rupture mécanique de la liaison acier ⚠️`;
  } else if (!isSpacersCompliant) {
    verdict =
      "Nombre insuffisant de cales d'enrobage (< 4 cales/m²). Les fers touchent le coffrage ⚠️";
  }

  return {
    requiredOverlapLengthCm: requiredOverlapCm,
    requiredCoverThicknessCm: requiredCoverCm,
    isOverlapCompliant,
    isCoverCompliant,
    isSpacersCompliant,
    overallCompliant,
    verdict,
  };
}
