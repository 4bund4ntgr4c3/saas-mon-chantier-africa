/**
 * Module d'automatisation WhatsApp Cloud API & webhooks BâtiBénin.
 */

export interface WhatsAppMessagePayload {
  toPhoneNumber: string;
  templateName: "chantier_weekly_digest" | "paiement_recu" | "alerte_coulage_meteo";
  languageCode: string;
  parameters: Record<string, string | number>;
  generatedDirectUrl: string;
}

export function formatWhatsAppCloudMessage(
  phoneNumber: string,
  templateName: "chantier_weekly_digest" | "paiement_recu" | "alerte_coulage_meteo",
  parameters: Record<string, string | number>,
): WhatsAppMessagePayload {
  // Normalisation du numéro pour le Bénin (+229)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const normalizedPhone = cleanPhone.startsWith("229")
    ? cleanPhone
    : `229${cleanPhone.replace(/^0+/, "")}`;

  let bodyText = "";
  if (templateName === "chantier_weekly_digest") {
    bodyText = `🏗️ *BâtiBénin — Résumé Hebdomadaire*\nChantier : ${parameters["projectName"] ?? ""}\nAvancement déclaré : ${parameters["progress"] ?? ""}\nDépenses cumulées : ${parameters["totalSpent"] ?? ""} FCFA\nConsultez le dossier en ligne.`;
  } else if (templateName === "paiement_recu") {
    bodyText = `✅ *BâtiBénin — Versement Confirmé*\nMontant : ${parameters["amount"] ?? ""} FCFA\nBénéficiaire : ${parameters["recipient"] ?? ""}\nRéférence : ${parameters["reference"] ?? ""}`;
  } else {
    bodyText = `⛈️ *Alerte Coulage Béton BâtiBénin*\nChantier : ${parameters["projectName"] ?? ""}\nRisque de pluie détecté sur votre zone. Évitez les coulages à ciel ouvert aujourd'hui.`;
  }

  const directUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(bodyText)}`;

  return {
    toPhoneNumber: normalizedPhone,
    templateName,
    languageCode: "fr",
    parameters,
    generatedDirectUrl: directUrl,
  };
}
