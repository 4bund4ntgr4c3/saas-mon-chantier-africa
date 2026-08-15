import { fcfa, frDate } from "@/lib/format";

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

  // Header stylisé
  doc.setFillColor(30, 64, 175); // Bleu pro
  doc.rect(0, 0, 595, 75, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("DOSSIER DE SUIVI DE CHANTIER", 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("BâtiBénin — Plateforme de gestion de construction", 40, 60);

  // Informations générales
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("1. Fiche d'identification du projet", 40, 105);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Projet : ${data.projectName}`, 40, 125);
  doc.text(`Localisation : ${data.location || "Bénin"}`, 40, 140);
  doc.text(`Maître d'ouvrage / Promoteur : ${data.clientName || "Non spécifié"}`, 40, 155);
  doc.text(`Date du rapport : ${frDate(new Date().toISOString())}`, 350, 125);
  doc.text(`Avancement global : ${data.progressPercent}%`, 350, 140);

  // Synthèse financière
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("2. Synthèse financière & budgétaire", 40, 185);

  autoTable(doc, {
    startY: 195,
    head: [["Indicateur financier", "Montant (FCFA)", "Commentaire"]],
    body: [
      ["Budget prévisionnel total", fcfa(data.totalBudget), "Enveloppe initiale"],
      ["Dépenses réelles engagées", fcfa(data.totalSpent), `${budgetRatio}% du budget total`],
      [
        "Solde / Restant disponible",
        fcfa(remaining),
        remaining >= 0 ? "Budget sous contrôle" : "Dépassement",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
    styles: { font: "helvetica", fontSize: 9 },
  });

  // Phases & Jalons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 280;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("3. État des phases et corps d'état", 40, finalY + 25);

  const phaseRows = data.phases.map((p) => [
    p.name,
    p.status === "done" ? "Terminé" : p.status === "in_progress" ? "En cours" : "À venir",
    fcfa(p.budget),
    fcfa(p.spent),
    p.budget > 0 ? `${Math.round((p.spent / p.budget) * 100)}%` : "-",
  ]);

  autoTable(doc, {
    startY: finalY + 35,
    head: [["Phase / Corps d'état", "Statut", "Prévu", "Réalisé", "Consommation"]],
    body:
      phaseRows.length > 0
        ? phaseRows
        : [
            [
              "Gros œuvre & Second œuvre",
              "En cours",
              fcfa(data.totalBudget),
              fcfa(data.totalSpent),
              `${budgetRatio}%`,
            ],
          ],
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
    styles: { font: "helvetica", fontSize: 9 },
  });

  // Note de bas de page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerY = (doc as any).lastAutoTable?.finalY ?? 400;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Document généré automatiquement via BâtiBénin. Fait foi pour déblocage bancaire ou compte-rendu diaspora.`,
    40,
    footerY + 30,
  );

  doc.save(
    `Dossier-Chantier-${data.projectName.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
