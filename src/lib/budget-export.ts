import { fcfa, frDate } from "@/lib/format";

export type BudgetExportRow = {
  phase: string;
  category: string;
  planned: number;
  spent: number;
};

export type BudgetExportData = {
  projectName: string;
  projectBudget: number;
  rows: BudgetExportRow[];
  unassigned: number;
};

const fileStamp = () => new Date().toISOString().slice(0, 10);

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "chantier";

function totals(data: BudgetExportData) {
  const planned = data.rows.reduce((s, r) => s + r.planned, 0);
  const spent = data.rows.reduce((s, r) => s + r.spent, 0) + data.unassigned;
  return { planned, spent, ecart: planned - spent };
}

/** Only categories with a plan or actual spending are worth reporting. */
export function activeRows(data: BudgetExportData) {
  return data.rows.filter((r) => r.planned > 0 || r.spent > 0);
}

export async function exportBudgetPdf(data: BudgetExportData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const t = totals(data);
  const rows = activeRows(data);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Rapport budgétaire — prévu vs réalisé", 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Chantier : ${data.projectName}`, 40, 68);
  doc.text(`Édité le ${frDate(new Date().toISOString())}`, 40, 83);

  autoTable(doc, {
    startY: 100,
    theme: "plain",
    styles: { font: "helvetica", fontSize: 10 },
    body: [
      ["Enveloppe du projet", fcfa(data.projectBudget)],
      ["Budget planifié par poste", fcfa(t.planned)],
      ["Dépenses réelles", fcfa(t.spent)],
      [t.ecart < 0 ? "Dépassement" : "Reste à dépenser", fcfa(Math.abs(t.ecart))],
    ],
    columnStyles: { 0: { cellWidth: 220 }, 1: { fontStyle: "bold" } },
  });

  let phase = "";
  const body: (string | number)[][] = [];
  for (const r of rows) {
    if (r.phase !== phase) {
      phase = r.phase;
      body.push([{ content: phase.toUpperCase(), colSpan: 5, styles: { fontStyle: "bold" } } as never]);
    }
    const ecart = r.planned - r.spent;
    body.push([
      r.category,
      fcfa(r.planned),
      fcfa(r.spent),
      fcfa(ecart),
      r.planned > 0 ? `${Math.round((r.spent / r.planned) * 100)} %` : "—",
    ]);
  }
  if (data.unassigned > 0) {
    body.push([
      "Dépenses sans poste",
      fcfa(0),
      fcfa(data.unassigned),
      fcfa(-data.unassigned),
      "—",
    ]);
  }

  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24,
    head: [
      [
        "Poste",
        { content: "Prévu", styles: { halign: "right" } },
        { content: "Réalisé", styles: { halign: "right" } },
        { content: "Écart", styles: { halign: "right" } },
        { content: "Consommé", styles: { halign: "right" } },
      ],
    ],
    body: body.length ? body : [["Aucune donnée budgétaire", "", "", "", ""]],
    foot: [["Total", fcfa(t.planned), fcfa(t.spent), fcfa(t.ecart), ""]],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [24, 24, 27], textColor: 255 },
    footStyles: { fillColor: [244, 244, 245], textColor: 20, fontStyle: "bold" },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  doc.save(`budget-${slug(data.projectName)}-${fileStamp()}.pdf`);
}

export async function exportBudgetExcel(data: BudgetExportData) {
  const XLSX = await import("xlsx");
  const t = totals(data);
  const rows = activeRows(data);

  const sheet: (string | number)[][] = [
    ["Rapport budgétaire — prévu vs réalisé"],
    ["Chantier", data.projectName],
    ["Édité le", frDate(new Date().toISOString())],
    [],
    ["Enveloppe du projet (FCFA)", data.projectBudget],
    ["Budget planifié par poste (FCFA)", t.planned],
    ["Dépenses réelles (FCFA)", t.spent],
    [t.ecart < 0 ? "Dépassement (FCFA)" : "Reste à dépenser (FCFA)", Math.abs(t.ecart)],
    [],
    ["Phase", "Poste", "Prévu (FCFA)", "Réalisé (FCFA)", "Écart (FCFA)", "Consommé (%)"],
  ];

  for (const r of rows) {
    sheet.push([
      r.phase,
      r.category,
      r.planned,
      r.spent,
      r.planned - r.spent,
      r.planned > 0 ? Math.round((r.spent / r.planned) * 100) : 0,
    ]);
  }
  if (data.unassigned > 0) {
    sheet.push(["Divers", "Dépenses sans poste", 0, data.unassigned, -data.unassigned, 0]);
  }
  sheet.push(["", "Total", t.planned, t.spent, t.ecart, ""]);

  const ws = XLSX.utils.aoa_to_sheet(sheet);
  ws["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Budget");
  XLSX.writeFile(wb, `budget-${slug(data.projectName)}-${fileStamp()}.xlsx`);
}
