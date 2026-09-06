/**
 * Simulateur de crédit immobilier UEMOA : mensualités (annuités constantes),
 * coût total des intérêts, assurance et apport. Taux indicatifs zone UEMOA.
 */

export type MortgageInput = {
  /** Prix du bien / coût total de construction (FCFA). */
  price: number;
  /** Apport personnel (FCFA). */
  downPayment: number;
  /** Taux annuel en % (ex. 8.5). */
  annualRatePct: number;
  /** Durée en années. */
  years: number;
  /** Taux d'assurance emprunteur annuel en % (défaut 0.5). */
  insuranceRatePct?: number;
};

export type MortgageScheduleRow = {
  year: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
};

export type MortgageResult = {
  loanAmount: number;
  monthlyPayment: number;
  monthlyInsurance: number;
  totalInterest: number;
  totalInsurance: number;
  totalCost: number;
  months: number;
  debtRatioHint: string | null;
  /** Récapitulatif annuel de l'amortissement. */
  schedule: MortgageScheduleRow[];
};

export function simulateMortgage(input: MortgageInput): MortgageResult {
  const price = Math.max(0, input.price);
  const down = Math.min(Math.max(0, input.downPayment), price);
  const loanAmount = price - down;
  const months = Math.max(1, Math.round(input.years * 12));
  const r = Math.max(0, input.annualRatePct) / 100 / 12;
  const insuranceRate = Math.max(0, input.insuranceRatePct ?? 0.5) / 100 / 12;

  const monthlyPayment =
    r === 0 ? loanAmount / months : (loanAmount * r) / (1 - Math.pow(1 + r, -months));
  const monthlyInsurance = loanAmount * insuranceRate;

  // Amortissement année par année.
  const schedule: MortgageScheduleRow[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  for (let year = 1; year <= Math.ceil(months / 12); year++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    for (let m = 0; m < 12 && (year - 1) * 12 + m < months; m++) {
      const interest = balance * r;
      const principal = monthlyPayment - interest;
      yearInterest += interest;
      yearPrincipal += principal;
      balance = Math.max(0, balance - principal);
    }
    totalInterest += yearInterest;
    schedule.push({
      year,
      interestPaid: Math.round(yearInterest),
      principalPaid: Math.round(yearPrincipal),
      remainingBalance: Math.round(balance),
    });
  }

  const totalInsurance = monthlyInsurance * months;
  // Indicateur d'éligibilité usuel : mensualité <= 33 % d'un revenu estimé.
  const suggestedIncome = monthlyPayment / 0.33;
  const debtRatioHint =
    loanAmount > 0
      ? `À ce taux, un revenu d'environ ${Math.round(suggestedIncome).toLocaleString("fr-FR")} FCFA/mois est attendu (mensualité ≤ 33 % du revenu).`
      : null;

  return {
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment + monthlyInsurance),
    monthlyInsurance: Math.round(monthlyInsurance),
    totalInterest: Math.round(totalInterest),
    totalInsurance: Math.round(totalInsurance),
    totalCost: Math.round(loanAmount + totalInterest + totalInsurance),
    months,
    debtRatioHint,
    schedule,
  };
}
