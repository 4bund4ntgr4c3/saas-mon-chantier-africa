import {
  AlertTriangle,
  BarChart3,
  BellRing,
  Boxes,
  Building2,
  CalendarDays,
  CircleDollarSign,
  DraftingCompass,
  FileText,
  FolderOpen,
  Gauge,
  Hammer,
  Handshake,
  HardHat,
  Images,
  Inbox,
  Landmark,
  ListChecks,
  MessageSquare,
  Network,
  NotebookPen,
  Package,
  PiggyBank,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  TicketCheck,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import type { Feature } from "@/lib/roles";

export type NavEntry = {
  to: string;
  labelKey: I18nKey;
  icon: typeof Gauge;
  feature?: Feature;
};

export type NavSection = {
  id: string;
  labelKey: I18nKey;
  icon: typeof Gauge;
  items: readonly NavEntry[];
};

/** Entrées de premier niveau (toujours visibles, hors accordéon). */
export const NAV_MAIN = [
  {
    to: "/tableau-de-bord",
    labelKey: "nav.tableau-de-bord",
    icon: Gauge,
    feature: "tableau-de-bord",
  },
  { to: "/projets", labelKey: "nav.projets", icon: HardHat, feature: "projets" },
] as const satisfies readonly NavEntry[];

/** Sections repliables du sidebar (les items vides pour un rôle sont filtrés au rendu). */
export const NAV_SECTIONS = [
  {
    id: "chantier",
    labelKey: "nav.group.chantier",
    icon: Hammer,
    items: [
      { to: "/journal", labelKey: "nav.journal", icon: NotebookPen, feature: "journal" },
      { to: "/reserves", labelKey: "nav.reserves", icon: AlertTriangle, feature: "journal" },
      { to: "/messages", labelKey: "nav.messages", icon: MessageSquare, feature: "journal" },
      { to: "/calendrier", labelKey: "nav.calendrier", icon: CalendarDays, feature: "calendrier" },
      { to: "/photos", labelKey: "nav.photos", icon: Images, feature: "photos" },
      { to: "/taches", labelKey: "nav.taches", icon: ListChecks, feature: "taches" },
    ],
  },
  {
    id: "documents",
    labelKey: "nav.group.documents",
    icon: FolderOpen,
    items: [
      { to: "/plans", labelKey: "nav.plans", icon: DraftingCompass, feature: "documents" },
      { to: "/documents", labelKey: "nav.documents", icon: FolderOpen, feature: "documents" },
    ],
  },
  {
    id: "finances",
    labelKey: "nav.group.finances",
    icon: CircleDollarSign,
    items: [
      { to: "/budget", labelKey: "nav.budget", icon: PiggyBank, feature: "budget" },
      { to: "/depenses", labelKey: "nav.depenses", icon: Receipt, feature: "depenses" },
      { to: "/devis", labelKey: "nav.devis", icon: FileText, feature: "devis" },
      { to: "/paiements", labelKey: "nav.paiements", icon: Wallet, feature: "paiements" },
      { to: "/facturation", labelKey: "nav.facturation", icon: Landmark, feature: "facturation" },
    ],
  },
  {
    id: "stock",
    labelKey: "nav.group.stock",
    icon: Warehouse,
    items: [
      { to: "/stock", labelKey: "nav.stock", icon: Boxes, feature: "stock" },
      { to: "/materiaux", labelKey: "nav.materiaux", icon: Package, feature: "stock" },
    ],
  },
  {
    id: "partenaires",
    labelKey: "nav.group.partenaires",
    icon: Network,
    items: [
      { to: "/fournisseurs", labelKey: "nav.fournisseurs", icon: Store, feature: "fournisseurs" },
      { to: "/entreprises", labelKey: "nav.entreprises", icon: Building2, feature: "entreprises" },
    ],
  },
  {
    id: "marketplace",
    labelKey: "nav.group.marketplace",
    icon: ShoppingBag,
    items: [
      {
        to: "/prestataires",
        labelKey: "nav.prestataires",
        icon: Handshake,
        feature: "marketplace",
      },
      {
        to: "/demandes-devis",
        labelKey: "nav.demandes-devis",
        icon: TicketCheck,
        feature: "marketplace",
      },
      { to: "/litiges", labelKey: "nav.litiges", icon: ShieldCheck, feature: "marketplace" },
      { to: "/boutique", labelKey: "nav.boutique", icon: Store, feature: "marketplace" },
      { to: "/panier", labelKey: "nav.panier", icon: Package, feature: "marketplace" },
      { to: "/commandes", labelKey: "nav.commandes", icon: Package, feature: "marketplace" },
      { to: "/ma-boutique", labelKey: "nav.ma-boutique", icon: Truck, feature: "marketplace" },
      { to: "/location", labelKey: "nav.location", icon: Wrench, feature: "marketplace" },
      { to: "/immobilier", labelKey: "nav.immobilier", icon: Building2, feature: "marketplace" },
    ],
  },
  {
    id: "pilotage",
    labelKey: "nav.group.pilotage",
    icon: TrendingUp,
    items: [
      { to: "/rapports", labelKey: "nav.rapports", icon: BarChart3, feature: "rapports" },
      { to: "/recherche", labelKey: "nav.recherche", icon: Search, feature: "recherche" },
      { to: "/alertes", labelKey: "nav.alertes", icon: BellRing, feature: "alertes" },
      { to: "/notifications", labelKey: "nav.notifications", icon: BellRing, feature: "alertes" },
      { to: "/assistant", labelKey: "nav.assistant", icon: Sparkles, feature: "assistant" },
    ],
  },
  {
    id: "systeme",
    labelKey: "nav.group.systeme",
    icon: SlidersHorizontal,
    items: [
      { to: "/audit", labelKey: "nav.audit", icon: ShieldCheck, feature: "audit" },
      { to: "/parametres", labelKey: "nav.parametres", icon: Settings, feature: "parametres" },
    ],
  },
] as const satisfies readonly NavSection[];

/** Section réservée aux admins, ajoutée en fin de sidebar. */
export const ADMIN_SECTION = {
  id: "administration",
  labelKey: "admin.administration",
  icon: UserCog,
  items: [
    { to: "/admin", labelKey: "admin.administration", icon: ShieldCheck },
    { to: "/admin/utilisateurs", labelKey: "admin.utilisateurs", icon: Users },
    { to: "/admin/demandes-demo", labelKey: "admin.demandes-demo", icon: Inbox },
    { to: "/admin/verifications", labelKey: "admin.verifications", icon: ShieldCheck },
  ],
} as const satisfies NavSection;
