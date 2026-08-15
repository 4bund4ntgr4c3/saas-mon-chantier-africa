/**
 * Module de génération de badges et laissez-passer avec QR code pour artisans et intervenants BTP.
 */

export type BadgeRole =
  "chef_chantier" | "artisan" | "manoeuvre" | "visiteur_client" | "controleur";

export interface SiteAccessBadge {
  badgeId: string;
  fullName: string;
  role: BadgeRole;
  roleLabel: string;
  projectName: string;
  phone: string;
  emergencyContact: string;
  validUntil: string;
  qrPayload: string;
}

export const BADGE_ROLES: { value: BadgeRole; label: string; color: string }[] = [
  { value: "chef_chantier", label: "Chef de Chantier / Conducteur", color: "bg-purple-500" },
  { value: "artisan", label: "Artisan / Ouvrier Qualifié", color: "bg-blue-500" },
  { value: "manoeuvre", label: "Manœuvre / Manutentionnaire", color: "bg-amber-500" },
  { value: "visiteur_client", label: "Maître d'Ouvrage / Visiteur", color: "bg-emerald-500" },
  { value: "controleur", label: "Bureau de Contrôle / Architecte", color: "bg-indigo-500" },
];

export function generateAccessBadge(
  fullName: string,
  role: BadgeRole,
  projectName: string,
  phone: string,
  emergencyContact: string = "+229 97 00 00 00",
  validityDays: number = 90,
): SiteAccessBadge {
  const badgeId = `PASS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const roleMeta = BADGE_ROLES.find((r) => r.value === role) ?? BADGE_ROLES[1]!;

  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + validityDays);
  const validUntil = validUntilDate.toISOString().slice(0, 10);

  const qrPayload = JSON.stringify({
    badgeId,
    name: fullName,
    role: roleMeta.label,
    project: projectName,
    expires: validUntil,
  });

  return {
    badgeId,
    fullName,
    role,
    roleLabel: roleMeta.label,
    projectName,
    phone,
    emergencyContact,
    validUntil,
    qrPayload,
  };
}
