/**
 * Module de calcul des remises sur volume et centrale d'achats groupés BTP.
 */

export interface BulkDiscountCalculation {
  materialType: "ciment" | "fer_a_beton" | "sable_gravier";
  quantity: number;
  unitPriceStandardFcfa: number;
  totalStandardPriceFcfa: number;
  discountRatePercent: number;
  discountAmountFcfa: number;
  finalNegotiatedPriceFcfa: number;
  tierLabel: string;
}

export function calculateBulkDiscount(
  materialType: "ciment" | "fer_a_beton" | "sable_gravier",
  quantity: number,
  unitPriceStandardFcfa: number,
): BulkDiscountCalculation {
  const safeQty = Math.max(1, quantity);
  const totalStandard = safeQty * unitPriceStandardFcfa;

  let discountRate = 0;
  let tierLabel = "Tarif public standard";

  if (materialType === "ciment") {
    if (safeQty >= 500) {
      discountRate = 0.14;
      tierLabel = "Palier Gros Chantier / Promoteur (-14%)";
    } else if (safeQty >= 200) {
      discountRate = 0.09;
      tierLabel = "Palier Groupement Demi-Gros (-9%)";
    } else if (safeQty >= 50) {
      discountRate = 0.05;
      tierLabel = "Palier Découverte Volume (-5%)";
    }
  } else if (materialType === "fer_a_beton") {
    if (safeQty >= 5) {
      discountRate = 0.12;
      tierLabel = "Palier Centrale d'Achats Aciers (-12%)";
    } else if (safeQty >= 2) {
      discountRate = 0.06;
      tierLabel = "Palier Volume Aciers (-6%)";
    }
  } else {
    // Sable / gravier en voyages de camion
    if (safeQty >= 10) {
      discountRate = 0.1;
      tierLabel = "Palier Flotte 10+ rotations (-10%)";
    } else if (safeQty >= 3) {
      discountRate = 0.05;
      tierLabel = "Palier 3+ rotations (-5%)";
    }
  }

  const discountAmount = Math.round(totalStandard * discountRate);
  const finalPrice = totalStandard - discountAmount;

  return {
    materialType,
    quantity: safeQty,
    unitPriceStandardFcfa,
    totalStandardPriceFcfa: totalStandard,
    discountRatePercent: Number((discountRate * 100).toFixed(0)),
    discountAmountFcfa: discountAmount,
    finalNegotiatedPriceFcfa: finalPrice,
    tierLabel,
  };
}
