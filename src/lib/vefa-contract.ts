/**
 * Module de génération de contrat de réservation VEFA (Vente en l'État Futur d'Achèvement) au Bénin.
 */

export interface VefaContractData {
  developerName: string;
  developerRccm: string;
  buyerName: string;
  buyerPhone: string;
  programName: string;
  unitLabel: string;
  surfaceM2: number;
  priceFcfa: number;
  depositAmountFcfa: number;
  deliveryDateEstimated: string;
  city: string;
}

export function generateVefaContractText(data: VefaContractData): string {
  return `CONTRAT PRÉLIMINAIRE DE RÉSERVATION (VEFA)
Loi n° 2013-01 portant Code Foncier et Domanial en République du Bénin

ENTRE LES SOUSSIGNÉS :

LE PROMOTEUR / VENDEUR :
${data.developerName} (RCCM: ${data.developerRccm || "En cours d'enregistrement"})
Représenté légalement, ci-après dénommé "Le Promoteur", d'une part,

ET L'ACQUÉREUR :
M./Mme ${data.buyerName}
Téléphone : ${data.buyerPhone}
Ci-après dénommé "Le Réservataire", d'autre part.

ARTICLE 1 — OBJET DE LA RÉSERVATION
Le Promoteur s'engage à réserver au Réservataire le bien immobilier ci-après décrit :
- Programme immobilier : ${data.programName}
- Ville / Localisation : ${data.city || "Cotonou, Bénin"}
- Désignation du lot : ${data.unitLabel}
- Surface habitable estimée : ${data.surfaceM2} m²

ARTICLE 2 — PRIX ET CONDITIONS DE PAIEMENT
Le prix de vente ferme et définitif est fixé à : ${data.priceFcfa.toLocaleString("fr-FR")} FCFA TTC.
Le montant du dépôt de garantie versé ce jour à la réservation est de : ${data.depositAmountFcfa.toLocaleString("fr-FR")} FCFA.
Le solde sera appelé progressivement selon l'échéancier légal des appels de fonds BTP.

ARTICLE 3 — DÉLAI PRÉVISIONNEL DE LIVRAISON
L'achèvement des travaux et la livraison du bien sont prévus pour le : ${data.deliveryDateEstimated || "Dans un délai de 18 mois"}.

ARTICLE 4 — GARANTIES LÉGALES
Le bien bénéficiera de la garantie de parfait achèvement (1 an), de bon fonctionnement (2 ans) et de la garantie décennale (10 ans sur le gros-œuvre).

Fait à ${data.city || "Cotonou"}, le ${new Date().toLocaleDateString("fr-FR")} en 2 exemplaires originaux.

Pour Le Promoteur (Lu et approuvé)        Pour L'Acquéreur (Lu et approuvé)`;
}
