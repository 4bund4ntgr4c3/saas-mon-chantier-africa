import { fcfa, frDate, labelOf, PROJECT_STATUSES } from "@/lib/format";

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

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "chantier";

export async function exportProjectSummaryPdf(data: ProjectSummaryData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const { project } = data;
  const budget = Number(project.budget ?? 0);
  const remaining = budget - data.spent;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Fiche récapitulative du chantier", 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Chantier : ${project.name}`, 40, 68);
  doc.text(`Édité le ${frDate(new Date().toISOString())}`, 40, 83);

  const infoBody: [string, string | number][] = [
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
    ["Budget global", fcfa(budget)],
    ["Dépensé", fcfa(data.spent)],
    ["Reste à dépenser", fcfa(remaining)],
    ["Paiements enregistrés", fcfa(data.paid)],
    ["Fournisseurs", data.suppliersCount],
    ["Entreprises", data.companiesCount],
    ["Dépenses", data.expensesCount],
    ["Devis", data.quotesCount],
  ];

  autoTable(doc, {
    startY: 100,
    theme: "plain",
    styles: { font: "helvetica", fontSize: 10 },
    body: infoBody.map(([label, value]) => [
      label,
      { content: value, styles: { fontStyle: "bold" } },
    ]),
    columnStyles: { 0: { cellWidth: 160, textColor: [100, 100, 100] } },
  });

  const catBody: (string | number)[][] = data.spentByCategory
    .sort((a, b) => b.spent - a.spent)
    .map((c) => [c.name, fcfa(c.spent)]);

  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24,
    head: [["Poste de dépense", { content: "Montant (FCFA)", styles: { halign: "right" } }]],
    body: catBody.length ? catBody : [["Aucune dépense enregistrée", ""]],
    foot: [["Total dépensé", fcfa(data.spent)]],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [24, 24, 27], textColor: 255 },
    footStyles: { fillColor: [244, 244, 245], textColor: 20, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
  });

  doc.save(`recap-${slug(project.name)}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
