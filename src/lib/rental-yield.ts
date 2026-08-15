/**
 * Module de calcul de rentabilité locative et retour sur investissement (ROI) post-construction.
 */

export interface RentalYieldCalculation {
  totalInvestmentCostFcfa: number;
  monthlyRentFcfa: number;
  annualGrossRentFcfa: number;
  grossYieldPercent: number;
  managementFeesFcfa: number; // ~10%
  propertyTaxFcfa: number; // ~5%
  maintenanceProvisionFcfa: number; // ~5%
  vacancyRatePercent: number; // ~5%
  annualNetIncomeFcfa: number;
  netYieldPercent: number;
  paybackPeriodYears: number;
  monthlyNetCashflowFcfa: number;
}

export function calculateRentalYield(
  totalInvestmentCostFcfa: number,
  monthlyRentFcfa: number,
  managementFeeRate: number = 0.1, // 10%
  taxRate: number = 0.05, // 5% taxe foncière / impôt
  maintenanceRate: number = 0.05, // 5% entretien
  vacancyRate: number = 0.05, // 5% vacance
): RentalYieldCalculation {
  const safeCost = Math.max(1, totalInvestmentCostFcfa);
  const safeMonthlyRent = Math.max(0, monthlyRentFcfa);

  const annualGrossRentFcfa = safeMonthlyRent * 12;
  const grossYieldPercent = Number(((annualGrossRentFcfa / safeCost) * 100).toFixed(2));

  const effectiveAnnualGross = annualGrossRentFcfa * (1 - vacancyRate);
  const managementFeesFcfa = Math.round(effectiveAnnualGross * managementFeeRate);
  const propertyTaxFcfa = Math.round(effectiveAnnualGross * taxRate);
  const maintenanceProvisionFcfa = Math.round(effectiveAnnualGross * maintenanceRate);

  const annualNetIncomeFcfa = Math.round(
    effectiveAnnualGross - managementFeesFcfa - propertyTaxFcfa - maintenanceProvisionFcfa,
  );

  const netYieldPercent = Number(((annualNetIncomeFcfa / safeCost) * 100).toFixed(2));
  const paybackPeriodYears =
    annualNetIncomeFcfa > 0 ? Number((safeCost / annualNetIncomeFcfa).toFixed(1)) : 99;
  const monthlyNetCashflowFcfa = Math.round(annualNetIncomeFcfa / 12);

  return {
    totalInvestmentCostFcfa: safeCost,
    monthlyRentFcfa: safeMonthlyRent,
    annualGrossRentFcfa,
    grossYieldPercent,
    managementFeesFcfa,
    propertyTaxFcfa,
    maintenanceProvisionFcfa,
    vacancyRatePercent: vacancyRate * 100,
    annualNetIncomeFcfa,
    netYieldPercent,
    paybackPeriodYears,
    monthlyNetCashflowFcfa,
  };
}
