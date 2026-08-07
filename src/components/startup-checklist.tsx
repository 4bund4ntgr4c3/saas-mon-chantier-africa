import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, CircleDashed, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { useSaveRow, type Project } from "@/lib/data";
import { PROJECT_STATUSES } from "@/lib/format";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  hint: string;
  fields: Field[];
  isFilled: (p: Project) => boolean;
};

const STEPS: Step[] = [
  {
    id: "infos",
    title: "Informations du chantier",
    hint: "Nom, ville, commune et adresse du projet.",
    fields: [
      { name: "name", label: "Nom du projet", required: true, full: true },
      { name: "city", label: "Ville" },
      { name: "commune", label: "Commune" },
      { name: "arrondissement", label: "Arrondissement" },
      { name: "quartier", label: "Quartier" },
      { name: "address", label: "Adresse", full: true },
      {
        name: "status",
        label: "Statut",
        type: "select",
        options: PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
      },
    ],
    isFilled: (p) => !!p.name?.trim() && !!p.city && !!p.commune,
  },
  {
    id: "surfaces",
    title: "Surfaces et type de maison",
    hint: "Surface du terrain, surface construite, type et niveaux.",
    fields: [
      { name: "land_area", label: "Surface du terrain (m²)", type: "number" },
      { name: "built_area", label: "Surface construite (m²)", type: "number", required: true },
      { name: "house_type", label: "Type de maison", placeholder: "Villa basse, R+1…" },
      { name: "levels", label: "Nombre de niveaux", type: "number" },
    ],
    isFilled: (p) => Number(p.built_area ?? 0) > 0 && Number(p.land_area ?? 0) > 0,
  },
  {
    id: "dates",
    title: "Dates du chantier",
    hint: "Date de début et fin prévisionnelle des travaux.",
    fields: [
      { name: "start_date", label: "Date de début", type: "date", required: true },
      { name: "end_date", label: "Fin prévisionnelle", type: "date" },
    ],
    isFilled: (p) => !!p.start_date,
  },
  {
    id: "budget",
    title: "Budget global",
    hint: "Enveloppe totale prévue pour la construction, en FCFA.",
    fields: [{ name: "budget", label: "Budget global (FCFA)", type: "number", required: true }],
    isFilled: (p) => Number(p.budget ?? 0) > 0,
  },
];

const FIELD_KEYS = [
  "name",
  "city",
  "commune",
  "arrondissement",
  "quartier",
  "address",
  "status",
  "land_area",
  "built_area",
  "house_type",
  "levels",
  "start_date",
  "end_date",
  "budget",
] as const;

const NUMERIC = new Set(["land_area", "built_area", "levels", "budget"]);

function initialValues(step: Step, p: Project): Values {
  const out: Values = {};
  step.fields.forEach((f) => {
    const raw = (p as unknown as Record<string, unknown>)[f.name];
    out[f.name] = raw == null ? "" : String(raw);
  });
  return out;
}

function toPayload(step: Step, v: Values) {
  const payload: Record<string, unknown> = {};
  step.fields.forEach((f) => {
    if (!FIELD_KEYS.includes(f.name as (typeof FIELD_KEYS)[number])) return;
    const raw = v[f.name] ?? "";
    payload[f.name] = NUMERIC.has(f.name) ? toNumber(raw) : orNull(raw);
  });
  return payload;
}

const storageKey = (projectId: string) => `batibenin.checklist.${projectId}`;

export function StartupChecklist({ project }: { project: Project }) {
  const save = useSaveRow("projects", "Étape enregistrée");
  const [validated, setValidated] = useState<string[]>([]);
  const [editing, setEditing] = useState<Step | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(project.id));
      setValidated(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setValidated([]);
    }
  }, [project.id]);

  const persist = (next: string[]) => {
    setValidated(next);
    try {
      localStorage.setItem(storageKey(project.id), JSON.stringify(next));
    } catch {
      /* stockage indisponible */
    }
  };

  const state = useMemo(
    () =>
      STEPS.map((s) => ({
        step: s,
        filled: s.isFilled(project),
        done: s.isFilled(project) && validated.includes(s.id),
      })),
    [project, validated],
  );

  const doneCount = state.filter((s) => s.done).length;
  const percent = Math.round((doneCount / STEPS.length) * 100);

  if (doneCount === STEPS.length) return null;

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">Checklist de démarrage</h2>
          <p className="text-xs text-muted-foreground">
            {doneCount} / {STEPS.length} étapes validées — complétez la fiche de votre chantier.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? "Afficher" : "Masquer"}
          <ChevronDown className={cn("size-4 transition-transform", collapsed && "-rotate-90")} />
        </Button>
      </div>

      <Progress value={percent} className="mt-3" />

      {!collapsed && (
        <ol className="mt-4 grid gap-2">
          {state.map(({ step, filled, done }, i) => (
            <li
              key={step.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-lg border p-3",
                done ? "border-primary/40 bg-primary/5" : "border-border",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <div className="min-w-40 flex-1">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.hint}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing(step)}>
                  <PencilLine className="size-4" /> Renseigner
                </Button>
                {done ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => persist(validated.filter((id) => id !== step.id))}
                  >
                    Annuler
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={!filled}
                    title={filled ? undefined : "Renseignez d'abord les informations requises"}
                    onClick={() => persist([...validated, step.id])}
                  >
                    {filled ? "Valider" : <CircleDashed className="size-4" />}
                    {filled ? null : " Incomplet"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing && (
        <RecordDialog
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={editing.title}
          description={editing.hint}
          fields={editing.fields}
          initial={initialValues(editing, project)}
          onSubmit={async (v) => {
            await save.mutateAsync({ id: project.id, values: toPayload(editing, v) });
          }}
        />
      )}
    </section>
  );
}
