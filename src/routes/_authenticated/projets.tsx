import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Plus, Search, Trash2, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { ReadOnlyNotice } from "@/components/feature-gate";
import { useAccess } from "@/lib/roles";
import { RecordDialog, orNull, toNumber, type Values } from "@/components/record-form";
import {
  checklistMissingSteps,
  checklistProgress,
  CHECKLIST_STEPS_COUNT,
} from "@/components/startup-checklist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import { useDeleteRow, useDuplicateProject, useSaveRow, type Project } from "@/lib/data";
import { ProjectMembersButton } from "@/components/project-members";
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
  const g = (k: string) => v[k] ?? "";
  return {
    name: g("name").trim(),
    city: orNull(g("city")),
    commune: orNull(g("commune")),
    arrondissement: orNull(g("arrondissement")),
    quartier: orNull(g("quartier")),
    address: orNull(g("address")),
    land_area: toNumber(g("land_area")),
    built_area: toNumber(g("built_area")),
    house_type: orNull(g("house_type")),
    levels: toNumber(g("levels")) ?? 1,
    start_date: orNull(g("start_date")),
    end_date: orNull(g("end_date")),
    budget: toNumber(g("budget")) ?? 0,
    status: g("status") || "en_cours",
  };
}

function ChecklistProgress({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { setProjectId } = useCurrentProject();
  const [progress, setProgress] = useState<{ done: number; total: number; percent: number } | null>(
    null,
  );
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    setProgress(checklistProgress(project));
    setMissing(checklistMissingSteps(project));
  }, [project]);

  const done = progress?.done ?? 0;
  const percent = progress?.percent ?? 0;
  const complete = done === CHECKLIST_STEPS_COUNT;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Checklist de démarrage</span>
        <span className={complete ? "num text-primary" : "num"}>
          {percent}% · {done}/{CHECKLIST_STEPS_COUNT}
        </span>
      </div>
      <Progress value={percent} className="mt-1.5 h-1.5" />
      {!complete && missing.length > 0 && (
        <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">
          Reste : {missing.join(", ")}
        </p>
      )}
      {!complete && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onClick={() => {
            setProjectId(project.id);
            navigate({ to: "/tableau-de-bord" });
          }}
        >
          Continuer la checklist
        </Button>
      )}
    </div>
  );
}

function ProjectsPage() {
  const { canEdit } = useAccess("projets");
  const { projects, projectId, setProjectId } = useCurrentProject();
  const save = useSaveRow("projects", "Projet enregistré");
  const remove = useDeleteRow("projects");
  const duplicate = useDuplicateProject();
  const [editing, setEditing] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "budget">("recent");

  const visible = useMemo(() => {
    const list = projects.filter((p) => {
      if (statusFilter !== "tous" && p.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = [p.name, p.city, p.commune, p.quartier].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "budget") return Number(b.budget ?? 0) - Number(a.budget ?? 0);
      return String(b.created_at).localeCompare(String(a.created_at));
    });
  }, [projects, statusFilter, query, sortBy]);

  return (
    <>
      <PageHeader
        title="Projets"
        subtitle="Tous vos chantiers de construction"
        action={
          canEdit ? (
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
          ) : undefined
        }
      />

      <ReadOnlyNotice feature="projets" />

      <div className="panel mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher un chantier…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "name" | "budget")}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="name">Nom (A → Z)</SelectItem>
            <SelectItem value="budget">Budget décroissant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          {projects.length === 0
            ? "Aucun projet. Créez votre premier chantier pour démarrer le suivi."
            : "Aucun chantier ne correspond aux filtres."}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
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

              <ChecklistProgress project={p} />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={projectId === p.id ? "default" : "secondary"}
                  onClick={() => setProjectId(p.id)}
                >
                  {projectId === p.id ? "Chantier actif" : "Activer"}
                </Button>
                <ProjectMembersButton projectId={p.id} />
                {canEdit && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => duplicate.mutate(p.id)}>
                      <Copy className="size-4" />
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
                  </>
                )}
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
          onSubmit={async (v) => save.mutateAsync({ id: editing.id, values: toPayload(v) })}
        />
      )}
    </>
  );
}
