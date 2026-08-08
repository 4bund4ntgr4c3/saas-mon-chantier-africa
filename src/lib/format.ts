export const XOF = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

export function fcfa(value: number | null | undefined) {
  return XOF.format(Number(value ?? 0)).replace("XOF", "FCFA");
}

export function compactFcfa(value: number | null | undefined) {
  const n = Number(value ?? 0);
  if (Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (Math.abs(n) >= 1_000)
    return `${(n / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} k`;
  return n.toLocaleString("fr-FR");
}

export function num(value: number | null | undefined, digits = 0) {
  return Number(value ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: digits });
}

export function frDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function monthKey(value: string) {
  return value.slice(0, 7);
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

export const PAYMENT_METHODS = [
  { value: "especes", label: "Espèces" },
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "moov_money", label: "Moov Money" },
  { value: "virement", label: "Virement bancaire" },
  { value: "cheque", label: "Chèque" },
] as const;

export const PAYMENT_TYPES = [
  { value: "comptant", label: "Comptant" },
  { value: "acompte", label: "Acompte" },
  { value: "partiel", label: "Paiement partiel" },
  { value: "solde", label: "Solde" },
] as const;

export const QUOTE_STATUSES = [
  { value: "en_attente", label: "En attente" },
  { value: "accepte", label: "Accepté" },
  { value: "rejete", label: "Rejeté" },
  { value: "converti", label: "Converti en commande" },
] as const;

export const PROJECT_STATUSES = [
  { value: "planifie", label: "Planifié" },
  { value: "en_cours", label: "En cours" },
  { value: "suspendu", label: "Suspendu" },
  { value: "termine", label: "Terminé" },
] as const;

export const DOCUMENT_CATEGORIES = [
  { value: "plan", label: "Plans" },
  { value: "permis_construire", label: "Permis de construire" },
  { value: "acte_vente", label: "Acte de vente" },
  { value: "facture", label: "Factures" },
  { value: "contrat", label: "Contrats" },
  { value: "garantie", label: "Garanties" },
  { value: "photo_chantier", label: "Photos du chantier" },
  { value: "autre", label: "Autres" },
] as const;

export function formatBytes(bytes: number | null | undefined) {
  const n = Number(bytes ?? 0);
  if (n <= 0) return "—";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

export function labelOf(
  list: readonly { value: string; label: string }[],
  value: string | null | undefined,
) {
  return list.find((i) => i.value === value)?.label ?? "—";
}
