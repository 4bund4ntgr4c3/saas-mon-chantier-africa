import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  HardHat,
  Package,
  Receipt,
  ShoppingBag,
  Store,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentProject } from "@/context/project-context";
import {
  useDeliveries,
  useMyDevelopmentPrograms,
  useOrders,
  useQuoteRequests,
  useUnreadNotificationCount,
} from "@/lib/data";
import { accountTypeLabel, useAccountType, type AccountType } from "@/lib/roles";
import { fcfa } from "@/lib/format";
import { cn } from "@/lib/utils";

type RoleConfig = {
  headline: string;
  kpis: { label: string; value: string; hint?: string }[];
  shortcuts: { to: string; label: string; icon: typeof HardHat }[];
};

/**
 * Bandeau d'accueil adapté au type de compte : KPIs et raccourcis choisis pour
 * le quotidien du rôle (particulier, maître d'œuvre, quincaillerie…).
 */
export function RoleDashboardStrip() {
  const { type } = useAccountType();
  const { projects } = useCurrentProject();
  const unread = useUnreadNotificationCount();
  const { data: quoteRequests = [] } = useQuoteRequests();
  const { data: orders = [] } = useOrders();
  const { data: deliveries = [] } = useDeliveries();
  const { data: programs = [] } = useMyDevelopmentPrograms();

  const config = useMemo<RoleConfig>(() => {
    const activeProjects = projects.filter((p) => p.status !== "termine");
    const budgetTotal = projects.reduce((s, p) => s + Number(p.budget ?? 0), 0);
    const openRequests = quoteRequests.filter((q) => q.status === "ouverte");
    const ordersToProcess = orders.filter(
      (o) => o.status === "creee" || o.status === "payee" || o.status === "preparation",
    );
    const deliveriesTodo = deliveries.filter(
      (d) => d.status === "en_attente_transporteur" || d.status === "en_livraison",
    );

    const base: Record<AccountType, RoleConfig> = {
      particulier: {
        headline: "Votre construction, sous contrôle",
        kpis: [
          { label: "Chantiers suivis", value: String(projects.length) },
          {
            label: "Notifications non lues",
            value: String(unread),
            hint: unread > 0 ? "Alertes budget & échéances" : "Vous êtes à jour",
          },
        ],
        shortcuts: [
          { to: "/depenses", label: "Saisir une dépense", icon: Receipt },
          { to: "/calendrier", label: "Prochaines échéances", icon: CalendarDays },
          { to: "/assistant", label: "Demander à l'assistant", icon: TrendingUp },
        ],
      },
      maitre_oeuvre: {
        headline: "Pilotage de vos chantiers",
        kpis: [
          { label: "Chantiers actifs", value: String(activeProjects.length) },
          { label: "Enveloppe cumulée", value: fcfa(budgetTotal) },
        ],
        shortcuts: [
          { to: "/projets", label: "Chantiers", icon: HardHat },
          { to: "/rapports", label: "Rapports & courbe en S", icon: BarChart3 },
          { to: "/devis", label: "Devis", icon: FileText },
          { to: "/taches", label: "Planning", icon: ClipboardList },
        ],
      },
      entreprise: {
        headline: "Suivi de vos travaux",
        kpis: [
          { label: "Chantiers actifs", value: String(activeProjects.length) },
          { label: "Devis ouverts", value: String(openRequests.length) },
        ],
        shortcuts: [
          { to: "/devis", label: "Devis", icon: FileText },
          { to: "/journal", label: "Journal de chantier", icon: ClipboardList },
          { to: "/demandes-devis", label: "Répondre aux besoins", icon: Users },
        ],
      },
      artisan: {
        headline: "Trouvez vos prochains chantiers",
        kpis: [
          { label: "Demandes de devis ouvertes", value: String(openRequests.length) },
          { label: "Chantiers suivis", value: String(projects.length) },
        ],
        shortcuts: [
          { to: "/demandes-devis", label: "Demandes de devis", icon: Users },
          { to: "/devis", label: "Mes devis", icon: FileText },
          { to: "/assistant", label: "Assistant", icon: TrendingUp },
        ],
      },
      quincaillerie: {
        headline: "Votre activité de vente",
        kpis: [
          { label: "Commandes à traiter", value: String(ordersToProcess.length) },
          { label: "Notifications non lues", value: String(unread) },
        ],
        shortcuts: [
          { to: "/ma-boutique", label: "Ma boutique", icon: Store },
          { to: "/commandes", label: "Commandes", icon: ShoppingBag },
          { to: "/assistant", label: "Prévision de stock", icon: Package },
        ],
      },
      transporteur: {
        headline: "Vos livraisons du jour",
        kpis: [
          { label: "Livraisons en cours", value: String(deliveriesTodo.length) },
          { label: "Notifications non lues", value: String(unread) },
        ],
        shortcuts: [
          { to: "/commandes", label: "Livraisons", icon: Truck },
          { to: "/assistant", label: "Assistant", icon: TrendingUp },
        ],
      },
      promoteur: {
        headline: "Vos programmes immobiliers",
        kpis: [
          { label: "Programmes", value: String(programs.length) },
          { label: "Chantiers actifs", value: String(activeProjects.length) },
        ],
        shortcuts: [
          { to: "/immobilier", label: "Programmes & lots", icon: Building2 },
          { to: "/projets", label: "Chantiers", icon: HardHat },
          { to: "/rapports", label: "Rapports", icon: BarChart3 },
        ],
      },
    };
    return base[type];
  }, [type, projects, quoteRequests, orders, deliveries, programs, unread]);

  return (
    <section className="panel mb-3 flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {accountTypeLabel(type)}
        </p>
        <h2 className="font-display text-base font-semibold md:text-lg">{config.headline}</h2>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {config.kpis.map((kpi) => (
          <div key={kpi.label} className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
            <p className="num text-sm font-semibold">{kpi.value}</p>
            {kpi.hint && <p className="text-[10px] text-muted-foreground">{kpi.hint}</p>}
          </div>
        ))}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {config.shortcuts.map((s) => (
          <Button key={s.to + s.label} asChild size="sm" variant="outline" className="gap-1.5">
            <Link to={s.to}>
              <s.icon className="size-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
            </Link>
          </Button>
        ))}
        {unread > 0 && (
          <Button asChild size="sm" variant="ghost" className={cn("gap-1.5 text-primary")}>
            <Link to="/notifications">
              <BellRing className="size-3.5" />
              {unread}
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
