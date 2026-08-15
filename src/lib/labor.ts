/**
 * Module de gestion de la main d'œuvre, du pointage et de la paie de chantier (BTP Afrique de l'Ouest).
 */

export interface Worker {
  id: string;
  name: string;
  role:
    | "macon"
    | "manoeuvre"
    | "ferrailleur"
    | "coffreur"
    | "electricien"
    | "plombier"
    | "peintre"
    | "menuisier"
    | "autre";
  roleLabel: string;
  dailyRate: number; // tarif journalier en FCFA (ex: 6 000 FCFA pour maçon, 3 000 FCFA pour manœuvre)
  phoneNumber?: string;
}

export type AttendanceStatus = "present" | "half_day" | "absent" | "overtime";

export interface AttendanceRecord {
  workerId: string;
  date: string;
  status: AttendanceStatus;
  overtimeHours?: number;
}

export interface PayrollSummary {
  workerId: string;
  workerName: string;
  roleLabel: string;
  daysPresent: number;
  halfDays: number;
  daysAbsent: number;
  overtimeHours: number;
  totalDue: number;
}

export const WORKER_ROLES: { value: Worker["role"]; label: string; defaultDailyRate: number }[] = [
  { value: "macon", label: "Maçon qualifié", defaultDailyRate: 6000 },
  { value: "manoeuvre", label: "Manœuvre / Aide-maçon", defaultDailyRate: 3500 },
  { value: "ferrailleur", label: "Ferrailleur", defaultDailyRate: 6500 },
  { value: "coffreur", label: "Coffreur / Boiseur", defaultDailyRate: 6000 },
  { value: "electricien", label: "Électricien BTP", defaultDailyRate: 7000 },
  { value: "plombier", label: "Plombier", defaultDailyRate: 7000 },
  { value: "peintre", label: "Peintre en bâtiment", defaultDailyRate: 5500 },
  { value: "menuisier", label: "Menuisier / Poseur", defaultDailyRate: 6000 },
  { value: "autre", label: "Autre corps d'état", defaultDailyRate: 4000 },
];

export function calculateWorkerPay(
  worker: Worker,
  attendances: AttendanceRecord[],
): PayrollSummary {
  let daysPresent = 0;
  let halfDays = 0;
  let daysAbsent = 0;
  let overtimeHours = 0;

  for (const att of attendances) {
    if (att.status === "present") {
      daysPresent += 1;
    } else if (att.status === "half_day") {
      halfDays += 1;
    } else if (att.status === "absent") {
      daysAbsent += 1;
    } else if (att.status === "overtime") {
      daysPresent += 1;
      overtimeHours += att.overtimeHours || 2;
    }
  }

  // Calcul du taux horaire indicatif (base journée de 8h)
  const hourlyRate = worker.dailyRate / 8;
  const overtimeBonus = overtimeHours * hourlyRate * 1.5; // majoration heures supp +50%

  const totalDue = Math.round(
    daysPresent * worker.dailyRate + halfDays * (worker.dailyRate * 0.5) + overtimeBonus,
  );

  return {
    workerId: worker.id,
    workerName: worker.name,
    roleLabel: worker.roleLabel,
    daysPresent,
    halfDays,
    daysAbsent,
    overtimeHours,
    totalDue,
  };
}

export function calculateTotalPayroll(
  workers: Worker[],
  attendances: AttendanceRecord[],
): {
  summaries: PayrollSummary[];
  totalGlobalDue: number;
} {
  const summaries = workers.map((w) => {
    const workerAtt = attendances.filter((a) => a.workerId === w.id);
    return calculateWorkerPay(w, workerAtt);
  });

  const totalGlobalDue = summaries.reduce((sum, s) => sum + s.totalDue, 0);

  return {
    summaries,
    totalGlobalDue,
  };
}
