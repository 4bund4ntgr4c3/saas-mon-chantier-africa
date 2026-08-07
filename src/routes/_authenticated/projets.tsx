import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { RecordDialog, orNull, toNumber, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import { useDeleteRow, useSaveRow, type Project } from "@/lib/data";
import { fcfa, frDate, labelOf, num, PROJECT_STATUSES } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/projets")({
  head: () => ({
    meta: [
      { title: "Projets de construction — BâtiBénin" },
      {
        name: "description",
        content:
          "Gérez plusieurs chantiers au Bénin : localisation, surfaces, niveaux, dates et budget global en FCFA.",
      },
      { property: "og:title", content: "Projets de construction — BâtiBénin" },
      {
        property: "og:description",
        content: "Créez et pilotez vos chantiers de construction au Bénin.",
      },
    ],
  }),
  component: ProjectsPage,
});

const FIELDS = [
  { name: "name", label: "Nom du projet", required: true, full: true },
  { name: "city", label: "Ville" },
  { name: "commune", label: "Commune" },
  { name: "arrondissement", label: "Arrondissement" },
  { name: "quartier", label: "Quartier" },
  { name: "address", label: "Adresse", full: true },
  { name: "land_area", label: "Surface du terrain (m²)", type: "number" as const },
  { name: "built_area", label: "Surface construite (m²)", type: "number" as const },
  { name: "house_type", label: "Type de maison", placeholder: "Villa basse, R+1…" },
  { name: "levels", label: "Nombre de niveaux", type: "number" as const },
  { name: "start_date", label: "Date de début", type: "date" as const },
  { name: "end_date", label: "Fin prévisionnelle", type: "date" as const },
  { name: "budget", label: "Budget global (FCFA)", type: "number" as const, required: true },
  {
    name: "status",
    label: "Statut",
    type: "select" as const,
    options: PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  },
];

function toValues(p: Project): Values {
  return {
    name: p.name,
    city: p.city ?? "",
    commune: p.commune ?? "",
    arrondissement: p.arrondissement ?? "",
    quartier: p.quartier ?? "",
    address: p.address ?? "",
    land_area: p.land_area != null ? String(p.land_area) : "",
    built_area: p.built_area != null ? String(p.built_area) : "",
    house_type: p.house_type ?? "",
    levels: p.levels != null ? String(p.levels) : "",
    start_date: p.start_date ?? "",
    end_date: p.end_date ?? "",
    budget: String(p.budget ?? 0),
    status: p.status,
  };
}

function toPayload(v: Values) {
  return {
    name: v.name?.trim() ?? "",
    city: orNull(v.city),
    commune: orNull(v.commune),
    arrondissement: orNull(v.arrondissement),
    quartier: orNull(v.quartier),
    address: orNull(v.address),
    land_area: toNumber(v.land_area),
    built_area: toNumber(v.built_area),
    house_type: orNull(v.house_type),
    levels: toNumber(v.levels) ?? 1,
    start_date: orNull(v.start_date),
    end_date: orNull(v.end_date),
    budget: toNumber(v.budget) ?? 0,
    status: v.status || "en_cours",
  };
}

function ProjectsPage() {
  const { projects, projectId, setProjectId } = useCurrentProject();
  const save = useSaveRow("projects", "Projet enregistré");
  const remove = useDeleteRow("projects");
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <>
      <PageHeader
        title="Projets"
        subtitle="Tous vos chantiers de construction"
        action={
          <RecordDialog
            title="Nouveau projet"
            description="Renseignez les informations du chantier."
            fields={FIELDS}
            initial={{ status: "en_cours", levels: "1" }}
            trigger={
              <Button>
                <Plus className="size-4" /> Nouveau projet
              </Button>
            }
            onSubmit={async (v) => save.mutateAsync({ values: toPayload(v) })}
          />
        }
      />

      {projects.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          Aucun projet. Créez votre premier chantier pour démarrer le suivi.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <article key={p.id} className="panel flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold">{p.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {[p.quartier, p.commune, p.city].filter(Boolean).join(" · ") ||
                      "Localisation non renseignée"}
                  </p>
                </div>
                <Badge variant="outline">{labelOf(PROJECT_STATUSES, p.status)}</Badge>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="num text-primary">{fcfa(Number(p.budget))}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Surface construite</dt>
                  <dd className="num">{p.built_area ? `${num(Number(p.built_area))} m²` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Terrain</dt>
                  <dd className="num">{p.land_area ? `${num(Number(p.land_area))} m²` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Niveaux</dt>
                  <dd className="num">{p.levels ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Début</dt>
                  <dd>{frDate(p.start_date)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Fin prévue</dt>
                  <dd>{frDate(p.end_date)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={projectId === p.id ? "default" : "secondary"}
                  onClick={() => setProjectId(p.id)}
                >
                  {projectId === p.id ? "Chantier actif" : "Activer"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`Supprimer le projet « ${p.name} » et toutes ses données ?`))
                      remove.mutate(p.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <RecordDialog
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={`Modifier ${editing.name}`}
          fields={FIELDS}
          initial={toValues(editing)}
          onSubmit={async (v) =>
            save.mutateAsync({ id: editing.id, values: toPayload(v) })
          }
        />
      )}
    </>
  );
}
