import { HardHat, Moon, Search, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCurrentProject } from "@/context/project-context";
import { usePreferences } from "@/context/preferences-context";
import { tr } from "@/lib/i18n";
import { ADMIN_SECTION, NAV_MAIN, NAV_SECTIONS, type NavEntry } from "@/lib/nav";
import { useIsAdmin } from "@/lib/data";
import { accessFor, useAccountType } from "@/lib/roles";
import { useTheme } from "@/lib/theme";

/**
 * Palette de commandes globale (Ctrl/Cmd+K) : changement de chantier,
 * navigation filtrée par rôle et action rapide (thème). Se place dans le
 * header : rend le bouton déclencheur + le dialogue (portail Radix).
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { projects, projectId, setProjectId } = useCurrentProject();
  const { data: isAdmin } = useIsAdmin();
  const { type: accountType } = useAccountType();
  const { lang } = usePreferences();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const navEntries = useMemo(() => {
    const visible = (item: NavEntry) =>
      !item.feature || accessFor(accountType, item.feature) !== "none";
    const sections = isAdmin ? [...NAV_SECTIONS, ADMIN_SECTION] : [...NAV_SECTIONS];
    return [
      ...NAV_MAIN.filter(visible).map((item) => ({ item, sectionLabel: "" })),
      ...sections.flatMap((section) =>
        section.items
          .filter(visible)
          .map((item) => ({ item, sectionLabel: tr(lang, section.labelKey) })),
      ),
    ];
  }, [accountType, isAdmin, lang]);

  const go = (to: string) => {
    setOpen(false);
    void navigate({ to });
  };

  const selectProject = (id: string) => {
    setOpen(false);
    if (id !== projectId) {
      setProjectId(id);
      void navigate({ to: "/tableau-de-bord" });
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        title="Ctrl+K"
        className="gap-2 text-muted-foreground"
      >
        <Search className="size-4" />
        <span className="hidden md:inline">{tr(lang, "palette.open")}</span>
        <kbd className="pointer-events-none hidden select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          Ctrl K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={tr(lang, "palette.placeholder")} />
        <CommandList>
          <CommandEmpty>{tr(lang, "palette.empty")}</CommandEmpty>

          {projects.length > 0 && (
            <CommandGroup heading={tr(lang, "palette.chantiers")}>
              {projects.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`chantier ${p.name} ${p.city ?? ""} ${p.commune ?? ""}`}
                  onSelect={() => selectProject(p.id)}
                >
                  <HardHat className="size-4" />
                  <span className={p.id === projectId ? "font-medium" : undefined}>
                    {p.name}
                    {p.id === projectId ? ` — ${tr(lang, "palette.actif")}` : ""}
                  </span>
                  {p.city && (
                    <span className="ml-auto text-xs text-muted-foreground">{p.city}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading={tr(lang, "palette.navigation")}>
            {navEntries.map(({ item, sectionLabel }) => (
              <CommandItem
                key={item.to}
                value={`${sectionLabel} ${tr(lang, item.labelKey)}`}
                onSelect={() => go(item.to)}
              >
                <item.icon className="size-4" />
                <span>
                  {sectionLabel && (
                    <span className="text-xs text-muted-foreground">{sectionLabel} › </span>
                  )}
                  {tr(lang, item.labelKey)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading={tr(lang, "palette.actions")}>
            <CommandItem
              value={tr(lang, theme === "dark" ? "palette.theme-light" : "palette.theme-dark")}
              onSelect={() => {
                setOpen(false);
                toggle();
              }}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {tr(lang, theme === "dark" ? "palette.theme-light" : "palette.theme-dark")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
