import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Camera, Hammer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { fcfa, frDate, num, PROJECT_STATUSES, labelOf } from "@/lib/format";

export const Route = createFileRoute("/partage/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chantier partagé — BâtiBénin" },
      { name: "description", content: "Suivi d'un chantier partagé en lecture seule." },
      { property: "og:title", content: "Chantier partagé — BâtiBénin" },
    ],
  }),
  component: SharedProjectPage,
});

type SharedProject = {
  project: {
    id: string;
    name: string;
    city: string | null;
    commune: string | null;
    quartier: string | null;
    address: string | null;
    budget: number;
    built_area: number | null;
    house_type: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
  };
  categories: { id: string; name: string; phase: string }[];
  budget_lines: { id: string; category_id: string; planned_amount: number }[];
  expenses: { category_id: string | null; label: string; amount: number; expense_date: string }[];
  site_logs: {
    id: string;
    title: string;
    log_date: string;
    progress: number;
    weather: string | null;
    comment: string | null;
    difficulties: string | null;
    category_id: string | null;
  }[];
  photos: { id: string; caption: string | null; file_path: string; created_at: string }[];
};

function SharedProjectPage() {
  const { token } = Route.useParams();
  const { data, isPending, isError } = useQuery({
    queryKey: ["shared_project", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_shared_project", {
        p_token: token,
      });
      if (error) throw new Error(error.message);
      return data as unknown as SharedProject;
    },
    retry: false,
  });

  if (isPending)
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-sm text-muted-foreground">
        Chargement du chantier…
      </div>
    );

  if (isError || !data || !data.project)
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-md text-center">
          <Hammer className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h1 className="font-display text-lg font-semibold">Chantier introuvable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ce lien de partage n'existe plus ou a été révoqué par son propriétaire.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Découvrir BâtiBénin
          </Link>
        </div>
      </div>
    );

  const p = data.project;
  const catName = new Map(data.categories.map((c) => [c.id, c.name]));
  const catPhase = new Map(data.categories.map((c) => [c.id, c.phase]));
  const totalSpent = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const budget = Number(p.budget ?? 0);
  const progress = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;

  const spentByCat = new Map<string, number>();
  for (const e of data.expenses) {
    if (!e.category_id) continue;
    spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
  }

  const grouped = data.budget_lines
    .map((l) => ({
      id: l.id,
      name: catName.get(l.category_id) ?? "Poste",
      phase: catPhase.get(l.category_id) ?? "Poste",
      planned: Number(l.planned_amount),
      spent: spentByCat.get(l.category_id) ?? 0,
    }))
    .filter((l) => l.planned > 0 || l.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  return (
    <div className="min-h-screen bg-background">
      <header className="relative border-b border-border bg-secondary/30 px-4 py-5 md:px-8">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 md:right-8">
          <ThemeToggle />
        </div>
        <div className="mx-auto max-w-4xl">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Hammer className="size-3.5 text-primary" /> BâtiBénin · chantier partagé
          </div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">{p.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[p.quartier, p.commune, p.city].filter(Boolean).join(" · ")}
            {p.house_type && ` · ${p.house_type}`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{labelOf(PROJECT_STATUSES, p.status)}</Badge>
            {p.start_date && <Badge variant="secondary">Début : {frDate(p.start_date)}</Badge>}
            {p.end_date && <Badge variant="secondary">Fin prévue : {frDate(p.end_date)}</Badge>}
            <Badge variant="secondary">{num(p.built_area ?? 0)} m²</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Avancement financier</span>
            <span className="num">
              {fcfa(totalSpent)} / {fcfa(budget)} · {num(progress, 1)} %
            </span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
          <p className="mt-3 text-xs text-muted-foreground">
            {data.expenses.length} dépense(s) enregistrée(s) · budget restant{" "}
            {fcfa(budget - totalSpent)}
          </p>
        </section>

        {grouped.length > 0 && (
          <section className="panel p-5">
            <h2 className="mb-4 font-display text-base font-semibold">Budget par poste</h2>
            <div className="divide-y divide-border">
              {grouped.map((l) => {
                const pct = l.planned > 0 ? Math.min(100, (l.spent / l.planned) * 100) : 0;
                return (
                  <div key={l.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <div className="min-w-32 flex-1">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {l.phase}
                      </p>
                    </div>
                    <div className="flex min-w-32 flex-1 items-center gap-2">
                      <Progress value={pct} className="h-1.5" />
                      <span className="num w-12 text-right text-xs text-muted-foreground">
                        {num(pct)} %
                      </span>
                    </div>
                    <span className="num w-32 text-right text-xs text-muted-foreground">
                      {fcfa(l.spent)} / {fcfa(l.planned)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {data.site_logs.length > 0 && (
          <section className="panel p-5">
            <h2 className="mb-4 font-display text-base font-semibold">Journal de chantier</h2>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {data.site_logs.map((s) => (
                <li key={s.id}>
                  <div className="absolute -left-1 mt-1 size-2 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{s.title}</p>
                    <span className="text-xs text-muted-foreground">{frDate(s.log_date)}</span>
                    <Badge variant="outline" className="ml-auto">
                      {num(s.progress)} %
                    </Badge>
                  </div>
                  <Progress value={s.progress} className="mt-1.5 h-1.5 max-w-xs" />
                  {s.comment && <p className="mt-1 text-sm text-muted-foreground">{s.comment}</p>}
                  {s.difficulties && (
                    <p className="mt-1 text-xs text-destructive">Difficulté : {s.difficulties}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {data.photos.length > 0 && (
          <section className="panel p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-semibold">
              <Camera className="size-4 text-primary" /> Photos ({data.photos.length})
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.photos.slice(0, 8).map((ph) => (
                <figure
                  key={ph.id}
                  className="grid aspect-4/3 place-items-center overflow-hidden rounded-lg border border-border bg-secondary/40 text-muted-foreground"
                >
                  <Camera className="size-5" />
                  {ph.caption && (
                    <figcaption className="px-2 pb-1 text-center text-[11px]">
                      {ph.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Partagé en lecture seule via BâtiBénin —{" "}
        <Link to="/" className="text-primary">
          batibenin.bj
        </Link>
      </footer>
    </div>
  );
}
