import { fcfa, frDate, labelOf, PROJECT_STATUSES } from "@/lib/format";
import {
  fileStamp,
  pdfColors,
  pdfFooter,
  pdfHeader,
  pdfKpiRow,
  pdfSectionTitle,
  pdfTableTheme,
  slug,
} from "@/lib/pdf-theme";

export type ProjectSummaryData = {
  project: {
    name: string;
    city: string | null;
    commune: string | null;
    quartier: string | null;
    address: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    built_area: number | null;
    land_area: number | null;
    house_type: string | null;
  };
  spent: number;
  paid: number;
  spentByCategory: Array<{ name: string; spent: number }>;
  suppliersCount: number;
  companiesCount: number;
  expensesCount: number;
  paymentsCount: number;
  quotesCount: number;
};

export async function exportProjectSummaryPdf(data: ProjectSummaryData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const { project } = data;
  const budget = Number(project.budget ?? 0);
  const remaining = budget - data.spent;

  let y = pdfHeader(doc, {
    title: "Fiche récapitulative du chantier",
    subtitle: `Chantier : ${project.name}`,
    meta: `Statut : ${labelOf(PROJECT_STATUSES, project.status)} · Édité le ${frDate(new Date().toISOString())}`,
  });

  y = pdfKpiRow(doc, y, [
    { label: "Budget global", value: fcfa(budget) },
    { label: "Dépensé", value: fcfa(data.spent), tone: "amber" },
    {
      label: remaining >= 0 ? "Reste à dépenser" : "Dépassement",
      value: fcfa(Math.abs(remaining)),
      tone: remaining >= 0 ? "green" : "red",
    },
    { label: "Paiements enregistrés", value: fcfa(data.paid) },
  ]);

  y = pdfSectionTitle(doc, y, "Caractéristiques");

  const info: [string, string | number][] = [
    [
      "Localisation",
      [project.quartier, project.commune, project.city, project.address]
        .filter(Boolean)
        .join(", ") || "—",
    ],
    ["Statut", labelOf(PROJECT_STATUSES, project.status)],
    ["Début", project.start_date ? frDate(project.start_date) : "—"],
    ["Fin prévue", project.end_date ? frDate(project.end_date) : "—"],
    ["Terrain", project.land_area ? `${project.land_area} m²` : "—"],
    ["Surface construite", project.built_area ? `${project.built_area} m²` : "—"],
    ["Type de maison", project.house_type || "—"],
    ["Fournisseurs", data.suppliersCount],
    ["Entreprises", data.companiesCount],
    ["Dépenses", data.expensesCount],
    ["Devis", data.quotesCount],
  ];
  // Fiche en deux colonnes label/valeur pour un rendu compact.
  const infoBody = info.reduce<(string | object)[][]>((rows, [label, value], i) => {
    if (i % 2 === 0) rows.push([label, { content: value, styles: { fontStyle: "bold" } }]);
    else rows[rows.length - 1]?.push(label, { content: value, styles: { fontStyle: "bold" } });
    return rows;
  }, []);

  autoTable(doc, {
    startY: y,
    theme: "plain",
    ...pdfTableTheme,
    headStyles: { fillColor: pdfColors.softBg, textColor: pdfColors.ink },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
    body: infoBody,
    columnStyles: {
      0: { cellWidth: 100, textColor: pdfColors.muted },
      2: { cellWidth: 100, textColor: pdfColors.muted },
    },
  });

  y = pdfSectionTitle(
    doc,
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26,
    "Dépenses par poste",
  );

  const catBody: (string | number)[][] = data.spentByCategory
    .sort((a, b) => b.spent - a.spent)
    .map((c) => [c.name, fcfa(c.spent)]);

  autoTable(doc, {
    startY: y,
    head: [["Poste de dépense", { content: "Montant (FCFA)", styles: { halign: "right" } }]],
    body: catBody.length ? catBody : [["Aucune dépense enregistrée", ""]],
    foot: [["Total dépensé", fcfa(data.spent)]],
    theme: "grid",
    ...pdfTableTheme,
    columnStyles: { 1: { halign: "right" } },
  });

  pdfFooter(doc);
  doc.save(`recap-${slug(project.name)}-${fileStamp()}.pdf`);
}
