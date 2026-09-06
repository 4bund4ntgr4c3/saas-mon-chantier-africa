/**
 * Module de rédaction des Ordres de Service (OS) et Avenants de travaux BTP.
 */

export type ServiceOrderType = "demarrage" | "arret" | "reprise" | "avenant_modificatif";

export interface ServiceOrderInputs {
  orderNumber: number; // ex: 1, 2, 3
  orderType: ServiceOrderType;
  projectName: string;
  clientName: string; // Maître d'ouvrage
  contractorName: string; // Entreprise titulaire
  effectiveDate: string; // YYYY-MM-DD
  descriptionOrReason: string;
  financialImpactFcfa?: number;
  delayImpactDays?: number;
}

export function generateServiceOrderText(inputs: ServiceOrderInputs): string {
  let title = "";
  switch (inputs.orderType) {
    case "demarrage":
      title = `ORDRE DE SERVICE N° ${inputs.orderNumber.toString().padStart(2, "0")} — DÉMARRAGE DES TRAVAUX`;
      break;
    case "arret":
      title = `ORDRE DE SERVICE N° ${inputs.orderNumber.toString().padStart(2, "0")} — SUSPENSION / ARRÊT TEMPORAIRE DES TRAVAUX`;
      break;
    case "reprise":
      title = `ORDRE DE SERVICE N° ${inputs.orderNumber.toString().padStart(2, "0")} — REPRISE DES TRAVAUX`;
      break;
    case "avenant_modificatif":
      title = `AVENANT CONTRACTUEL N° ${inputs.orderNumber.toString().padStart(2, "0")} — TRAVAUX MODIFICATIFS`;
      break;
  }

  const financialNote =
    inputs.financialImpactFcfa && inputs.financialImpactFcfa !== 0
      ? `\n- Incidence financière : ${inputs.financialImpactFcfa.toLocaleString("fr-FR")} FCFA HT`
      : "\n- Incidence financière : Aucune (0 FCFA)";

  const delayNote =
    inputs.delayImpactDays && inputs.delayImpactDays !== 0
      ? `\n- Incidence calendaire : Prorogation de ${inputs.delayImpactDays} jour(s) calendaire(s)`
      : "\n- Incidence calendaire : Sans modification des délais contractuels";

  return `================================================================================
${title}
Projet : ${inputs.projectName}
================================================================================

1. PARTIES PRENANTES
--------------------------------------------------------------------------------
- Maître de l'Ouvrage (Client) : ${inputs.clientName}
- Entreprise Titulaire du Marché : ${inputs.contractorName}

2. OBJET DU PRÉSENT ACTE
--------------------------------------------------------------------------------
En application des clauses du marché de travaux liant les parties :
Il est formellement ordonné à l'Entreprise ${inputs.contractorName} de procéder à l'exécution de l'acte suivant à compter du ${inputs.effectiveDate} :

Détails & Motivations :
${inputs.descriptionOrReason}

3. INCIDENCES CONTRACTUELLES
--------------------------------------------------------------------------------${financialNote}${delayNote}

4. ENTRÉE EN VIGUEUR ET NOTIFICATION
--------------------------------------------------------------------------------
Le présent ordre de service prend effet immédiat dès sa notification.
L'Entreprise dispose d'un délai réglementaire de dix (10) jours calendaires pour formuler d'éventuelles réserves écrites motivées.

Fait à Cotonou, le ${inputs.effectiveDate}
En deux (2) exemplaires originaux.

Pour le Maître de l'Ouvrage                     Pour l'Entreprise Titulaire
(Signature & Mention "Bon pour ordre")           (Signature & Mention "Reçu et accepté")
`;
}
