import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { RecordDialog, orNull, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentProject } from "@/context/project-context";
import { useDeleteRow, useSaveRow, useTasks, type Task } from "@/lib/data";
import { frDate, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/taches")({
  head: () => ({
    meta: [
      { title: "Tâches & planning — BâtiBénin" },
      {
        name: "description",
        content: "Liste de tâches de votre chantier : priorités, échéances et avancement.",
      },
      { property: "og:title", content: "Tâches & planning — BâtiBénin" },
      { property: "og:description", content: "Organisez le travail de vos chantiers." },
    ],
  }),
  component: () => (
    <FeatureGate feature="taches">
      <TasksPage />
    </FeatureGate>
  ),
});

const STATUS_ORDER = ["a_faire", "en_cours", "terminee", "annulee"] as const;

const STATUS_LABELS: Record<string, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

const PRIORITY_LABELS: Record<string, string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
};

const FIELDS: Field[] = [
  { name: "title", label: "Titre", required: true, full: true },
  { name: "description", label: "Description", type: "textarea", full: true },
  {
    name: "priority",
    label: "Priorité",
    type: "select",
    options: [
      { value: "basse", label: "Basse" },
      { value: "moyenne", label: "Moyenne" },
      { value: "haute", label: "Haute" },
    ],
  },
  { name: "due_date", label: "Échéance", type: "date" },
];

function TasksPage() {
  const { project, projectId } = useCurrentProject();
  const { data: tasks = [] } = useTasks(projectId);
  const save = useSaveRow("tasks", "Tâche enregistrée");
  const remove = useDeleteRow("tasks");
  const [editing, setEditing] = useState<Task | null>(null);
  const [tab, setTab] = useState<string>("a_faire");

  if (!project) return <EmptyProjectNotice />;

  const filtered = tasks.filter((t) => (tab === "all" ? true : t.status === tab));
  const done = tasks.filter((t) => t.status === "terminee").length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  async function submit(v: Values) {
    await save.mutateAsync({
      ...(editing ? { id: editing.id } : {}),
      values: {
        project_id: projectId,
        title: (v["title"] ?? "").trim(),
        description: orNull(v["description"]),
        priority: (v["priority"] as Task["priority"]) || "moyenne",
        due_date: orNull(v["due_date"]),
      },
    });
    setEditing(null);
  }

  async function setStatus(t: Task, status: Task["status"]) {
    await save.mutateAsync({ id: t.id, values: { status } });
  }

  return (
    <>
      <PageHeader
        title="Tâches & planning"
        subtitle={`${done}/${tasks.length} tâches terminées (${num(pct)} %)`}
        action={
          <RecordDialog
            title="Nouvelle tâche"
            fields={FIELDS}
            initial={{ priority: "moyenne" }}
            onSubmit={submit}
            trigger={
              <Button size="sm">
                <Plus className="mr-1.5 size-4" /> Nouvelle tâche
              </Button>
            }
          />
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList>
          <TabsTrigger value="a_faire">
            À faire ({tasks.filter((t) => t.status === "a_faire").length})
          </TabsTrigger>
          <TabsTrigger value="en_cours">
            En cours ({tasks.filter((t) => t.status === "en_cours").length})
          </TabsTrigger>
          <TabsTrigger value="terminee">Terminées</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <ListChecks className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune tâche</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Créez une tâche pour planifier le travail de votre chantier.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => {
            const overdue =
              t.due_date &&
              t.due_date < new Date().toISOString().slice(0, 10) &&
              t.status !== "terminee";
            return (
              <li
                key={t.id}
                className={`panel flex items-start gap-3 p-4 ${
                  t.status === "terminee" ? "opacity-60" : ""
                }`}
              >
                <button
                  onClick={() => setStatus(t, t.status === "terminee" ? "a_faire" : "terminee")}
                  className="mt-0.5 text-primary"
                  aria-label={t.status === "terminee" ? "Rouvrir" : "Marquer terminée"}
                >
                  {t.status === "terminee" ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        t.status === "terminee" ? "line-through" : ""
                      }`}
                    >
                      {t.title}
                    </p>
                    <Badge
                      variant={
                        t.priority === "haute"
                          ? "destructive"
                          : t.priority === "moyenne"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {PRIORITY_LABELS[t.priority] ?? t.priority}
                    </Badge>
                    {overdue && (
                      <Badge variant="destructive" className="border-0">
                        Échéance dépassée
                      </Badge>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {STATUS_LABELS[t.status] ?? t.status}
                    {t.due_date && ` · échéance ${frDate(t.due_date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(t)}
                    aria-label={`Modifier ${t.title}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove.mutate(t.id)}
                    aria-label={`Supprimer ${t.title}`}
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
          title="Modifier la tâche"
          fields={FIELDS}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          initial={{
            title: editing.title,
            description: editing.description ?? "",
            priority: editing.priority,
            due_date: editing.due_date ?? "",
          }}
          onSubmit={submit}
        />
      )}
    </>
  );
}
