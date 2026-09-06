/**
 * Module du Coffre-Fort Numérique Foncier du Propriétaire.
 */

export interface LandTitleDocument {
  id: string;
  category:
    | "titre_foncier"
    | "permis_construire"
    | "recasement"
    | "convention_notariee"
    | "plan_topographique"
    | "facture_gros_oeuvre";
  title: string;
  isUploaded: boolean;
  isRequired: boolean;
  documentNumber?: string;
  issuedDate?: string;
}

export interface LandSecurityScore {
  totalRequired: number;
  uploadedRequired: number;
  scorePercent: number;
  securityLevel: "faible" | "moyen" | "excellent";
  advice: string;
}

export function getDefaultOwnerVaultDocuments(): LandTitleDocument[] {
  return [
    {
      id: "vault-tf",
      category: "titre_foncier",
      title: "Titre Foncier (TF) / Certificat d'Appartenance",
      isUploaded: true,
      isRequired: true,
      documentNumber: "TF-12845-COT",
    },
    {
      id: "vault-permis",
      category: "permis_construire",
      title: "Permis de Construire Communal",
      isUploaded: true,
      isRequired: true,
      documentNumber: "PC-2025-089",
    },
    {
      id: "vault-recasement",
      category: "recasement",
      title: "Attestation de Recasement & Numéro d'Îlot ANDF",
      isUploaded: true,
      isRequired: true,
      documentNumber: "REC-CAL-2024",
    },
    {
      id: "vault-topo",
      category: "plan_topographique",
      title: "Plan de Bornage & Levé Topographique Géomètre Expert",
      isUploaded: true,
      isRequired: true,
    },
    {
      id: "vault-convention",
      category: "convention_notariee",
      title: "Convention de Vente Notariée Enregistrée",
      isUploaded: false,
      isRequired: false,
    },
    {
      id: "vault-factures",
      category: "facture_gros_oeuvre",
      title: "Factures d'Achat Ciment & Aciers avec Quitus",
      isUploaded: true,
      isRequired: false,
    },
  ];
}

export function evaluateLandSecurity(documents: LandTitleDocument[]): LandSecurityScore {
  const requiredDocs = documents.filter((d) => d.isRequired);
  const uploadedRequired = requiredDocs.filter((d) => d.isUploaded).length;
  const scorePercent =
    requiredDocs.length > 0 ? Math.round((uploadedRequired / requiredDocs.length) * 100) : 100;

  let securityLevel: "faible" | "moyen" | "excellent" = "faible";
  let advice = "Dossier foncier incomplet. Risque juridique sur la propriété.";

  if (scorePercent === 100) {
    securityLevel = "excellent";
    advice = "Parcelle 100% sécurisée juridiquement et administrativement. Propriété inattaquable.";
  } else if (scorePercent >= 60) {
    securityLevel = "moyen";
    advice = "Pièces maîtresses présentes, mais des documents obligatoires restent à téléverser.";
  }

  return {
    totalRequired: requiredDocs.length,
    uploadedRequired,
    scorePercent,
    securityLevel,
    advice,
  };
}
