import { fcfa, frDate } from "@/lib/format";
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

  let y = pdfHeader(doc, {
    title: "Rapport budgétaire",
    subtitle: `Prévu vs réalisé — Chantier : ${data.projectName}`,
    meta: `Édité le ${frDate(new Date().toISOString())}`,
  });

  y = pdfKpiRow(doc, y, [
    { label: "Enveloppe du projet", value: fcfa(data.projectBudget) },
    { label: "Budget planifié par poste", value: fcfa(t.planned) },
    { label: "Dépenses réelles", value: fcfa(t.spent), tone: "amber" },
    {
      label: t.ecart < 0 ? "Dépassement" : "Reste à dépenser",
      value: fcfa(Math.abs(t.ecart)),
      tone: t.ecart < 0 ? "red" : "green",
    },
  ]);

  y = pdfSectionTitle(doc, y, "Détail par phase et par poste");

  let phase = "";
  const body: (string | number | object)[][] = [];
  for (const r of rows) {
    if (r.phase !== phase) {
      phase = r.phase;
      body.push([
        {
          content: phase.toUpperCase(),
          colSpan: 5,
          styles: {
            fontStyle: "bold",
            textColor: pdfColors.ink,
            fillColor: pdfColors.softBg,
          },
        } as never,
      ]);
    }
    const ecart = r.planned - r.spent;
    body.push([
      r.category,
      fcfa(r.planned),
      fcfa(r.spent),
      {
        content: fcfa(ecart),
        styles: { textColor: ecart < 0 ? pdfColors.red : pdfColors.graphite },
      },
      r.planned > 0 ? `${Math.round((r.spent / r.planned) * 100)} %` : "—",
    ]);
  }
  if (data.unassigned > 0) {
    body.push([
      "Dépenses sans poste",
      fcfa(0),
      fcfa(data.unassigned),
      {
        content: fcfa(-data.unassigned),
        styles: { textColor: pdfColors.red },
      },
      "—",
    ]);
  }

  autoTable(doc, {
    startY: y,
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
    ...pdfTableTheme,
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  pdfFooter(doc);
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
