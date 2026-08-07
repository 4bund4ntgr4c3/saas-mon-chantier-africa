import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { enterGuestMode } from "@/lib/guest-mode";
import { supabase } from "@/integrations/supabase/client";
import { Hammer } from "lucide-react";
import { DemoRequestForm } from "@/components/DemoRequestForm";


export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/tableau-de-bord" });
  },
  head: () => ({
    meta: [
      { title: "BâtiBénin — Suivi de chantier en FCFA" },
      {
        name: "description",
        content:
          "La plateforme de pilotage technique et financier pour les entrepreneurs d'Afrique de l'Ouest. Gérez vos budgets, fournisseurs et dépenses en FCFA.",
      },
      { property: "og:title", content: "BâtiBénin — Suivi de chantier en FCFA" },
      {
        property: "og:description",
        content:
          "La plateforme de pilotage technique et financier pour les entrepreneurs d'Afrique de l'Ouest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full overflow-hidden bg-background px-6 py-12 lg:px-12">
      {/* Cyan technical grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">

        {/* Left content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Propulsé par BâtiBénin
          </div>

          <h1 className="font-display text-5xl leading-[1.1] text-foreground md:text-7xl">
            Maîtrisez vos chantiers, <br />
            <span className="text-primary">au franc près.</span>
          </h1>

          <p className="max-w-lg text-xl font-light leading-relaxed text-muted-foreground">
            L'outil de pilotage technique et financier conçu pour les entrepreneurs d'Afrique de l'Ouest. Gérez vos
            budgets en FCFA, vos fournisseurs et vos délais avec une précision chirurgicale.
          </p>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-4 font-bold text-primary-foreground shadow-[0_0_20px_oklch(var(--primary)/0.2)] transition-all hover:-translate-y-1 hover:bg-primary/90"
            >
              Démarrer mon projet
            </Link>
            <button
              type="button"
              onClick={() => {
                enterGuestMode();
                navigate({ to: "/tableau-de-bord" });
              }}
              className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-4 font-semibold text-foreground transition-all hover:border-accent"
            >
              Essayer sans compte
            </button>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-4 font-semibold text-foreground transition-all hover:border-accent"
            >
              Demander une démo
            </a>

          </div>

          <div className="flex items-center gap-8 border-t border-border pt-8">
            <div>
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Chantiers suivis</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">12B FCFA</div>
              <div className="text-sm text-muted-foreground">Budgets gérés</div>
            </div>
          </div>
        </div>

        {/* Right content: technical timeline mockup */}
        <div className="group relative">
          {/* Ambient glow */}
          <div
            className="absolute -inset-10 rounded-full opacity-50 blur-[100px]"
            style={{ background: "oklch(var(--accent)/0.1)" }}
          />

          <div className="relative rotate-1 overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-transform duration-700 group-hover:rotate-0">
            {/* Mockup header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4">
              <div className="flex gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                Live: Résidence Cotonou-Nord
              </div>
            </div>

            {/* Timeline content */}
            <div className="relative space-y-0 p-6">
              {/* Vertical line */}
              <div
                className="absolute bottom-0 left-10 top-0 w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, oklch(var(--accent)/0.3), transparent)",
                }}
              />

              {/* Phase 1: completed */}
              <div className="relative pb-8 pl-12">
                <div className="absolute left-[36px] top-1 h-2 w-2 rounded-full border-4 border-background bg-accent ring-1 ring-accent/50" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-1 font-mono text-[10px] text-accent">PHASE 01 // TERRASSEMENT</div>
                    <h3 className="text-sm font-semibold text-foreground">Préparation du site</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Budget : 4.200.000 FCFA <span className="ml-2 text-emerald-500">Finalisé</span>
                    </p>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">12 JAN 2024</div>
                </div>
              </div>

              {/* Phase 2: in progress */}
              <div className="relative pb-8 pl-12">
                <div className="absolute left-[34px] top-0.5 h-3 w-3 rounded-full border-2 border-background bg-accent shadow-[0_0_12px_oklch(var(--accent)/0.8)]" />
                <div className="-ml-2 rounded-lg border border-accent/20 bg-muted/30 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-1 font-mono text-[10px] text-accent">PHASE 02 // FONDATIONS</div>
                      <h3 className="text-sm font-semibold text-foreground">Coulage du béton armé</h3>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 overflow-hidden rounded-full bg-muted h-1">
                          <div className="h-full w-[72%] bg-accent" />
                        </div>
                        <span className="text-[10px] font-bold text-accent">72%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded border border-border bg-background/80 px-2 py-1 text-[9px] text-muted-foreground">
                      MATÉRIAUX: <span className="text-foreground">EN STOCK</span>
                    </div>
                    <div className="rounded border border-border bg-background/80 px-2 py-1 text-[9px] text-muted-foreground">
                      ALERTE: <span className="text-primary">DÉLAI +2j</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 3: upcoming */}
              <div className="relative pb-8 pl-12">
                <div className="absolute left-[36px] top-1 h-2 w-2 rounded-full border-4 border-background bg-muted-foreground" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-1 font-mono text-[10px] text-muted-foreground">PHASE 03 // ÉLÉVATION</div>
                    <h3 className="text-sm font-medium text-muted-foreground">Pose des briques & Poteaux</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Est. 28.500.000 FCFA</p>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">05 MAR 2024</div>
                </div>
              </div>

              {/* Phase 4: future */}
              <div className="relative pl-12">
                <div className="absolute left-[36px] top-1 h-2 w-2 rounded-full border-4 border-background bg-secondary" />
                <div className="flex items-start justify-between opacity-40">
                  <div>
                    <div className="mb-1 font-mono text-[10px] text-muted-foreground">PHASE 04 // CHARPENTE</div>
                    <h3 className="text-sm font-medium text-muted-foreground">Toiture & Étanchéité</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom technical overlay */}
            <div className="flex items-center justify-between border-t border-border bg-background/80 p-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  Consommation Totale
                </span>
                <span className="text-sm font-bold text-foreground">18.450.000 FCFA</span>
              </div>
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border-2 border-background bg-muted" />
                <div className="h-6 w-6 rounded-full border-2 border-background bg-accent" />
                <div className="h-6 w-6 rounded-full border-2 border-background bg-primary" />
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-4 -left-6 hidden rounded-lg bg-primary p-4 shadow-2xl md:block">
            <div className="text-[10px] font-black uppercase tracking-tighter text-primary-foreground">Système d'Alerte</div>
            <div className="text-xl font-bold text-primary-foreground">Précision 99.9%</div>
          </div>
        </div>
      </div>

      {/* Demo request */}
      <section
        id="demo"
        className="relative z-10 mx-auto mt-8 grid w-full max-w-7xl scroll-mt-8 grid-cols-1 items-start gap-12 border-t border-border py-20 lg:grid-cols-2"
      >
        <div className="space-y-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent">Contact // Démonstration</div>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
            Demandez une démo <span className="text-primary">personnalisée.</span>
          </h2>
          <p className="max-w-lg text-lg font-light leading-relaxed text-muted-foreground">
            Un expert BâtiBénin vous présente la plateforme sur vos propres chantiers : budgets FCFA, fournisseurs,
            dépenses et échéanciers.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>— Session de 30 minutes, en ligne ou à Cotonou</li>
            <li>— Paramétrage de votre premier projet inclus</li>
            <li>— Sans engagement</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-2xl md:p-8">
          <DemoRequestForm />
        </div>
      </section>

      {/* Footer logo */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center gap-2 border-t border-border py-6 text-muted-foreground">
        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <Hammer className="size-4" />
        </span>
        <span className="font-display text-sm font-semibold text-foreground">BâtiBénin</span>
      </div>
    </div>

  );
}
