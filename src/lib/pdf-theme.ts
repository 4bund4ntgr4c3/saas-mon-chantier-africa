/**
 * Thème PDF partagé — identité visuelle BâtiBénin pour tous les exports jsPDF.
 * Bandeau graphite + accent ambre (couleur de marque), cartes KPI,
 * titres de section et pied de page paginé sur toutes les pages.
 * Unité : points (pt), format A4 (595 × 842).
 */
import type { jsPDF } from "jspdf";
import type { UserOptions } from "jspdf-autotable";

export const PAGE_MARGIN = 40;

/** Palette dérivée du design system (src/styles.css), en tuples RGB pour jsPDF. */
export const pdfColors = {
  ink: [24, 24, 27] as [number, number, number], // zinc-900 — titres
  graphite: [63, 63, 70] as [number, number, number], // zinc-700 — texte courant
  muted: [113, 113, 122] as [number, number, number], // zinc-500 — libellés
  line: [228, 228, 231] as [number, number, number], // zinc-200 — bordures
  softBg: [244, 244, 245] as [number, number, number], // zinc-100 — fonds KPI / bandes
  banner: [24, 24, 27] as [number, number, number], // bandeau d'en-tête
  bannerMuted: [161, 161, 170] as [number, number, number], // zinc-400 sur bandeau
  amber: [217, 119, 6] as [number, number, number], // amber-600 — accent marque
  amberDeep: [146, 64, 14] as [number, number, number], // amber-800
  amberSoft: [254, 243, 199] as [number, number, number], // amber-100 — totaux
  green: [21, 128, 61] as [number, number, number], // green-700
  red: [185, 28, 28] as [number, number, number], // red-700
};

export const BRAND = "BâtiBénin";
const FOOTER_BRAND = "Plateforme de gestion de chantier";

/**
 * Bandeau d'en-tête pleine largeur : marque ambre, titre blanc, sous-titre,
 * barre d'accent ambre, puis ligne de méta sous le bandeau.
 * Retourne l'ordonnée de départ du contenu.
 */
export function pdfHeader(
  doc: jsPDF,
  opts: { title: string; subtitle?: string; meta?: string },
): number {
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(...pdfColors.banner);
  doc.rect(0, 0, W, 94, "F");
  doc.setFillColor(...pdfColors.amber);
  doc.rect(0, 94, W, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...pdfColors.amber);
  doc.text("BÂTIBÉNIN", PAGE_MARGIN, 28, { charSpace: 2 });

  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(opts.title.toUpperCase(), PAGE_MARGIN, 54);

  if (opts.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...pdfColors.bannerMuted);
    doc.text(opts.subtitle, PAGE_MARGIN, 72);
  }

  let y = 122;
  if (opts.meta) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...pdfColors.muted);
    doc.text(opts.meta, PAGE_MARGIN, y);
    y += 16;
  }
  return y + 4;
}

/** Titre de section avec barre d'accent ambre. Retourne l'ordonnée suivante. */
export function pdfSectionTitle(doc: jsPDF, y: number, text: string): number {
  doc.setFillColor(...pdfColors.amber);
  doc.rect(PAGE_MARGIN, y - 10, 3, 13, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...pdfColors.ink);
  doc.text(text, PAGE_MARGIN + 9, y);
  return y + 20;
}

export type KpiTone = "ink" | "amber" | "green" | "red";

const kpiTones: Record<KpiTone, [number, number, number]> = {
  ink: pdfColors.ink,
  amber: pdfColors.amberDeep,
  green: pdfColors.green,
  red: pdfColors.red,
};

/**
 * Rangée de cartes KPI (fond zinc clair, bordure fine, libellé majuscules,
 * valeur large colorée selon le ton). Retourne l'ordonnée suivante.
 */
export function pdfKpiRow(
  doc: jsPDF,
  y: number,
  items: { label: string; value: string; tone?: KpiTone }[],
): number {
  const W = doc.internal.pageSize.getWidth();
  const gap = 8;
  const cardW = (W - PAGE_MARGIN * 2 - gap * (items.length - 1)) / items.length;
  const cardH = 54;

  items.forEach((item, i) => {
    const x = PAGE_MARGIN + i * (cardW + gap);
    doc.setFillColor(...pdfColors.softBg);
    doc.setDrawColor(...pdfColors.line);
    doc.setLineWidth(0.75);
    doc.rect(x, y, cardW, cardH, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...pdfColors.muted);
    doc.text(item.label.toUpperCase(), x + 10, y + 17, { charSpace: 0.5 });

    doc.setFontSize(12.5);
    doc.setTextColor(...kpiTones[item.tone ?? "ink"]);
    doc.text(item.value, x + 10, y + 39);
  });

  return y + cardH + 22;
}

/** Base de styles autoTable à étaler dans chaque tableau : réserve la place du pied de page. */
export const pdfTableTheme: UserOptions = {
  margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 56 },
  styles: {
    font: "helvetica",
    fontSize: 9,
    cellPadding: 5,
    textColor: pdfColors.graphite,
    lineColor: pdfColors.line,
    lineWidth: 0.5,
  },
  headStyles: {
    fillColor: pdfColors.banner,
    textColor: [255, 255, 255],
    fontStyle: "bold",
    fontSize: 8.5,
  },
  footStyles: {
    fillColor: pdfColors.amberSoft,
    textColor: pdfColors.amberDeep,
    fontStyle: "bold",
  },
  alternateRowStyles: { fillColor: [250, 250, 251] },
};

/** Pied de page posé sur toutes les pages : marque + note à gauche, pagination à droite. */
export function pdfFooter(doc: jsPDF, note?: string): void {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...pdfColors.line);
    doc.setLineWidth(0.5);
    doc.line(PAGE_MARGIN, H - 36, W - PAGE_MARGIN, H - 36);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...pdfColors.amberDeep);
    doc.text(BRAND, PAGE_MARGIN, H - 24);
    const brandW = doc.getTextWidth(BRAND);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...pdfColors.muted);
    doc.text(`  ·  ${note ?? FOOTER_BRAND}`, PAGE_MARGIN + brandW, H - 24);

    doc.text(`Page ${i} / ${pages}`, W - PAGE_MARGIN, H - 24, { align: "right" });
  }
}

/** Normalise une chaîne pour un nom de fichier. */
export const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export const fileStamp = () => new Date().toISOString().slice(0, 10);
