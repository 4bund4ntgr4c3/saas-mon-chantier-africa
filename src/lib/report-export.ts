import { frDate } from "@/lib/format";
import { fileStamp, pdfFooter, pdfHeader, pdfTableTheme, slug } from "@/lib/pdf-theme";

export type ReportData = {
  title: string;
  projectName: string;
  columns: string[];
  rows: (string | number)[][];
  total?: (string | number)[];
  /** Index des colonnes numériques alignées à droite dans le PDF. */
  rightAlign?: number[];
};

export async function exportReportPdf(data: ReportData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const startY = pdfHeader(doc, {
    title: data.title,
    subtitle: `Chantier : ${data.projectName}`,
    meta: `Édité le ${frDate(new Date().toISOString())}`,
  });

  const columnStyles: Record<number, { halign: "right" }> = {};
  (data.rightAlign ?? []).forEach((i) => (columnStyles[i] = { halign: "right" }));

  autoTable(doc, {
    startY,
    head: [
      data.columns.map((c, i) => ({
        content: c,
        styles: columnStyles[i] ?? {},
      })),
    ],
    body: data.rows,
    ...(data.total ? { foot: [data.total] } : {}),
    theme: "grid",
    ...pdfTableTheme,
    columnStyles,
  });

  pdfFooter(doc);
  doc.save(`${slug(data.title)}-${slug(data.projectName)}-${fileStamp()}.pdf`);
}

export async function exportReportExcel(data: ReportData) {
  const XLSX = await import("xlsx");

  const sheet: (string | number | object)[][] = [
    [data.title],
    ["Chantier", data.projectName],
    ["Édité le", frDate(new Date().toISOString())],
    [],
    data.columns,
    ...data.rows,
  ];
  if (data.total) sheet.push(data.total);

  const ws = XLSX.utils.aoa_to_sheet(sheet);
  ws["!cols"] = data.columns.map((c) => ({ wch: Math.max(16, c.length + 4) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rapport");
  XLSX.writeFile(wb, `${slug(data.title)}-${slug(data.projectName)}-${fileStamp()}.xlsx`);
}
