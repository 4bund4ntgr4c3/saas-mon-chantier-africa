import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Hammer, HardHat, LogOut, Plus } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { accessFor, accountTypeLabel, useAccountType } from "@/lib/roles";
import { ADMIN_SECTION, NAV_MAIN, NAV_SECTIONS, type NavEntry, type NavSection } from "@/lib/nav";
import { Badge } from "@/components/ui/badge";
import { exitGuestMode, useGuestMode } from "@/lib/guest-mode";
import { GuestBanner } from "@/components/guest-banner";
import { OfflineBanner } from "@/components/offline-banner";
import { CommandPalette } from "@/components/command-palette";
import { NotificationsBell } from "@/components/notifications-bell";
import { ProjectInvitesButton } from "@/components/project-invites";
import { QuickExpenseDialog } from "@/components/quick-expense";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePreferences } from "@/context/preferences-context";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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

  const visible = (item: NavEntry) =>
    !item.feature || accessFor(accountType, item.feature) !== "none";

  // Sections repliables : les items interdits au rôle sont retirés, les sections
  // devenues vides disparaissent complètement du menu.
  const sections = useMemo<readonly NavSection[]>(() => {
    const filtered = NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(visible),
    })).filter((section) => section.items.length > 0);
    return isAdmin ? [...filtered, ADMIN_SECTION] : filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType, isAdmin]);

  const activeSectionIds = useMemo(
    () =>
      sections
        .filter((section) => section.items.some((item) => pathname.startsWith(item.to)))
        .map((section) => section.id),
    [sections, pathname],
  );

  // La section contenant la page courante reste ouverte (sans fermer celles
  // ouvertes manuellement par l'utilisateur).
  const [openSections, setOpenSections] = useState<string[]>(() => [...activeSectionIds]);
  useEffect(() => {
    setOpenSections((prev) => {
      const missing = activeSectionIds.filter((id) => !prev.includes(id));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [activeSectionIds]);

  // Liste à plat pour la barre de navigation mobile.
  const nav = useMemo<readonly NavEntry[]>(
    () => [...NAV_MAIN.filter(visible), ...sections.flatMap((section) => section.items)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sections],
  );

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
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pb-2">
            {NAV_MAIN.filter(visible).map((item) => {
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
            <Accordion
              type="multiple"
              value={openSections}
              onValueChange={setOpenSections}
              className="mt-1 flex flex-col gap-0.5"
            >
              {sections.map((section) => {
                const sectionActive = activeSectionIds.includes(section.id);
                return (
                  <AccordionItem key={section.id} value={section.id} className="border-b-0">
                    <AccordionTrigger
                      className={cn(
                        "rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline",
                        sectionActive && "font-medium text-sidebar-accent-foreground",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <section.icon className="size-4" />
                        {tr(lang, section.labelKey)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1">
                      <div className="flex flex-col gap-0.5">
                        {section.items.map((item) => {
                          const active = pathname.startsWith(item.to);
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={cn(
                                "flex items-center gap-3 rounded-md py-1.5 pl-9 pr-3 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                active &&
                                  "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]",
                              )}
                            >
                              <item.icon className="size-4" />
                              {tr(lang, item.labelKey)}
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
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
          <OfflineBanner />
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
              <CommandPalette />
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
