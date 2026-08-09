import type { Lang } from "../context/preferences-context";

/** Dictionnaire FR/EN des libellés d'interface (navigation et shell). */
const dict = {
  "nav.tableau-de-bord": ["Tableau de bord", "Dashboard"],
  "nav.projets": ["Projets", "Projects"],
  "nav.journal": ["Journal de chantier", "Site journal"],
  "nav.reserves": ["Réserves", "Reserves"],
  "nav.messages": ["Messages", "Messages"],
  "nav.plans": ["Plans", "Plans"],
  "nav.documents": ["Documents", "Documents"],
  "nav.budget": ["Budget", "Budget"],
  "nav.depenses": ["Dépenses", "Expenses"],
  "nav.devis": ["Devis", "Quotes"],
  "nav.paiements": ["Paiements", "Payments"],
  "nav.calendrier": ["Échéances", "Due dates"],
  "nav.fournisseurs": ["Fournisseurs", "Suppliers"],
  "nav.entreprises": ["Entreprises", "Companies"],
  "nav.facturation": ["Facturation", "Invoicing"],
  "nav.stock": ["Stock & matériaux", "Stock & materials"],
  "nav.materiaux": ["Matériaux chantier", "Site materials"],
  "nav.photos": ["Photos", "Photos"],
  "nav.taches": ["Tâches", "Tasks"],
  "nav.prestataires": ["Prestataires", "Service providers"],
  "nav.demandes-devis": ["Demandes de devis", "Quote requests"],
  "nav.litiges": ["Litiges & médiation", "Disputes & mediation"],
  "nav.boutique": ["Boutique", "Store"],
  "nav.panier": ["Panier", "Cart"],
  "nav.commandes": ["Commandes", "Orders"],
  "nav.ma-boutique": ["Ma boutique", "My shop"],
  "nav.rapports": ["Rapports", "Reports"],
  "nav.recherche": ["Recherche", "Search"],
  "nav.alertes": ["Alertes", "Alerts"],
  "nav.assistant": ["Assistant IA", "AI Assistant"],
  "nav.audit": ["Journal d'audit", "Audit log"],
  "nav.notifications": ["Notifications", "Notifications"],
  "nav.parametres": ["Paramètres", "Settings"],
  "admin.administration": ["Administration", "Administration"],
  "admin.utilisateurs": ["Utilisateurs", "Users"],
  "admin.demandes-demo": ["Demandes de démo", "Demo requests"],
  "admin.verifications": ["Vérifications", "Verifications"],
  "shell.batibenin": ["BâtiBénin", "BâtiBénin"],
  "shell.chantier": ["Chantier", "Site"],
  "shell.aucun-projet": ["Aucun projet", "No project"],
  "shell.saisie-rapide": ["Saisie rapide", "Quick entry"],
  "shell.depense": ["Dépense", "Expense"],
  "shell.gerer-projets": ["Gérer les projets", "Manage projects"],
  "shell.quitter-apercu": ["Quitter l'aperçu", "Exit preview"],
  "shell.deconnexion": ["Se déconnecter", "Sign out"],
  "shell.empty-title": ["Aucun chantier sélectionné", "No site selected"],
  "shell.empty-text": [
    "Créez d'abord un projet de construction pour commencer à suivre le budget et les dépenses.",
    "Create a construction project first to start tracking your budget and expenses.",
  ],
  "shell.creer-projet": ["Créer un projet", "Create a project"],
} as const;

type Key = keyof typeof dict;

export type I18nKey = Key;

export function tr(lang: Lang, key: Key) {
  const [fr, en] = dict[key];
  return lang === "fr" ? fr : en;
}
