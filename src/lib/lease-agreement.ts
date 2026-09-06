/**
 * Générateur de Contrat de Bail d'Habitation conforme à la Loi n° 2017-15 en République du Bénin.
 */

import { fcfa } from "./format";

export interface LeaseAgreementInputs {
  lessorName: string; // Bailleur
  tenantName: string; // Locataire
  propertyAddress: string; // Adresse / Quartier / Ville
  propertyType: string; // Appartement F3, Villa duplex, etc.
  monthlyRentFcfa: number;
  securityDepositMonths: number; // Max 3 mois légal
  advanceRentMonths: number; // Max 3 mois légal
  leaseStartDate: string;
}

export function generateBeninLeaseContractText(inputs: LeaseAgreementInputs): string {
  const cappedDepositMonths = Math.min(3, Math.max(1, inputs.securityDepositMonths));
  const cappedAdvanceMonths = Math.min(3, Math.max(1, inputs.advanceRentMonths));

  const depositAmount = inputs.monthlyRentFcfa * cappedDepositMonths;
  const advanceAmount = inputs.monthlyRentFcfa * cappedAdvanceMonths;
  const totalDueAtSigning = depositAmount + advanceAmount;

  return `CONTRAT DE BAIL À USAGE D'HABITATION
Soumis aux dispositions de la Loi n° 2017-15 du 10 août 2017 portant réglementation du bail à usage d'habitation en République du Bénin.

ENTRE LES SOUSSIGNÉS :

LE BAILLEUR (Propriétaire) :
M./Mme ${inputs.lessorName}
Ci-après dénommé "Le Bailleur", d'une part,

ET LE PRENEUR (Locataire) :
M./Mme ${inputs.tenantName}
Ci-après dénommé "Le Locataire", d'autre part.

ARTICLE 1 — DÉSIGNATION DES LIEUX LOUÉS
Le Bailleur donne à bail à usage d'habitation exclusive au Locataire le bien ci-après :
- Type de bien : ${inputs.propertyType}
- Situation géographique : ${inputs.propertyAddress}

ARTICLE 2 — DURÉE ET PRISE D'EFFET DU BAIL
Le présent bail est conclu pour une durée d'une (1) année renouvelable par tacite reconduction.
Il prend effet à compter du : ${inputs.leaseStartDate}.

ARTICLE 3 — LOYER MENSUEL ET MODALITÉS DE PAIEMENT
Le loyer mensuel convenu est fixé à la somme ferme de : ${fcfa(inputs.monthlyRentFcfa)} TTC.
Le loyer est payable d'avance le 05 de chaque mois au plus tard.

ARTICLE 4 — DÉPÔT DE GARANTIE ET AVANCE (CONFORMITÉ LOI 2017-15)
Conformément aux articles 9 et 10 de la loi n° 2017-15 :
- Dépôt de garantie (${cappedDepositMonths} mois plafonné) : ${fcfa(depositAmount)}
- Avance sur loyer (${cappedAdvanceMonths} mois plafonnée) : ${fcfa(advanceAmount)}
- Montant total exigible à la signature : ${fcfa(totalDueAtSigning)}.

ARTICLE 5 — ÉTAT DES LIEUX ET RESTITUTION
Un état des lieux contradictoire est dressé à l'entrée et à la sortie. Le dépôt de garantie sera restitué au locataire dans un délai maximum d'un (1) mois suivant la remise des clés, déduction faite des éventuelles réparations locatives.

Fait à Cotonou, en deux (2) exemplaires originaux, le ${new Date().toLocaleDateString("fr-FR")}.

Le Bailleur (Lu et approuvé)                      Le Locataire (Lu et approuvé)
`;
}
