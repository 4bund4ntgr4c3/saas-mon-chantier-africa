import { fcfa, frDate } from "@/lib/format";
import {
  BRAND,
  PAGE_MARGIN,
  fileStamp,
  pdfColors,
  pdfFooter,
  pdfHeader,
  pdfKpiRow,
  pdfSectionTitle,
  pdfTableTheme,
  slug,
} from "@/lib/pdf-theme";

export interface DossierChantierData {
  projectName: string;
  location: string;
  clientName: string;
  totalBudget: number;
  totalSpent: number;
  progressPercent: number;
  phases: {
    name: string;
    status: "done" | "in_progress" | "pending";
    budget: number;
    spent: number;
  }[];
  recentPhotosCount: number;
  summaryNotes: string;
}

export async function exportDossierChantierPdf(data: DossierChantierData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const remaining = data.totalBudget - data.totalSpent;
  const budgetRatio =
    data.totalBudget > 0 ? Math.round((data.totalSpent / data.totalBudget) * 100) : 0;

  let y = pdfHeader(doc, {
    title: "Dossier de suivi de chantier",
    subtitle: `${data.projectName} — ${data.location || "Bénin"}`,
    meta: `Maître d'ouvrage : ${data.clientName || "Non spécifié"} · Avancement global : ${data.progressPercent} % · Édité le ${frDate(new Date().toISOString())}`,
  });

  y = pdfKpiRow(doc, y, [
    { label: "Budget prévisionnel", value: fcfa(data.totalBudget) },
    { label: "Engagé", value: `${fcfa(data.totalSpent)} (${budgetRatio} %)`, tone: "amber" },
    {
      label: remaining >= 0 ? "Restant disponible" : "Dépassement",
      value: fcfa(Math.abs(remaining)),
      tone: remaining >= 0 ? "green" : "red",
    },
    { label: "Avancement global", value: `${data.progressPercent} %` },
  ]);

  // 1. Fiche d'identification
  y = pdfSectionTitle(doc, y, "1. Fiche d'identification du projet");
  autoTable(doc, {
    startY: y,
    theme: "plain",
    ...pdfTableTheme,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 3.5 },
    body: [
      [
        "Projet",
        { content: data.projectName, styles: { fontStyle: "bold" } },
        "Date du rapport",
        { content: frDate(new Date().toISOString()), styles: { fontStyle: "bold" } },
      ],
      [
        "Localisation",
        { content: data.location || "Bénin", styles: { fontStyle: "bold" } },
        "Photos documentées",
        { content: String(data.recentPhotosCount), styles: { fontStyle: "bold" } },
      ],
      [
        "Maître d'ouvrage",
        { content: data.clientName || "Non spécifié", styles: { fontStyle: "bold" } },
        "Avancement",
        { content: `${data.progressPercent} %`, styles: { fontStyle: "bold" } },
      ],
    ],
    columnStyles: {
      0: { cellWidth: 105, textColor: pdfColors.muted },
      2: { cellWidth: 105, textColor: pdfColors.muted },
    },
  });

  // 2. Synthèse financière
  y = pdfSectionTitle(
    doc,
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20,
    "2. Synthèse financière & budgétaire",
  );
  autoTable(doc, {
    startY: y,
    head: [
      [
        "Indicateur financier",
        { content: "Montant (FCFA)", styles: { halign: "right" } },
        "Commentaire",
      ],
    ],
    body: [
      ["Budget prévisionnel total", fcfa(data.totalBudget), "Enveloppe initiale"],
      ["Dépenses réelles engagées", fcfa(data.totalSpent), `${budgetRatio}% du budget total`],
      [
        "Solde / Restant disponible",
        {
          content: fcfa(remaining),
          styles: { textColor: remaining >= 0 ? pdfColors.green : pdfColors.red },
        },
        remaining >= 0 ? "Budget sous contrôle" : "Dépassement",
      ],
    ],
    theme: "striped",
    ...pdfTableTheme,
    columnStyles: { 1: { halign: "right" } },
  });

  // 3. Phases & corps d'état avec statuts colorés
  y = pdfSectionTitle(
    doc,
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26,
    "3. État des phases et corps d'état",
  );

  const statusStyles = {
    done: { text: "Terminé", color: pdfColors.green },
    in_progress: { text: "En cours", color: pdfColors.amberDeep },
    pending: { text: "À venir", color: pdfColors.muted },
  } as const;

  const phaseRows = data.phases.map((p) => [
    p.name,
    {
      content: statusStyles[p.status].text,
      styles: {
        textColor: statusStyles[p.status].color,
        fontStyle: "bold" as const,
      },
    },
    fcfa(p.budget),
    fcfa(p.spent),
    p.budget > 0 ? `${Math.round((p.spent / p.budget) * 100)}%` : "-",
  ]);

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Phase / Corps d'état",
        "Statut",
        { content: "Prévu", styles: { halign: "right" } },
        { content: "Réalisé", styles: { halign: "right" } },
        { content: "Consommation", styles: { halign: "right" } },
      ],
    ],
    body:
      phaseRows.length > 0
        ? phaseRows
        : [
            [
              "Gros œuvre & Second œuvre",
              {
                content: statusStyles.in_progress.text,
                styles: {
                  textColor: statusStyles.in_progress.color,
                  fontStyle: "bold" as const,
                },
              },
              fcfa(data.totalBudget),
              fcfa(data.totalSpent),
              `${budgetRatio}%`,
            ],
          ],
    theme: "grid",
    ...pdfTableTheme,
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  // 4. Notes de synthèse dans un encadré
  const notesY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  y = pdfSectionTitle(doc, notesY, "4. Notes de synthèse");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...pdfColors.graphite);
  const notes = doc.splitTextToSize(data.summaryNotes || "Aucune note de synthèse.", 515);
  const notesH = notes.length * 12 + 16;
  doc.setFillColor(...pdfColors.softBg);
  doc.setDrawColor(...pdfColors.line);
  doc.setLineWidth(0.75);
  doc.rect(PAGE_MARGIN, y, 515, notesH, "FD");
  doc.text(notes, PAGE_MARGIN + 10, y + 18);

  pdfFooter(
    doc,
    `Dossier généré via ${BRAND} — fait foi pour déblocage bancaire ou compte-rendu diaspora`,
  );
  doc.save(`dossier-chantier-${slug(data.projectName)}-${fileStamp()}.pdf`);
}
