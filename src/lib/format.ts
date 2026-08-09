/** Résout la devise locale depuis la préférence pays (localStorage). */
export function currencyConfig() {
  const fallback = { symbol: "FCFA", code: "XOF" };
  if (typeof window === "undefined") return fallback;
  try {
    const country = localStorage.getItem("batibenin.country") ?? "bj";
    if (country === "cd") return { symbol: "FC", code: "CDF" };
    if (country === "cg") return { symbol: "FCFA", code: "XAF" };
    return fallback;
  } catch {
    return fallback;
  }
}

export function fcfa(value: number | null | undefined) {
  const { symbol, code } = currencyConfig();
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  })
    .format(Number(value ?? 0))
    .replace(code, symbol);
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

export function frDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  { value: "a_la_livraison", label: "À la livraison" },
] as const;

export const PAYMENT_PROVIDERS = [
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "moov_money", label: "Moov Money" },
  { value: "paydunya", label: "PayDunya" },
  { value: "bankly", label: "Bankly" },
  { value: "cmi", label: "CMI" },
  { value: "paystack", label: "Paystack" },
] as const;

export const PAYMENT_TRANSACTION_STATUSES = [
  { value: "initiee", label: "Initiée" },
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "Confirmée" },
  { value: "echouee", label: "Échouée" },
  { value: "annulee", label: "Annulée" },
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

export const QUOTE_REQUEST_STATUSES = [
  { value: "ouverte", label: "Ouverte" },
  { value: "attribuee", label: "Attribuée" },
  { value: "cloturee", label: "Clôturée" },
] as const;

export const QUOTE_BID_STATUSES = [
  { value: "soumise", label: "Soumise" },
  { value: "acceptee", label: "Acceptée" },
] as const;

export const DISPUTE_STATUSES = [
  { value: "ouverte", label: "Ouvert" },
  { value: "en_examen", label: "En examen" },
  { value: "decide", label: "Décision rendue" },
  { value: "cloture", label: "Clôturé" },
] as const;

export const DISPUTE_DECISIONS = [
  { value: "favorable_demandeur", label: "Favorable au demandeur" },
  { value: "favorable_defendeur", label: "Favorable au défendeur" },
  { value: "partiel", label: "Partiellement favorable" },
] as const;

export const DISPUTE_TYPES = [
  { value: "commande", label: "Commande / livraison" },
  { value: "devis", label: "Devis / prestation" },
  { value: "paiement", label: "Paiement" },
  { value: "livraison", label: "Livraison / transport" },
  { value: "facturation", label: "Facturation" },
  { value: "autre", label: "Autre litige" },
] as const;

export const REFUND_METHODS = [
  { value: "mobile_money", label: "Mobile money" },
  { value: "virement", label: "Virement bancaire" },
  { value: "carte", label: "Carte bancaire" },
] as const;

export const REFUND_STATUSES = [
  { value: "initie", label: "Initié" },
  { value: "en_attente", label: "En attente" },
  { value: "effectue", label: "Effectué" },
  { value: "echoue", label: "Échoué" },
] as const;

export const PROJECT_STATUSES = [
  { value: "planifie", label: "Planifié" },
  { value: "en_cours", label: "En cours" },
  { value: "suspendu", label: "Suspendu" },
  { value: "termine", label: "Terminé" },
] as const;

export const PROVIDER_DOMAINS = [
  { value: "maconnerie", label: "Maçonnerie & gros œuvre" },
  { value: "electricite", label: "Électricité" },
  { value: "plomberie", label: "Plomberie & sanitaire" },
  { value: "charpente", label: "Charpente & toiture" },
  { value: "peinture", label: "Peinture & finitions" },
  { value: "architecture", label: "Architecture & conception" },
  { value: "ingenierie", label: "Ingénierie & bureau d'études" },
  { value: "geometre", label: "Géomètre & topographie" },
  { value: "fournisseurs", label: "Fournisseurs / quincaillerie" },
  { value: "securite", label: "Sécurité & gardiennage" },
  { value: "decoration", label: "Décoration & aménagement" },
  { value: "vrd", label: "Terrassement & VRD" },
  { value: "autre", label: "Autres services" },
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

export const ORDER_STATUSES = [
  { value: "creee", label: "Créée" },
  { value: "paiement_en_attente", label: "Paiement en attente" },
  { value: "payee", label: "Payée" },
  { value: "preparation", label: "En préparation" },
  { value: "prete", label: "Prête" },
  { value: "en_livraison", label: "En livraison" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
  { value: "remboursee", label: "Remboursée" },
  { value: "litige", label: "Litige" },
] as const;

export const DELIVERY_STATUSES = [
  { value: "planifiee", label: "Planifiée" },
  { value: "en_attente_transporteur", label: "En attente d'un transporteur" },
  { value: "en_livraison", label: "En livraison" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
] as const;

export const PRODUCT_UNITS = [
  { value: "sac", label: "Sac" },
  { value: "tonne", label: "Tonne" },
  { value: "kg", label: "Kg" },
  { value: "m3", label: "m³" },
  { value: "m2", label: "m²" },
  { value: "m", label: "Mètre" },
  { value: "piece", label: "Pièce" },
  { value: "barre", label: "Barre" },
  { value: "carton", label: "Carton" },
  { value: "palette", label: "Palette" },
  { value: "litre", label: "Litre" },
  { value: "bidon", label: "Bidon" },
] as const;

export const RESERVE_STATUSES = [
  { value: "ouverte", label: "Ouverte" },
  { value: "en_cours", label: "En cours" },
  { value: "resolue", label: "Résolue" },
  { value: "annulee", label: "Annulée" },
] as const;

export const RESERVE_PRIORITIES = [
  { value: "basse", label: "Basse" },
  { value: "moyenne", label: "Moyenne" },
  { value: "haute", label: "Haute" },
  { value: "critique", label: "Critique" },
] as const;

export const VERIFICATION_DOC_TYPES = [
  { value: "identite", label: "Carte d'identité" },
  { value: "rccm", label: "RCCM" },
  { value: "patente", label: "Patente" },
  { value: "cnps", label: "Attestation CNPS" },
  { value: "quittance", label: "Quittance / facture" },
  { value: "permis", label: "Permis / agrément" },
  { value: "diplome", label: "Diplôme / qualification" },
] as const;

export const VERIFICATION_DOC_STATUSES = [
  { value: "en_attente", label: "En attente" },
  { value: "approuve", label: "Approuvé" },
  { value: "rejete", label: "Rejeté" },
] as const;

export const REVIEW_TARGETS = [
  { value: "store", label: "Boutique" },
  { value: "product", label: "Produit" },
  { value: "driver", label: "Transporteur" },
] as const;
