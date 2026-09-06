/**
 * Earned Value Management (EVM) — indicateurs standard de pilotage de projet :
 * valeur acquise (EV), coût prévu (PV), coût réel (AC), CPI/SPI et prévision
 * de coût final (EAC). Complète la courbe en S du tableau de bord.
 */

export type EvmInput = {
  /** Enveloppe budgétaire totale (BAC). */
  budget: number;
  /** Coût réel cumulé (dépenses). */
  spent: number;
  /** Avancement physique en % (0-100), pondéré depuis les tâches. */
  progressPct: number | null;
  /** Valeur planifiée cumulée (courbe en S) — sinon budget * écoulement du temps. */
  plannedValue?: number | null;
  /** Fraction du temps écoulée (0-1) pour repli de la valeur planifiée. */
  elapsedFraction?: number | null;
};

export type EvmResult = {
  /** Valeur planifiée (PV) — ce qui devait être dépensé. */
  pv: number;
  /** Valeur acquise (EV) — budget × avancement réel des travaux. */
  ev: number;
  /** Coût réel (AC). */
  ac: number;
  /** Efficacité coût : EV / AC (>1 = sous le budget). */
  cpi: number | null;
  /** Efficacité délai : EV / PV (>1 = en avance). */
  spi: number | null;
  /** Prévision de coût final : budget / CPI. */
  eac: number | null;
  /** Écart final prévu : budget - EAC (négatif = dépassement attendu). */
  vac: number | null;
  /** Dépassement final prévu en %. */
  overrunPct: number | null;
};

export function computeEvm(input: EvmInput): EvmResult {
  const { budget, spent, progressPct, plannedValue, elapsedFraction } = input;
  const pv =
    plannedValue && plannedValue > 0
      ? plannedValue
      : budget > 0 && elapsedFraction != null && elapsedFraction > 0
        ? budget * Math.min(1, Math.max(0, elapsedFraction))
        : 0;
  const ev =
    budget > 0 && progressPct != null
      ? budget * (Math.min(100, Math.max(0, progressPct)) / 100)
      : 0;
  const ac = spent;
  const cpi = ac > 0 && ev > 0 ? ev / ac : null;
  const spi = pv > 0 && ev > 0 ? ev / pv : null;
  const eac = cpi && cpi > 0 ? budget / cpi : null;
  const vac = eac != null ? budget - eac : null;
  const overrunPct = eac != null && budget > 0 ? ((eac - budget) / budget) * 100 : null;
  return { pv, ev, ac, cpi, spi, eac, vac, overrunPct };
}

/** Interprétation courte des indicateurs, pour l'affichage. */
export function evmVerdict(evm: EvmResult): string {
  if (evm.cpi == null && evm.spi == null) return "Données insuffisantes pour la prévision.";
  const parts: string[] = [];
  if (evm.spi != null) {
    parts.push(
      evm.spi >= 1 ? "travaux en avance sur le planning" : "travaux en retard sur le planning",
    );
  }
  if (evm.cpi != null) {
    parts.push(evm.cpi >= 1 ? "coûts maîtrisés" : "dépenses plus rapides que l'avancement");
  }
  if (evm.overrunPct != null && evm.overrunPct > 1) {
    parts.push(`dépassement final attendu ≈ ${Math.round(evm.overrunPct)} %`);
  }
  return parts.join(" · ");
}
