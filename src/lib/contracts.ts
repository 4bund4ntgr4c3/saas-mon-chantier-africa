/**
 * Module de génération de contrats de louage d'ouvrage et de procès-verbaux de réception BTP.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fcfa, frDate } from "./format";

export type ContractType =
  "entreprise_forfait" | "pv_reception_provisoire" | "pv_reception_definitive";

export interface ContractData {
  contractType: ContractType;
  projectName: string;
  projectLocation: string;
  clientName: string;
  clientAddress?: string | null;
  contractorName: string;
  contractorTrade: string; // Ex: Maçonnerie, Électricité, Gros œuvre
  contractorPhone: string;
  totalAmountFcfa: number;
  advancePaymentFcfa: number;
  durationWeeks: number;
  penaltyPerDayFcfa: number;
  guaranteeRetentionRate: number; // 0.05 = 5%
  startDate: string;
  reservesList?: string[];
}

export function generateContractPdf(data: ContractData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // En-tête
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 83, 45); // Vert BTP

  let title = "CONTRAT D'ENTREPRISE BTP À FORFAIT";
  if (data.contractType === "pv_reception_provisoire") {
    title = "PROCÈS-VERBAL DE RÉCEPTION PROVISOIRE DES TRAVAUX";
  } else if (data.contractType === "pv_reception_definitive") {
    title = "PROCÈS-VERBAL DE RÉCEPTION DÉFINITIVE & LEVÉE DES RÉSERVES";
  }

  doc.text(title, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Document contractuel conforme aux usages BTP UEMOA / Bénin — Date : ${frDate(data.startDate)}`,
    pageWidth / 2,
    27,
    { align: "center" },
  );

  // Parties prenantes
  autoTable(doc, {
    startY: 35,
    head: [["MAÎTRE DE L'OUVRAGE (CLIENT)", "ENTREPRENEUR / ARTISAN"]],
    body: [
      [
        `Nom : ${data.clientName}\nAdresse : ${data.clientAddress ?? "Bénin / Diaspora"}\nProjet : ${data.projectName}\nLieu : ${data.projectLocation}`,
        `Nom : ${data.contractorName}\nCorps d'état : ${data.contractorTrade}\nTéléphone : ${data.contractorPhone}`,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    styles: { fontSize: 9 },
  });

  const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const currentY = (lastAutoTable?.finalY ?? 60) + 10;

  if (data.contractType === "entreprise_forfait") {
    // Clauses financières et délais
    autoTable(doc, {
      startY: currentY,
      head: [["CLAUSES CONTRACTUELLES", "VALEUR & MODALITÉS"]],
      body: [
        ["Montant total forfaitaire des travaux", fcfa(data.totalAmountFcfa)],
        [
          "Acompte de démarrage des travaux",
          `${fcfa(data.advancePaymentFcfa)} (${Math.round((data.advancePaymentFcfa / (data.totalAmountFcfa || 1)) * 100)}%)`,
        ],
        [
          "Durée prévisionnelle d'exécution",
          `${data.durationWeeks} semaines à compter du versement de l'acompte`,
        ],
        [
          "Pénalités de retard journalières",
          `${fcfa(data.penaltyPerDayFcfa)} par jour calendaire de retard`,
        ],
        [
          "Retenue de garantie de parfait achèvement",
          `${Math.round(data.guaranteeRetentionRate * 100)}% (${fcfa(data.totalAmountFcfa * data.guaranteeRetentionRate)})`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [20, 83, 45] },
      styles: { fontSize: 9 },
    });
  } else {
    // Procès verbal et réserves
    const reserves =
      data.reservesList && data.reservesList.length > 0
        ? data.reservesList.map((r, i) => `${i + 1}. ${r}`).join("\n")
        : "Aucune réserve constatée. Ouvrage conforme aux règles de l'art.";

    autoTable(doc, {
      startY: currentY,
      head: [["CONSTATATIONS & RÉSERVES", "DÉTAILS"]],
      body: [
        [
          "Nature de la réception",
          data.contractType === "pv_reception_provisoire"
            ? "Provisoire avec réserves éventuelles"
            : "Définitive — Libération de la retenue de garantie",
        ],
        ["Liste des réserves à lever", reserves],
        [
          "Date limite de levée des réserves",
          `${data.durationWeeks} jours à compter de la présente signature`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [20, 83, 45] },
      styles: { fontSize: 9 },
    });
  }

  // Signatures
  const tableAfter = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const signY = Math.min(250, (tableAfter?.finalY ?? 150) + 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);

  doc.text("Le Maître de l'Ouvrage", 30, signY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("(Signature précédée de la mention 'Lu et approuvé')", 30, signY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("L'Entrepreneur / L'Artisan", pageWidth - 80, signY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("(Signature précédée de la mention 'Bon pour accord')", pageWidth - 80, signY + 6);

  return doc;
}
