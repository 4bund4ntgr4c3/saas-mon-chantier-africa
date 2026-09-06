/**
 * Module de gestion des notifications push PWA et alertes de chantier locales.
 */

export type SiteNotificationType =
  "sechage_dalle" | "meteo_pluie" | "facture_impayee" | "livraison_materiaux";

export interface PushNotificationPayload {
  id: string;
  type: SiteNotificationType;
  title: string;
  body: string;
  projectName: string;
  timestamp: string;
}

export function createSiteNotification(
  type: SiteNotificationType,
  projectName: string,
  extraDetail?: string,
): PushNotificationPayload {
  const id = `NOTIF-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
  let title = "Alerte BâtiBénin";
  let body = `Notification relative à votre chantier ${projectName}.`;

  switch (type) {
    case "sechage_dalle":
      title = "🏗️ Durcissement Béton : Fin des 21 jours !";
      body = `La dalle béton de « ${projectName} » a atteint sa résistance maximale. Le décoffrage et l'élévation peuvent débuter.`;
      break;
    case "meteo_pluie":
      title = "⛈️ Alerte Météo : Risque d'intempéries";
      body = `De fortes pluies sont prévues à Cotonou/Calavi. Évitez tout coulage de béton non abrité sur « ${projectName} ».`;
      break;
    case "facture_impayee":
      title = "⏰ Échéance Facture Dépassée";
      body = `Un acompte ou une facture pour « ${projectName} » est en attente de règlement. ${extraDetail ?? ""}`;
      break;
    case "livraison_materiaux":
      title = "🚚 Camion de matériaux en approche";
      body = `Une livraison d'agrégats/ciment est en route vers le chantier « ${projectName} ».`;
      break;
  }

  return {
    id,
    type,
    title,
    body,
    projectName,
    timestamp: new Date().toISOString(),
  };
}
