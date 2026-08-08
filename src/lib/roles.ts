import { useProfile } from "@/lib/data";

/** Types de compte métier de l'application. */
export type AccountType = "particulier" | "maitre_oeuvre" | "entreprise";

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
];

export function accountTypeLabel(type: AccountType) {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? "Particulier";
}

/** Modules fonctionnels soumis aux droits d'accès. */
export type Feature =
  | "tableau-de-bord"
  | "projets"
  | "journal"
  | "budget"
  | "depenses"
  | "devis"
  | "paiements"
  | "fournisseurs"
  | "entreprises"
  | "parametres"
  | "audit";

/** none = module masqué, read = consultation seule, full = création/modification. */
export type Access = "none" | "read" | "full";

const MATRIX: Record<AccountType, Record<Feature, Access>> = {
  particulier: {
    "tableau-de-bord": "full",
    projets: "full",
    journal: "read",
    budget: "full",
    depenses: "full",
    devis: "read",
    paiements: "full",
    fournisseurs: "full",
    entreprises: "full",
    parametres: "full",
    audit: "full",
  },
  maitre_oeuvre: {
    "tableau-de-bord": "full",
    projets: "full",
    journal: "full",
    budget: "full",
    depenses: "full",
    devis: "full",
    paiements: "full",
    fournisseurs: "full",
    entreprises: "full",
    parametres: "full",
    audit: "full",
  },
  entreprise: {
    "tableau-de-bord": "full",
    projets: "read",
    journal: "full",
    budget: "none",
    depenses: "full",
    devis: "full",
    paiements: "none",
    fournisseurs: "full",
    entreprises: "none",
    parametres: "full",
    audit: "read",
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
