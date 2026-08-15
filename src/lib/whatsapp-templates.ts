/**
 * Templates et générateurs de messages WhatsApp professionnels pour le BTP en Afrique de l'Ouest.
 */

import { fcfa } from "./format";

export interface WhatsAppShareData {
  projectName: string;
  clientName?: string | null;
  phoneNumber?: string | null;
}

export function generateOrderTemplate(
  data: WhatsAppShareData,
  supplierName: string,
  items: { name: string; quantity: number; unit: string }[],
  deliveryAddress: string,
): string {
  const itemsText = items.map((i) => `• ${i.name} : *${i.quantity} ${i.unit}*`).join("\n");
  return `🏗️ *BON DE COMMANDE MATÉRIAUX — ${data.projectName.toUpperCase()}*

Bonjour *${supplierName}*,

Merci de préparer et confirmer la disponibilité de la commande suivante :

📦 *Détail des matériaux :*
${itemsText}

📍 *Lieu de livraison :* ${deliveryAddress}
👤 *Contact chantier :* ${data.clientName ?? "Chef de chantier"}

Merci de nous envoyer le devis ou la facture proforma correspondante.
_Généré via BâtiBénin — Plateforme BTP_`;
}

export function generateMilestoneCallTemplate(
  data: WhatsAppShareData,
  milestoneTitle: string,
  amount: number,
  momoNumber: string,
): string {
  return `🔔 *APPEL DE FONDS / VALIDATION JALON — ${data.projectName.toUpperCase()}*

Bonjour ${data.clientName ? `*${data.clientName}*` : ""},

L'étape suivante de votre chantier a été réalisée avec succès :
✅ *Jalon :* ${milestoneTitle}
💰 *Montant d'acompte attendu :* *${fcfa(amount)}*

📲 *Règlement par Mobile Money :*
• Compte / N° : *${momoNumber}* (MTN MoMo / Moov Money)

Vous pouvez visualiser les photos d'avancement et le rapport sur votre espace BâtiBénin.
_Plateforme de suivi de chantier BâtiBénin_`;
}

export function generateSiteFlashReportTemplate(
  data: WhatsAppShareData,
  progressPercent: number,
  workDoneToday: string,
  nextSteps: string,
): string {
  return `📸 *RAPPORT FLASH DE CHANTIER — ${data.projectName.toUpperCase()}*

Bonjour ${data.clientName ? `*${data.clientName}*` : ""},

Voici le point d'avancement de votre chantier :
📊 *Avancement global :* *${progressPercent}%*

🧱 *Travaux réalisés :*
${workDoneToday}

⏳ *Prochaines étapes :*
${nextSteps}

Toutes les photos du jour sont consultables sur votre tableau de bord BâtiBénin.
_Construisons en toute transparence avec BâtiBénin_`;
}

export function createWhatsAppLink(
  phoneNumber: string | undefined | null,
  message: string,
): string {
  const cleanPhone = (phoneNumber ?? "").replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(message);
  if (cleanPhone.length >= 8) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
