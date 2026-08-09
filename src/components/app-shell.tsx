import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  Boxes,
  Building2,
  CalendarDays,
  DraftingCompass,
  FileText,
  FolderOpen,
  Gauge,
  Hammer,
  Handshake,
  HardHat,
  Images,
  Landmark,
  ListChecks,
  LogOut,
  MessageSquare,
  NotebookPen,
  Package,
  PiggyBank,
  Plus,
  Search,
  ShieldCheck,
  Settings,
  Sparkles,
  Receipt,
  ShoppingCart,
  Store,
  Inbox,
  Users,
  Wallet,
  Truck,
  TicketCheck,
  Wrench,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import { useIsAdmin, useRegisterDeviceToken } from "@/lib/data";
import { accessFor, accountTypeLabel, useAccountType, type Feature } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { exitGuestMode, useGuestMode } from "@/lib/guest-mode";
import { GuestBanner } from "@/components/guest-banner";
import { NotificationsBell } from "@/components/notifications-bell";
import { ProjectInvitesButton } from "@/components/project-invites";
import { QuickExpenseDialog } from "@/components/quick-expense";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePreferences } from "@/context/preferences-context";
import { tr, type I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  {
    to: "/tableau-de-bord",
    labelKey: "nav.tableau-de-bord",
    icon: Gauge,
    feature: "tableau-de-bord",
  },
  { to: "/projets", labelKey: "nav.projets", icon: HardHat, feature: "projets" },
  { to: "/journal", labelKey: "nav.journal", icon: NotebookPen, feature: "journal" },
  { to: "/reserves", labelKey: "nav.reserves", icon: AlertTriangle, feature: "journal" },
  { to: "/messages", labelKey: "nav.messages", icon: MessageSquare, feature: "journal" },
  { to: "/plans", labelKey: "nav.plans", icon: DraftingCompass, feature: "documents" },
  { to: "/documents", labelKey: "nav.documents", icon: FolderOpen, feature: "documents" },
  { to: "/budget", labelKey: "nav.budget", icon: PiggyBank, feature: "budget" },
  { to: "/depenses", labelKey: "nav.depenses", icon: Receipt, feature: "depenses" },
  { to: "/devis", labelKey: "nav.devis", icon: FileText, feature: "devis" },
  { to: "/paiements", labelKey: "nav.paiements", icon: Wallet, feature: "paiements" },
  { to: "/calendrier", labelKey: "nav.calendrier", icon: CalendarDays, feature: "calendrier" },
  { to: "/fournisseurs", labelKey: "nav.fournisseurs", icon: Store, feature: "fournisseurs" },
  { to: "/entreprises", labelKey: "nav.entreprises", icon: Building2, feature: "entreprises" },
  { to: "/facturation", labelKey: "nav.facturation", icon: Landmark, feature: "facturation" },
  { to: "/stock", labelKey: "nav.stock", icon: Boxes, feature: "stock" },
  { to: "/materiaux", labelKey: "nav.materiaux", icon: Package, feature: "stock" },
  { to: "/photos", labelKey: "nav.photos", icon: Images, feature: "photos" },
  { to: "/taches", labelKey: "nav.taches", icon: ListChecks, feature: "taches" },
  { to: "/prestataires", labelKey: "nav.prestataires", icon: Handshake, feature: "marketplace" },
  {
    to: "/demandes-devis",
    labelKey: "nav.demandes-devis",
    icon: TicketCheck,
    feature: "marketplace",
  },
  { to: "/litiges", labelKey: "nav.litiges", icon: ShieldCheck, feature: "marketplace" },
  { to: "/boutique", labelKey: "nav.boutique", icon: Store, feature: "marketplace" },
  { to: "/panier", labelKey: "nav.panier", icon: ShoppingCart, feature: "marketplace" },
  { to: "/commandes", labelKey: "nav.commandes", icon: Package, feature: "marketplace" },
  { to: "/ma-boutique", labelKey: "nav.ma-boutique", icon: Truck, feature: "marketplace" },
  { to: "/location", labelKey: "nav.location", icon: Wrench, feature: "marketplace" },
  { to: "/rapports", labelKey: "nav.rapports", icon: BarChart3, feature: "rapports" },
  { to: "/recherche", labelKey: "nav.recherche", icon: Search, feature: "recherche" },
  { to: "/alertes", labelKey: "nav.alertes", icon: BellRing, feature: "alertes" },
  { to: "/notifications", labelKey: "nav.notifications", icon: BellRing, feature: "alertes" },
  { to: "/assistant", labelKey: "nav.assistant", icon: Sparkles, feature: "assistant" },
  { to: "/audit", labelKey: "nav.audit", icon: ShieldCheck, feature: "audit" },
  { to: "/parametres", labelKey: "nav.parametres", icon: Settings, feature: "parametres" },
] as const satisfies readonly {
  to: string;
  labelKey: I18nKey;
  icon: typeof Gauge;
  feature: Feature;
}[];

const ADMIN_NAV = [
  { to: "/admin", labelKey: "admin.administration", icon: ShieldCheck },
  { to: "/admin/utilisateurs", labelKey: "admin.utilisateurs", icon: Users },
  { to: "/admin/demandes-demo", labelKey: "admin.demandes-demo", icon: Inbox },
  { to: "/admin/verifications", labelKey: "admin.verifications", icon: ShieldCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { projects, projectId, setProjectId } = useCurrentProject();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: isAdmin } = useIsAdmin();
  const { type: accountType } = useAccountType();
  const guest = useGuestMode();
  const navigate = useNavigate();
  const { lang } = usePreferences();
  const registerDevice = useRegisterDeviceToken();

  // Enregistre ce navigateur comme appareil web pour le push (id stable par navigateur).
  useEffect(() => {
    if (guest) return;
    let token = window.localStorage.getItem("device_token_web");
    if (!token) {
      token = `web-${crypto.randomUUID()}`;
      window.localStorage.setItem("device_token_web", token);
    }
    registerDevice.mutate({ token, platform: "web" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest]);

  async function signOut() {
    if (guest) {
      exitGuestMode();
      navigate({ to: "/auth", replace: true });
      return;
    }
    await supabase.auth.signOut();
  }
  const allowed = NAV.filter((item) => accessFor(accountType, item.feature) !== "none").map(
    ({ to, labelKey, icon }) => ({ to, labelKey, icon }),
  );
  const nav = isAdmin ? [...allowed, ...ADMIN_NAV] : allowed;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
          <Link to="/tableau-de-bord" className="mb-7 flex items-center gap-2 px-2">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Hammer className="size-5" />
            </span>
            <span className="font-display text-base font-semibold tracking-tight">
              Bâti<span className="text-primary">Bénin</span>
            </span>
          </Link>
          <Badge variant="outline" className="mb-4 self-start">
            {accountTypeLabel(accountType)}
          </Badge>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active &&
                      "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]",
                  )}
                >
                  <item.icon className="size-4" />
                  {tr(lang, item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            className="justify-start gap-3 text-sidebar-foreground/70"
            onClick={signOut}
          >
            <LogOut className="size-4" />
            {guest ? tr(lang, "shell.quitter-apercu") : tr(lang, "shell.deconnexion")}
          </Button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Hammer className="size-5 text-primary" />
              <span className="font-display font-semibold">BâtiBénin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:block">
                {tr(lang, "shell.chantier")}
              </span>
              <Select value={projectId ?? ""} onValueChange={setProjectId}>
                <SelectTrigger className="w-[230px]">
                  <SelectValue placeholder={tr(lang, "shell.aucun-projet")} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <QuickExpenseDialog
                trigger={
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!projectId}
                    title={tr(lang, "shell.saisie-rapide")}
                  >
                    <Plus className="mr-1.5 size-4" />
                    <span className="hidden sm:inline">{tr(lang, "shell.depense")}</span>
                  </Button>
                }
              />
              <NotificationsBell />
              <ProjectInvitesButton />
              <ThemeToggle />
              <Button asChild size="sm" variant="secondary">
                <Link to="/projets">{tr(lang, "shell.gerer-projets")}</Link>
              </Button>
              <Button size="sm" variant="ghost" className="lg:hidden" onClick={signOut}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>

          {guest && <GuestBanner />}

          <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-muted-foreground",
                  pathname.startsWith(item.to) && "bg-secondary text-foreground",
                )}
              >
                {tr(lang, item.labelKey)}
              </Link>
            ))}
          </nav>

          <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyProjectNotice() {
  const { lang } = usePreferences();
  return (
    <div className="panel grid place-items-center px-6 py-16 text-center">
      <HardHat className="mb-3 size-8 text-primary" />
      <h2 className="font-display text-lg font-semibold">{tr(lang, "shell.empty-title")}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{tr(lang, "shell.empty-text")}</p>
      <Button asChild className="mt-5">
        <Link to="/projets">{tr(lang, "shell.creer-projet")}</Link>
      </Button>
    </div>
  );
}
