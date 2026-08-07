import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  FileText,
  Gauge,
  HardHat,
  Hammer,
  LogOut,
  Receipt,
  Store,
  Inbox,
  Wallet,
} from "lucide-react";
import { type ReactNode } from "react";
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
import { useIsAdmin } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/tableau-de-bord", label: "Tableau de bord", icon: Gauge },
  { to: "/projets", label: "Projets", icon: HardHat },
  { to: "/depenses", label: "Dépenses", icon: Receipt },
  { to: "/devis", label: "Devis", icon: FileText },
  { to: "/paiements", label: "Paiements", icon: Wallet },
  { to: "/fournisseurs", label: "Fournisseurs", icon: Store },
  { to: "/entreprises", label: "Entreprises", icon: Building2 },
] as const;

const ADMIN_NAV = [
  { to: "/admin/demandes-demo", label: "Demandes de démo", icon: Inbox },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { projects, projectId, setProjectId } = useCurrentProject();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: isAdmin } = useIsAdmin();
  const nav = isAdmin ? [...NAV, ...ADMIN_NAV] : NAV;

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
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            className="justify-start gap-3 text-sidebar-foreground/70"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="size-4" /> Se déconnecter
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
                Chantier
              </span>
              <Select value={projectId ?? ""} onValueChange={setProjectId}>
                <SelectTrigger className="w-[230px]">
                  <SelectValue placeholder="Aucun projet" />
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
              <Button asChild size="sm" variant="secondary">
                <Link to="/projets">Gérer les projets</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="lg:hidden"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>

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
                {item.label}
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
  return (
    <div className="panel grid place-items-center px-6 py-16 text-center">
      <HardHat className="mb-3 size-8 text-primary" />
      <h2 className="font-display text-lg font-semibold">Aucun chantier sélectionné</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Créez d'abord un projet de construction pour commencer à suivre le budget et les
        dépenses.
      </p>
      <Button asChild className="mt-5">
        <Link to="/projets">Créer un projet</Link>
      </Button>
    </div>
  );
}
