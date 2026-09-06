/**
 * Module de génération de contrats de louage d'ouvrage et de procès-verbaux de réception BTP.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fcfa, frDate } from "./format";
import { PAGE_MARGIN, pdfColors, pdfFooter, pdfHeader, pdfTableTheme } from "./pdf-theme";

export type ContractType =
  "entreprise_forfait" | "pv_reception_provisoire" | "pv_reception_definitive";

/** Signature électronique apposée sur le document (pad + horodatage). */
export interface ESignature {
  name: string;
  signedAt: string; // ISO
  imageDataUrl?: string;
}

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
  /** Signatures électroniques + empreinte d'intégrité du document. */
  esign?: {
    client?: ESignature;
    contractor?: ESignature;
    fingerprint?: string;
  };
}

export function generateContractPdf(data: ContractData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  let title = "Contrat d'entreprise BTP à forfait";
  if (data.contractType === "pv_reception_provisoire") {
    title = "Procès-verbal de réception provisoire des travaux";
  } else if (data.contractType === "pv_reception_definitive") {
    title = "Procès-verbal de réception définitive & levée des réserves";
  }

  let y = pdfHeader(doc, {
    title,
    subtitle: `Projet : ${data.projectName} — ${data.projectLocation}`,
    meta: `Document contractuel conforme aux usages BTP UEMOA / Bénin · Date : ${frDate(data.startDate)}`,
  });

  // Parties prenantes
  autoTable(doc, {
    startY: y,
    head: [["MAÎTRE DE L'OUVRAGE (CLIENT)", "ENTREPRENEUR / ARTISAN"]],
    body: [
      [
        `Nom : ${data.clientName}\nAdresse : ${data.clientAddress ?? "Bénin / Diaspora"}\nProjet : ${data.projectName}\nLieu : ${data.projectLocation}`,
        `Nom : ${data.contractorName}\nCorps d'état : ${data.contractorTrade}\nTéléphone : ${data.contractorPhone}`,
      ],
    ],
    theme: "grid",
    ...pdfTableTheme,
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      lineColor: pdfColors.line,
      lineWidth: 0.5,
    },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  y += 18;

  // Clause financières / PV : en-tête ambre pour distinguer le cœur contractuel.
  const clauseHeadStyles = {
    fillColor: pdfColors.amberDeep,
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: "bold" as const,
  };

  if (data.contractType === "entreprise_forfait") {
    autoTable(doc, {
      startY: y,
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
      ...pdfTableTheme,
      headStyles: clauseHeadStyles,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
    });
  } else {
    // Procès verbal et réserves
    const reserves =
      data.reservesList && data.reservesList.length > 0
        ? data.reservesList.map((r, i) => `${i + 1}. ${r}`).join("\n")
        : "Aucune réserve constatée. Ouvrage conforme aux règles de l'art.";

    autoTable(doc, {
      startY: y,
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
      ...pdfTableTheme,
      headStyles: clauseHeadStyles,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
    });
  }

  // Signatures : deux parapheurs avec ligne de signature
  const tableAfter = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const signY = Math.max((tableAfter?.finalY ?? 150) + 40, 620);
  const signW = 210;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...pdfColors.ink);
  doc.text("Le Maître de l'Ouvrage", PAGE_MARGIN, signY);
  doc.text("L'Entrepreneur / L'Artisan", pageWidth - PAGE_MARGIN - signW, signY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...pdfColors.muted);
  doc.text(data.clientName, PAGE_MARGIN, signY + 12);
  doc.text(data.contractorName, pageWidth - PAGE_MARGIN - signW, signY + 12);

  doc.setDrawColor(...pdfColors.graphite);
  doc.setLineWidth(0.75);
  doc.line(PAGE_MARGIN, signY + 44, PAGE_MARGIN + signW, signY + 44);
  doc.line(pageWidth - PAGE_MARGIN - signW, signY + 44, pageWidth - PAGE_MARGIN, signY + 44);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text("(Signature précédée de la mention « Lu et approuvé »)", PAGE_MARGIN, signY + 56);
  doc.text(
    "(Signature précédée de la mention « Bon pour accord »)",
    pageWidth - PAGE_MARGIN - signW,
    signY + 56,
  );

  // Signatures électroniques : image du pad au-dessus de la ligne + horodatage.
  const esign = data.esign;
  const sigW = 130;
  const sigH = 43;
  if (esign?.client?.imageDataUrl) {
    doc.addImage(esign.client.imageDataUrl, "PNG", PAGE_MARGIN, signY + 44 - sigH, sigW, sigH);
  }
  if (esign?.contractor?.imageDataUrl) {
    doc.addImage(
      esign.contractor.imageDataUrl,
      "PNG",
      pageWidth - PAGE_MARGIN - sigW,
      signY + 44 - sigH,
      sigW,
      sigH,
    );
  }
  if (esign?.client || esign?.contractor) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...pdfColors.muted);
    let esignY = signY + 68;
    if (esign.client) {
      doc.text(
        `Signé électroniquement par ${esign.client.name} le ${frDateTimeLite(esign.client.signedAt)}`,
        PAGE_MARGIN,
        esignY,
      );
    }
    if (esign.contractor) {
      doc.text(
        `Signé électroniquement par ${esign.contractor.name} le ${frDateTimeLite(esign.contractor.signedAt)}`,
        pageWidth - PAGE_MARGIN - signW,
        esignY,
      );
    }
    if (esign.fingerprint) {
      esignY += 14;
      doc.setTextColor(...pdfColors.amberDeep);
      doc.text(
        `Empreinte d'intégrité du document : ${esign.fingerprint} — toute modification invalide la signature.`,
        PAGE_MARGIN,
        esignY,
        { maxWidth: pageWidth - 2 * PAGE_MARGIN },
      );
    }
  }

  pdfFooter(doc, "Document contractuel généré via BâtiBénin");

  return doc;
}

/** Date + heure compacte pour l'horodatage des signatures (fuseau non dépendant). */
function frDateTimeLite(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}h${pad(d.getMinutes())}`;
}
