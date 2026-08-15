/**
 * Module de facturation normalisée et conformité fiscale e-MECeF (Direction Générale des Impôts - Bénin).
 */

export type EmecefInvoiceType = "FV" | "FA" | "EV"; // Facture Vente, Facture Avoir, Facture Acompte
export type TaxGroup = "A" | "B"; // A: Exonéré (0%), B: Taxable standard (18%)
export type AibRate = 0 | 0.01 | 0.05; // 0%, 1% (immatriculé), 5% (non immatriculé)

export interface EmecefInvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPriceHt: number;
  taxGroup: TaxGroup;
}

export interface EmecefInvoiceData {
  invoiceNumber: string;
  invoiceType: EmecefInvoiceType;
  ifuSeller: string;
  sellerName: string;
  ifuBuyer?: string | null;
  buyerName: string;
  nimMachine: string; // Numéro d'Identification de la Machine
  items: EmecefInvoiceItem[];
  aibRate: AibRate;
  date: string;
}

export interface EmecefInvoiceCalculation {
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  totalAib: number;
  netToPay: number;
  securityCodeMceF: string;
  qrCodeUrl: string;
}

export function calculateEmecefInvoice(data: EmecefInvoiceData): EmecefInvoiceCalculation {
  let totalHt = 0;
  let totalTva = 0;

  for (const item of data.items) {
    const ht = Math.max(0, item.quantity) * Math.max(0, item.unitPriceHt);
    totalHt += ht;
    if (item.taxGroup === "B") {
      totalTva += ht * 0.18;
    }
  }

  totalHt = Math.round(totalHt);
  totalTva = Math.round(totalTva);
  const totalTtc = totalHt + totalTva;
  const totalAib = Math.round(totalHt * data.aibRate);
  const netToPay = totalTtc + totalAib;

  // Code de sécurité normalisé simulant la signature cryptographique du serveur e-MECeF DGI
  const safeHash = Math.abs(
    (data.ifuSeller + data.invoiceNumber + totalTtc)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0) * 31, 0),
  )
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");

  const securityCodeMceF = `MCEF-${data.nimMachine.slice(-4) || "DGI1"}-${safeHash}-${data.invoiceType}`;

  // URL normalisée de vérification publique sur la plateforme DGI
  const qrCodeUrl = `https://emcefv2.impots.bj/verify?nim=${encodeURIComponent(data.nimMachine)}&code=${encodeURIComponent(securityCodeMceF)}&ttc=${totalTtc}`;

  return {
    totalHt,
    totalTva,
    totalTtc,
    totalAib,
    netToPay,
    securityCodeMceF,
    qrCodeUrl,
  };
}
