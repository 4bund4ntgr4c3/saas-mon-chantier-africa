/**
 * Module du registre journalier de présence des ouvriers et contrôle des EPI.
 */

export interface TradeAttendanceRecord {
  id: string;
  trade: "maconnerie" | "ferraillage" | "coffrage" | "electricite" | "plomberie" | "manoeuvre";
  tradeLabel: string;
  workerCount: number;
  dailyRatePerWorkerFcfa: number;
  epiFullyEquipped: boolean;
}

export function getDefaultTradeAttendance(): TradeAttendanceRecord[] {
  return [
    {
      id: "att-macon",
      trade: "maconnerie",
      tradeLabel: "Maçons & Poseurs d'agglos",
      workerCount: 4,
      dailyRatePerWorkerFcfa: 7000,
      epiFullyEquipped: true,
    },
    {
      id: "att-fer",
      trade: "ferraillage",
      tradeLabel: "Ferrailleurs / Poseurs d'aciers",
      workerCount: 3,
      dailyRatePerWorkerFcfa: 7500,
      epiFullyEquipped: true,
    },
    {
      id: "att-cof",
      trade: "coffrage",
      tradeLabel: "Charpentiers / Coffreurs bois",
      workerCount: 2,
      dailyRatePerWorkerFcfa: 7000,
      epiFullyEquipped: true,
    },
    {
      id: "att-man",
      trade: "manoeuvre",
      tradeLabel: "Manœuvres & Manutentionnaires",
      workerCount: 6,
      dailyRatePerWorkerFcfa: 4000,
      epiFullyEquipped: false,
    },
  ];
}

export function computeDailyLaborSummary(records: TradeAttendanceRecord[]): {
  totalWorkers: number;
  totalDailyPayrollFcfa: number;
  epiComplianceRatePercent: number;
  safetyAlert: string;
} {
  let totalWorkers = 0;
  let totalDailyPayroll = 0;
  let equippedWorkers = 0;

  for (const r of records) {
    totalWorkers += r.workerCount;
    totalDailyPayroll += r.workerCount * r.dailyRatePerWorkerFcfa;
    if (r.epiFullyEquipped) {
      equippedWorkers += r.workerCount;
    }
  }

  const epiComplianceRate =
    totalWorkers > 0 ? Math.round((equippedWorkers / totalWorkers) * 100) : 100;

  const safetyAlert =
    epiComplianceRate === 100
      ? "100% des ouvriers équipés en EPI (Casques + Chaussures de sécurité) ✅"
      : `${totalWorkers - equippedWorkers} ouvrier(s) non conformes en EPI. Risque d'accident de chantier ⚠️`;

  return {
    totalWorkers,
    totalDailyPayrollFcfa: totalDailyPayroll,
    epiComplianceRatePercent: epiComplianceRate,
    safetyAlert,
  };
}
