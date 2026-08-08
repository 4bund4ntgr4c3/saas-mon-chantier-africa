import { frDate } from "@/lib/format";

export type ReportData = {
  title: string;
  projectName: string;
  columns: string[];
  rows: (string | number)[][];
  total?: (string | number)[];
  /** Index des colonnes numériques alignées à droite dans le PDF. */
  rightAlign?: number[];
};

const fileStamp = () => new Date().toISOString().slice(0, 10);

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "rapport";

export async function exportReportPdf(data: ReportData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(data.title, 40, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Chantier : ${data.projectName}`, 40, 66);
  doc.text(`Édité le ${frDate(new Date().toISOString())}`, 40, 81);

  const columnStyles: Record<number, { halign: "right" }> = {};
  (data.rightAlign ?? []).forEach((i) => (columnStyles[i] = { halign: "right" }));

  autoTable(doc, {
    startY: 100,
    head: [
      data.columns.map((c, i) => ({
        content: c,
        styles: columnStyles[i] ?? {},
      })),
    ],
    body: data.rows,
    ...(data.total ? { foot: [data.total] } : {}),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [24, 24, 27], textColor: 255 },
    footStyles: { fillColor: [244, 244, 245], textColor: 20, fontStyle: "bold" },
    columnStyles,
  });

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
