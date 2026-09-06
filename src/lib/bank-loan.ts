/**
 * Module de calcul de prêt bancaire et crédit immobilier en zone UEMOA (Bénin / BCEAO).
 */

export interface LoanSimulationResult {
  borrowedAmountFcfa: number;
  annualInterestRatePercent: number;
  durationYears: number;
  monthlyPaymentFcfa: number;
  totalInterestFcfa: number;
  totalCostFcfa: number;
  monthlyInsuranceFcfa: number;
  minimumNetIncomeRequiredFcfa: number; // Basé sur le ratio d'endettement max de 33%
}

export function calculateBankLoan(
  borrowedAmountFcfa: number,
  annualInterestRatePercent: number,
  durationYears: number,
  insuranceRatePercent: number = 0.36,
): LoanSimulationResult {
  const principal = Math.max(100000, borrowedAmountFcfa);
  const rate = Math.max(0.1, annualInterestRatePercent) / 100;
  const months = Math.max(1, durationYears * 12);
  const monthlyRate = rate / 12;

  // Formule classique d'amortissement à annuités constantes : M = P * [r / (1 - (1+r)^-n)]
  const monthlyPrincipalAndInterest =
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

  const monthlyInsurance = (principal * (insuranceRatePercent / 100)) / 12;
  const totalMonthlyPayment = Math.round(monthlyPrincipalAndInterest + monthlyInsurance);

  const totalCost = totalMonthlyPayment * months;
  const totalInterest = Math.round(totalCost - principal);
  const minNetIncome = Math.round(totalMonthlyPayment / 0.33); // 33% d'endettement max

  return {
    borrowedAmountFcfa: principal,
    annualInterestRatePercent,
    durationYears,
    monthlyPaymentFcfa: totalMonthlyPayment,
    totalInterestFcfa: totalInterest,
    totalCostFcfa: totalCost,
    monthlyInsuranceFcfa: Math.round(monthlyInsurance),
    minimumNetIncomeRequiredFcfa: minNetIncome,
  };
}
