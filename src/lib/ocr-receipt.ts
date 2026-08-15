/**
 * Module d'analyse intelligente de reçus, factures et tickets de quincaillerie.
 * Permet d'extraire automatiquement les informations clés (fournisseur, date, montants, articles).
 */

export interface ParsedReceiptItem {
  designation: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: "gros_oeuvre" | "second_oeuvre" | "finition" | "outillage" | "autre";
}

export interface ParsedReceipt {
  vendorName: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  items: ParsedReceiptItem[];
  confidence: number;
  rawText: string;
}

const COMMON_VENDORS = [
  "Quincaillerie",
  "Batimat",
  "Dépôt",
  "Ciment",
  "SOBEMAC",
  "Comptoir BTP",
  "Quincaillerie Générale",
  "Ets",
  "Matériaux",
];

const MATERIAL_KEYWORDS: {
  keyword: RegExp;
  label: string;
  category: ParsedReceiptItem["category"];
  defaultPrice: number;
}[] = [
  {
    keyword: /ciment|cpj\s*42\.5|cpj\s*32\.5|dangote|nocibe|lafarge/i,
    label: "Ciment 50kg CPJ 42.5",
    category: "gros_oeuvre",
    defaultPrice: 4200,
  },
  {
    keyword: /fer\s*(?:de\s*)?(?:ha\s*)?(?:6|8|10|12|14|16|fe\s*500)/i,
    label: "Fers à béton (barres 12m)",
    category: "gros_oeuvre",
    defaultPrice: 3800,
  },
  {
    keyword: /sable|voyage\s*sable|benne\s*sable/i,
    label: "Sable de lagune / carrière",
    category: "gros_oeuvre",
    defaultPrice: 35000,
  },
  {
    keyword: /gravier|concass[eé]|granit/i,
    label: "Gravier concassé 15/25",
    category: "gros_oeuvre",
    defaultPrice: 45000,
  },
  {
    keyword: /agglo|parpaing|brique/i,
    label: "Agglos creux 15x20x40",
    category: "gros_oeuvre",
    defaultPrice: 280,
  },
  {
    keyword: /peinture|acrylique|glyc[eé]ro/i,
    label: "Pot de peinture 25kg",
    category: "finition",
    defaultPrice: 22000,
  },
  {
    keyword: /tuyau|pvc|coude|manchon/i,
    label: "Tuyaux PVC assainissement",
    category: "second_oeuvre",
    defaultPrice: 2500,
  },
  {
    keyword: /fil\s*recuit|pointe|clou/i,
    label: "Pointes & fil de fer recuit",
    category: "outillage",
    defaultPrice: 1500,
  },
  {
    keyword: /t[oô]le|bac|toiture/i,
    label: "Tôles bac alu 0.35mm",
    category: "second_oeuvre",
    defaultPrice: 6500,
  },
];

/**
 * Analyse le texte brut d'un reçu/facture pour en extraire les entités financières et matérielles.
 */
export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Détection du fournisseur
  let vendorName = "Fournisseur BTP";
  for (const line of lines.slice(0, 5)) {
    if (
      COMMON_VENDORS.some((v) => line.toLowerCase().includes(v.toLowerCase())) ||
      /ets|sarl|sa|quincaillerie/i.test(line)
    ) {
      vendorName = line;
      break;
    }
  }

  // 2. Détection de la date (formats JJ/MM/AAAA, JJ-MM-AAAA, AAAA-MM-JJ)
  let date = new Date().toISOString().split("T")[0]!;
  const dateMatch = text.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (dateMatch) {
    const day = dateMatch[1]?.padStart(2, "0");
    const month = dateMatch[2]?.padStart(2, "0");
    let year = dateMatch[3];
    if (year && year.length === 2) year = `20${year}`;
    if (day && month && year) {
      date = `${year}-${month}-${day}`;
    }
  }

  // 3. Détection des montants et totaux (FCFA / XOF / F)
  let totalAmount = 0;
  const totalMatch = text.match(
    /(?:total|net\s*a\s*payer|montant|somme|ttc)\s*[:=]?\s*([\d\s.,]+)/i,
  );
  if (totalMatch && totalMatch[1]) {
    const rawVal = totalMatch[1].replace(/\s+/g, "").replace(",", ".");
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed > 0) {
      totalAmount = Math.round(parsed);
    }
  }

  // 4. Détection du moyen de paiement
  let paymentMethod = "especes";
  if (/momo|mtn|moov|mobile\s*money/i.test(text)) {
    paymentMethod = "mobile_money";
  } else if (/ch[eè]que/i.test(text)) {
    paymentMethod = "cheque";
  } else if (/virement/i.test(text)) {
    paymentMethod = "virement";
  }

  // 5. Détection des lignes d'articles
  const items: ParsedReceiptItem[] = [];
  for (const line of lines) {
    for (const mat of MATERIAL_KEYWORDS) {
      if (mat.keyword.test(line)) {
        // Chercher une quantité (ex: 50 sacs, 20 barres, x10, etc.)
        const qtyMatch = line.match(/(?:^|\s)(\d+)(?:\s*(?:sacs?|barres?|m3|t|voyages?|pcs?|x))?/i);
        const qty = qtyMatch && qtyMatch[1] ? parseInt(qtyMatch[1], 10) : 1;

        // Chercher un montant sur la ligne
        const priceMatch = line.match(/([\d\s]{3,})\s*(?:fcfa|f|cfa)?/i);
        let lineTotal = mat.defaultPrice * qty;
        if (priceMatch && priceMatch[1]) {
          const parsed = parseInt(priceMatch[1].replace(/\s+/g, ""), 10);
          if (!isNaN(parsed) && parsed > 500) {
            lineTotal = parsed;
          }
        }

        const unitPrice = Math.round(lineTotal / Math.max(1, qty));
        items.push({
          designation: mat.label,
          quantity: qty,
          unitPrice,
          totalPrice: lineTotal,
          category: mat.category,
        });
        break;
      }
    }
  }

  // Si aucun total global trouvé, sommer les articles
  if (totalAmount === 0 && items.length > 0) {
    totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0);
  }

  return {
    vendorName,
    date,
    totalAmount,
    paymentMethod,
    items,
    confidence: items.length > 0 ? 0.9 : totalAmount > 0 ? 0.7 : 0.5,
    rawText: text,
  };
}

/**
 * Simulation d'un scan OCR rapide d'une image de reçu/facture.
 */
export async function scanReceiptImage(file: File): Promise<ParsedReceipt> {
  // Simulation de délai réseau / OCR léger
  await new Promise((resolve) => setTimeout(resolve, 800));

  const fileName = file.name.toLowerCase();
  let mockText = `
ETS QUINCAILLERIE MODERNE DE COTONOU
Date: 12/08/2026 - Reçu N° 4082
----------------------------------------
50 sacs Ciment CPJ 42.5 Dangote : 210000 FCFA
10 barres Fer HA 12 Fe500 : 38000 FCFA
1 voyage Sable de lagune : 35000 FCFA
----------------------------------------
TOTAL GENERAL: 283000 FCFA
Règlement: Mobile Money MTN
Merci de votre confiance !
  `.trim();

  if (fileName.includes("sable") || fileName.includes("gravier")) {
    mockText = `
DEPOT DE MATERIAUX CALAVI
Date: 10/08/2026
2 voyages Gravier concassé 15/25 : 90000 FCFA
TOTAL: 90000 FCFA
Espèces
    `.trim();
  }

  return parseReceiptText(mockText);
}
