import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { RecordDialog, orNull, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentProject } from "@/context/project-context";
import { useCategories, useDeleteRow, useReserves, useSaveRow, type Reserve } from "@/lib/data";
import { frDate } from "@/lib/format";
import { RESERVE_PRIORITIES, RESERVE_STATUSES } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reserves")({
  head: () => ({
    meta: [{ title: "Réserves de chantier — BâtiBénin" }],
  }),
  component: () => (
    <FeatureGate feature="journal">
      <ReservesPage />
    </FeatureGate>
  ),
});

const FIELDS: Field[] = [
  { name: "title", label: "Titre", required: true, full: true },
  { name: "description", label: "Description", type: "textarea", full: true },
  {
    name: "category_id",
    label: "Phase",
    type: "select",
    options: [],
  },
  {
    name: "priority",
    label: "Priorité",
    type: "select",
    options: RESERVE_PRIORITIES.map((p) => ({ value: p.value, label: p.label })),
  },
  { name: "location", label: "Emplacement", placeholder: "Façade Nord, R+1…" },
  { name: "due_date", label: "Échéance", type: "date" },
];

function ReservesPage() {
  const { project, projectId } = useCurrentProject();
  const { data: reserves = [] } = useReserves(projectId);
  const { data: categories = [] } = useCategories();
  const save = useSaveRow("reserves", "Réserve enregistrée");
  const remove = useDeleteRow("reserves");
  const [editing, setEditing] = useState<Reserve | null>(null);
  const [tab, setTab] = useState<string>("all");

  const phaseOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  if (!project) return <EmptyProjectNotice />;

  const fields = FIELDS.map((f) =>
    f.name === "category_id" ? { ...f, options: phaseOptions } : f,
  );

  const filtered = reserves.filter((r) => (tab === "all" ? true : r.status === tab));
  const openCount = reserves.filter((r) => r.status !== "resolue" && r.status !== "annulee").length;

  async function submit(v: Values) {
    await save.mutateAsync({
      ...(editing ? { id: editing.id } : {}),
      values: {
        project_id: projectId,
        title: (v["title"] ?? "").trim(),
        description: orNull(v["description"]),
        category_id: orNull(v["category_id"]),
        priority: (v["priority"] as Reserve["priority"]) || "moyenne",
        location: orNull(v["location"]),
        due_date: orNull(v["due_date"]),
        status: editing ? editing.status : "ouverte",
        resolved_at: editing?.status === "resolue" ? editing.resolved_at : null,
      },
    });
    setEditing(null);
  }

  async function toggleStatus(r: Reserve) {
    const resolved = r.status === "resolue";
    await save.mutateAsync({
      id: r.id,
      values: {
        status: resolved ? "ouverte" : "resolue",
        resolved_at: resolved ? null : new Date().toISOString(),
      },
    });
  }

  async function setStatus(r: Reserve, status: string) {
    await save.mutateAsync({
      id: r.id,
      values: {
        status,
        resolved_at: status === "resolue" ? new Date().toISOString() : null,
      },
    });
  }

  return (
    <>
      <PageHeader
        title="Réserves de chantier"
        subtitle={`${openCount} réserve(s) ouverte(s) sur ${reserves.length}`}
        action={
          <RecordDialog
            title="Nouvelle réserve"
            fields={fields}
            initial={{ priority: "moyenne" }}
            onSubmit={submit}
            trigger={
              <Button size="sm">
                <Plus className="mr-1.5 size-4" /> Nouvelle réserve
              </Button>
            }
          />
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList>
          <TabsTrigger value="all">Toutes ({reserves.length})</TabsTrigger>
          <TabsTrigger value="ouverte">Ouvertes</TabsTrigger>
          <TabsTrigger value="en_cours">En cours</TabsTrigger>
          <TabsTrigger value="resolue">Résolues</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <AlertTriangle className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune réserve</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Signalez un écart, une malfaçon ou un point à reprendre pour le faire corriger par
            l'entreprise.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => {
            const overdue =
              r.due_date &&
              r.due_date < new Date().toISOString().slice(0, 10) &&
              r.status !== "resolue" &&
              r.status !== "annulee";
            const phase = phaseOptions.find((p) => p.value === r.category_id);
            return (
              <li
                key={r.id}
                className={cn(
                  "panel flex items-start gap-3 p-4",
                  r.status === "resolue" && "opacity-60",
                )}
              >
                <button
                  onClick={() => toggleStatus(r)}
                  className="mt-0.5 text-primary"
                  aria-label={r.status === "resolue" ? "Rouvrir" : "Marquer résolue"}
                >
                  {r.status === "resolue" ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        r.status === "resolue" && "line-through",
                      )}
                    >
                      {r.title}
                    </p>
                    <PriorityBadge priority={r.priority} />
                    <Badge variant="outline">{labelStatus(r.status)}</Badge>
                    {phase && <Badge variant="secondary">{phase.label}</Badge>}
                    {overdue && (
                      <Badge variant="destructive" className="border-0">
                        Échéance dépassée
                      </Badge>
                    )}
                  </div>
                  {r.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{r.description}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.location && `${r.location} · `}
                    créée le {frDate(r.created_at)}
                    {r.due_date && ` · échéance ${frDate(r.due_date)}`}
                    {r.resolved_at && ` · résolue le ${frDate(r.resolved_at)}`}
                  </p>
                  {r.status === "ouverte" && (
                    <div className="mt-1.5 flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => setStatus(r, "en_cours")}
                      >
                        En cours
                      </Button>
                    </div>
                  )}
                  {r.status === "en_cours" && (
                    <div className="mt-1.5 flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => setStatus(r, "ouverte")}
                      >
                        <RotateCcw className="mr-1 size-3" /> Rouvrir
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(r)}
                    aria-label={`Modifier ${r.title}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove.mutate(r.id)}
                    aria-label={`Supprimer ${r.title}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <RecordDialog
          title="Modifier la réserve"
          fields={fields}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          initial={{
            title: editing.title,
            description: editing.description ?? "",
            category_id: editing.category_id ?? "",
            priority: editing.priority,
            location: editing.location ?? "",
            due_date: editing.due_date ?? "",
          }}
          onSubmit={submit}
        />
      )}
    </>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls: Record<string, string> = {
    basse: "border-border bg-secondary text-secondary-foreground",
    moyenne: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    haute: "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    critique: "border-destructive bg-destructive/10 text-destructive",
  };
  return (
    <Badge variant="outline" className={cn("border", cls[priority])}>
      {RESERVE_PRIORITIES.find((p) => p.value === priority)?.label ?? priority}
    </Badge>
  );
}

function labelStatus(status: string) {
  return RESERVE_STATUSES.find((s) => s.value === status)?.label ?? status;
}
