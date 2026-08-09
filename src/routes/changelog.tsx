import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Hammer } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Nouveautés — BâtiBénin" },
      {
        name: "description",
        content:
          "Le journal des évolutions de la plateforme BâtiBénin : fonctionnalités, correctifs et améliorations.",
      },
      { property: "og:title", content: "Nouveautés — BâtiBénin" },
      { property: "og:description", content: "Toutes les évolutions de BâtiBénin." },
    ],
  }),
  component: ChangelogPage,
});

const ENTRIES = [
  {
    version: "v0.14",
    date: "2026-08-09",
    title: "Matériaux & inventaire chantier",
    icon: "✅",
    items: [
      "Nouvelle page « Matériaux chantier » : besoins en matériaux avec quantités prévues, commandées, livrées, consommées et restantes.",
      "Enregistrement des livraisons de matériaux (date, quantité, prix unitaire, statut) avec mise à jour automatique du besoin associé.",
      "Tableau de bord du besoin : montant estimé, progression (barre de progression), badge statut (à commander / commandé / partiel / livré / terminé).",
      "Panneau « À commander encore » pour visualiser les matériaux restant à livrer en un coup d'œil.",
      "Clôture d'un besoin une fois entièrement livré (passe le statut à « terminé »).",
      "Vue « Livraisons récentes » : historique des 20 dernières livraisons du chantier.",
      "Nouvelles tables SQL `material_requirements` et `material_deliveries` avec RLS propriétaire + données de démonstration.",
    ],
  },
  {
    version: "v0.13",
    date: "2026-08-09",
    title: "E-commerce avancé + comparateur de prix",
    icon: "✅",
    items: [
      "Comparateur de prix : offres concurrentes d'un produit, tri « près de moi » via géolocalisation, distance, économie et stock.",
      "Historique des prix (`product_prices`) et mouvements de stock (`product_inventory`) pour chaque produit.",
      "Analytics vendeur : chiffre d'affaires, panier moyen, commandes, ruptures, meilleures ventes et suivi stock/prix par produit.",
      "Fiche produit enrichie : galerie multi-images, caractéristiques, garantie, marque/référence, quantité minimale.",
    ],
  },
  {
    version: "v0.12",
    date: "2026-08-09",
    title: "Collaboration & multi-tenant",
    icon: "✅",
    items: [
      "Membres de chantier : invitez des collaborateurs par e-mail avec rôles (propriétaire / éditeur / lecteur).",
      "Cloche d'invitations dans le header : acceptez une invitation pour rejoindre un chantier.",
      "Organisations multi-tenant (`organizations` / `organization_members`) pour structurer les équipes.",
    ],
  },
];

function ChangelogPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Hammer className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">BâtiBénin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Retour
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-14">
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Journal des évolutions
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Nouveautés <span className="text-primary">BâtiBénin</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-muted-foreground">
          Tous les changements depuis la première version : fonctionnalités livrées, correctifs et
          améliorations, pour toujours savoir où en est la plateforme.
        </p>

        <div className="mt-12 space-y-10">
          {ENTRIES.map((entry) => (
            <article
              key={entry.version}
              className="rounded-xl border border-border bg-card p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg">
                  {entry.icon}
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {entry.version} — {entry.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">Publié le {entry.date}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-foreground/85">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
