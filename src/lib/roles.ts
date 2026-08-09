import { useProfile } from "@/lib/data";

/** Types de compte métier de l'application. */
export type AccountType =
  | "particulier"
  | "maitre_oeuvre"
  | "entreprise"
  | "artisan"
  | "quincaillerie"
  | "transporteur"
  | "promoteur";

export const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  description: string;
}[] = [
  {
    value: "particulier",
    label: "Particulier",
    description: "Je fais construire ma maison et je suis mon budget.",
  },
  {
    value: "maitre_oeuvre",
    label: "Maître d'œuvre",
    description: "Je pilote des chantiers pour le compte de clients.",
  },
  {
    value: "entreprise",
    label: "Entreprise / artisan",
    description: "J'exécute des travaux : devis, journal et dépenses de chantier.",
  },
  {
    value: "artisan",
    label: "Artisan",
    description: "Maçon, électricien, plombier… je propose mes services sur le marketplace.",
  },
  {
    value: "quincaillerie",
    label: "Quincaillerie / vendeur",
    description: "Je vends des matériaux et j'honore les commandes des chantiers.",
  },
  {
    value: "transporteur",
    label: "Transporteur",
    description: "Je livre les matériaux jusqu'aux chantiers.",
  },
  {
    value: "promoteur",
    label: "Promoteur immobilier",
    description: "Je gère des programmes et des opérations immobilières.",
  },
];

export function accountTypeLabel(type: AccountType) {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? "Particulier";
}

/** Modules fonctionnels soumis aux droits d'accès. */
export type Feature =
  | "tableau-de-bord"
  | "projets"
  | "journal"
  | "documents"
  | "budget"
  | "depenses"
  | "devis"
  | "paiements"
  | "fournisseurs"
  | "entreprises"
  | "facturation"
  | "stock"
  | "photos"
  | "taches"
  | "partage"
  | "marketplace"
  | "rapports"
  | "recherche"
  | "alertes"
  | "calendrier"
  | "parametres"
  | "audit"
  | "assistant";

/** none = module masqué, read = consultation seule, full = création/modification. */
export type Access = "none" | "read" | "full";

const MATRIX: Record<AccountType, Record<Feature, Access>> = {
  particulier: {
    "tableau-de-bord": "full",
    projets: "full",
    journal: "read",
    documents: "full",
    budget: "full",
    depenses: "full",
    devis: "read",
    paiements: "full",
    fournisseurs: "full",
    entreprises: "full",
    facturation: "full",
    stock: "full",
    photos: "full",
    taches: "full",
    partage: "full",
    marketplace: "full",
    rapports: "full",
    recherche: "full",
    alertes: "full",
    calendrier: "full",
    parametres: "full",
    audit: "full",
    assistant: "full",
  },
  maitre_oeuvre: {
    "tableau-de-bord": "full",
    projets: "full",
    journal: "full",
    documents: "full",
    budget: "full",
    depenses: "full",
    devis: "full",
    paiements: "full",
    fournisseurs: "full",
    entreprises: "full",
    facturation: "full",
    stock: "full",
    photos: "full",
    taches: "full",
    partage: "full",
    marketplace: "full",
    rapports: "full",
    recherche: "full",
    alertes: "full",
    calendrier: "full",
    parametres: "full",
    audit: "full",
    assistant: "full",
  },
  entreprise: {
    "tableau-de-bord": "full",
    projets: "read",
    journal: "full",
    documents: "read",
    budget: "none",
    depenses: "full",
    devis: "full",
    paiements: "none",
    fournisseurs: "full",
    entreprises: "none",
    facturation: "none",
    stock: "read",
    photos: "full",
    taches: "full",
    partage: "none",
    marketplace: "full",
    rapports: "none",
    recherche: "read",
    alertes: "none",
    calendrier: "read",
    parametres: "full",
    audit: "read",
    assistant: "full",
  },
  artisan: {
    "tableau-de-bord": "full",
    projets: "read",
    journal: "full",
    documents: "read",
    budget: "none",
    depenses: "full",
    devis: "full",
    paiements: "none",
    fournisseurs: "read",
    entreprises: "none",
    facturation: "none",
    stock: "read",
    photos: "full",
    taches: "full",
    partage: "none",
    marketplace: "full",
    rapports: "none",
    recherche: "read",
    alertes: "none",
    calendrier: "read",
    parametres: "full",
    audit: "read",
    assistant: "full",
  },
  quincaillerie: {
    "tableau-de-bord": "full",
    projets: "read",
    journal: "read",
    documents: "read",
    budget: "none",
    depenses: "full",
    devis: "full",
    paiements: "full",
    fournisseurs: "full",
    entreprises: "none",
    facturation: "full",
    stock: "full",
    photos: "full",
    taches: "full",
    partage: "none",
    marketplace: "full",
    rapports: "none",
    recherche: "read",
    alertes: "read",
    calendrier: "read",
    parametres: "full",
    audit: "read",
    assistant: "full",
  },
  transporteur: {
    "tableau-de-bord": "full",
    projets: "read",
    journal: "full",
    documents: "read",
    budget: "none",
    depenses: "full",
    devis: "read",
    paiements: "none",
    fournisseurs: "read",
    entreprises: "none",
    facturation: "none",
    stock: "read",
    photos: "full",
    taches: "full",
    partage: "none",
    marketplace: "full",
    rapports: "none",
    recherche: "read",
    alertes: "none",
    calendrier: "read",
    parametres: "full",
    audit: "read",
    assistant: "full",
  },
  promoteur: {
    "tableau-de-bord": "full",
    projets: "full",
    journal: "full",
    documents: "full",
    budget: "full",
    depenses: "full",
    devis: "full",
    paiements: "full",
    fournisseurs: "full",
    entreprises: "full",
    facturation: "full",
    stock: "full",
    photos: "full",
    taches: "full",
    partage: "full",
    marketplace: "full",
    rapports: "full",
    recherche: "full",
    alertes: "full",
    calendrier: "full",
    parametres: "full",
    audit: "full",
    assistant: "full",
  },
};

export function accessFor(type: AccountType, feature: Feature): Access {
  return MATRIX[type][feature];
}

/** Type de compte courant (particulier par défaut le temps du chargement). */
export function useAccountType(): { type: AccountType; isLoading: boolean } {
  const { data: profile, isPending } = useProfile();
  const raw = (profile as { account_type?: string } | null | undefined)?.account_type;
  const type = (ACCOUNT_TYPES.some((t) => t.value === raw) ? raw : "particulier") as AccountType;
  return { type, isLoading: isPending };
}

export function useAccess(feature: Feature) {
  const { type, isLoading } = useAccountType();
  const access = accessFor(type, feature);
  return {
    access,
    type,
    isLoading,
    canView: access !== "none",
    canEdit: access === "full",
  };
}
