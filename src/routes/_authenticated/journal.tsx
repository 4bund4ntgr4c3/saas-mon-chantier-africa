import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CloudSun,
  History,
  ImagePlus,
  List,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { ReadOnlyNotice } from "@/components/feature-gate";
import { useAccess } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentProject } from "@/context/project-context";
import {
  uploadJournalPhotos,
  useCategories,
  useDeleteRow,
  useSaveRow,
  useSignedPhotos,
  useSiteLogs,
  type SiteLog,
} from "@/lib/data";
import { frDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({
    meta: [
      { title: "Journal de chantier — BâtiBénin" },
      {
        name: "description",
        content:
          "Consignez chaque jour l'avancement du chantier : pourcentage réalisé, photos, commentaires et difficultés rencontrées.",
      },
      { property: "og:title", content: "Journal de chantier — BâtiBénin" },
      {
        property: "og:description",
        content:
          "Suivi quotidien de votre construction au Bénin : avancement, photos et difficultés.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JournalPage,
});

const WEATHERS = ["Ensoleillé", "Nuageux", "Pluie", "Forte pluie", "Harmattan"] as const;

type FormState = {
  log_date: string;
  title: string;
  progress: string;
  category_id: string;
  weather: string;
  workers: string;
  comment: string;
  difficulties: string;
  photos: string[];
};

const emptyForm = (): FormState => ({
  log_date: new Date().toISOString().slice(0, 10),
  title: "",
  progress: "0",
  category_id: "",
  weather: "",
  workers: "",
  comment: "",
  difficulties: "",
  photos: [],
});

function JournalPage() {
  const { canEdit } = useAccess("journal");
  const { project, projectId } = useCurrentProject();
  const { data: logs = [], isLoading } = useSiteLogs(projectId);
  const { data: categories = [] } = useCategories();
  const save = useSaveRow("site_logs", "Entrée du journal enregistrée");
  const remove = useDeleteRow("site_logs");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SiteLog | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"liste" | "chronologie">("liste");

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const catPhase = useMemo(() => new Map(categories.map((c) => [c.id, c.phase])), [categories]);
  const latestProgress = logs.length > 0 ? Number(logs[0]!.progress) : 0;
  const withDifficulties = logs.filter((l) => (l.difficulties ?? "").trim() !== "").length;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  function openNew() {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(log: SiteLog) {
    setEditing(log);
    setForm({
      log_date: log.log_date,
      title: log.title,
      progress: String(log.progress),
      category_id: log.category_id ?? "",
      weather: log.weather ?? "",
      workers: log.workers != null ? String(log.workers) : "",
      comment: log.comment ?? "",
      difficulties: log.difficulties ?? "",
      photos: log.photos ?? [],
    });
    setOpen(true);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !projectId) return;
    setUploading(true);
    try {
      const paths = await uploadJournalPhotos(Array.from(files), projectId);
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...paths] }));
      toast.success(`${paths.length} photo(s) ajoutée(s)`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (form.title.trim() === "") {
      toast.error("Indiquez un titre pour l'entrée du journal");
      return;
    }
    const progress = Math.min(100, Math.max(0, Number(form.progress) || 0));
    setSaving(true);
    try {
      await save.mutateAsync({
        ...(editing ? { id: editing.id } : {}),
        values: {
          project_id: projectId,
          log_date: form.log_date || new Date().toISOString().slice(0, 10),
          title: form.title.trim(),
          progress,
          category_id: form.category_id || null,
          weather: form.weather || null,
          workers: form.workers === "" ? null : Number(form.workers),
          comment: form.comment.trim() || null,
          difficulties: form.difficulties.trim() || null,
          photos: form.photos,
        },
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!project) return <EmptyProjectNotice />;

  return (
    <>
      <PageHeader
        title="Journal de chantier"
        subtitle={`${logs.length} entrée(s) · avancement déclaré ${latestProgress}% · ${withDifficulties} difficulté(s) signalée(s)`}
        action={
          canEdit ? (
            <Button onClick={openNew}>
              <Plus className="size-4" /> Nouvelle entrée
            </Button>
          ) : undefined
        }
      />

      <ReadOnlyNotice feature="journal" />

      <div className="panel mb-4 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Avancement global du chantier</span>
          <span className="num font-semibold text-primary">{latestProgress}%</span>
        </div>
        <Progress value={latestProgress} />
      </div>

      <div className="mb-4 flex items-center gap-1 rounded-full border border-border bg-background p-1">
        <button
          type="button"
          onClick={() => setView("liste")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            view === "liste" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          <List className="size-4" /> Liste
        </button>
        <button
          type="button"
          onClick={() => setView("chronologie")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            view === "chronologie" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          <History className="size-4" /> Chronologie
        </button>
      </div>

      {isLoading ? (
        <div className="panel px-6 py-14 text-center text-muted-foreground">Chargement…</div>
      ) : logs.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <MessageSquare className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune entrée pour le moment</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Consignez chaque visite de chantier : avancement, photos, commentaires et difficultés
            rencontrées.
          </p>
          {canEdit && (
            <Button className="mt-5" onClick={openNew}>
              <Plus className="size-4" /> Ajouter la première entrée
            </Button>
          )}
        </div>
      ) : view === "liste" ? (
        <div className="grid gap-4">
          {logs.map((log) => (
            <LogCard
              key={log.id}
              log={log}
              catName={catName}
              canEdit={canEdit}
              onEdit={openEdit}
              onRemove={(id) => {
                if (confirm("Supprimer cette entrée du journal ?")) remove.mutate(id);
              }}
            />
          ))}
        </div>
      ) : (
        <Chronology
          logs={logs}
          catName={catName}
          catPhase={catPhase}
          canEdit={canEdit}
          onEdit={openEdit}
          onRemove={(id) => {
            if (confirm("Supprimer cette entrée du journal ?")) remove.mutate(id);
          }}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Modifier l'entrée" : "Nouvelle entrée du journal"}
            </DialogTitle>
            <DialogDescription>
              Avancement, photos, commentaires et difficultés du chantier {project.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={form.log_date}
                onChange={(e) => set("log_date", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Avancement (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => set("progress", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Titre <span className="text-primary">*</span>
              </Label>
              <Input
                placeholder="Coulage de la dalle du 1er niveau"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Phase / poste</Label>
              <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.phase} · {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Météo</Label>
              <Select value={form.weather} onValueChange={(v) => set("weather", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {WEATHERS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Ouvriers présents
              </Label>
              <Input
                type="number"
                min={0}
                value={form.workers}
                onChange={(e) => set("workers", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Commentaires</Label>
              <Textarea
                rows={3}
                placeholder="Travaux réalisés, observations, décisions prises…"
                value={form.comment}
                onChange={(e) => set("comment", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Difficultés rencontrées
              </Label>
              <Textarea
                rows={3}
                placeholder="Retard de livraison de ciment, panne de bétonnière, pluie…"
                value={form.difficulties}
                onChange={(e) => set("difficulties", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Photos</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                <ImagePlus className="size-4" />
                {uploading ? "Téléversement…" : "Ajouter des photos du chantier"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <PhotoGrid
                paths={form.photos}
                onRemove={(p) =>
                  setForm((prev) => ({
                    ...prev,
                    photos: prev.photos.filter((x) => x !== p),
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={saving || uploading}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LogCard({
  log,
  catName,
  canEdit,
  onEdit,
  onRemove,
}: {
  log: SiteLog;
  catName: Map<string, string>;
  canEdit: boolean;
  onEdit: (log: SiteLog) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <article className="panel p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {frDate(log.log_date)}
          </p>
          <h2 className="font-display text-lg font-semibold">{log.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {log.category_id && <Badge variant="outline">{catName.get(log.category_id)}</Badge>}
            {log.weather && (
              <span className="flex items-center gap-1">
                <CloudSun className="size-3.5" /> {log.weather}
              </span>
            )}
            {log.workers != null && (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {log.workers} ouvrier(s)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="num mr-2 text-sm font-semibold text-primary">{log.progress}%</span>
          {canEdit && (
            <>
              <Button size="icon" variant="ghost" onClick={() => onEdit(log)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => onRemove(log.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <Progress value={Number(log.progress)} className="mt-3" />

      {log.comment && (
        <div className="mt-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="size-3.5" /> Commentaires
          </p>
          <p className="whitespace-pre-line text-sm">{log.comment}</p>
        </div>
      )}

      {log.difficulties && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-destructive">
            <AlertTriangle className="size-3.5" /> Difficultés rencontrées
          </p>
          <p className="whitespace-pre-line text-sm">{log.difficulties}</p>
        </div>
      )}

      <PhotoGrid paths={log.photos ?? []} />
    </article>
  );
}

const PHASE_DOT: Record<string, string> = {
  "Gros œuvre": "bg-primary",
  "Second œuvre": "bg-accent",
  Finitions: "bg-success",
};

function phaseDot(phase: string | undefined) {
  return PHASE_DOT[phase ?? ""] ?? "bg-muted-foreground";
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(key: string) {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function Chronology({
  logs,
  catName,
  catPhase,
  canEdit,
  onEdit,
  onRemove,
}: {
  logs: SiteLog[];
  catName: Map<string, string>;
  catPhase: Map<string, string>;
  canEdit: boolean;
  onEdit: (log: SiteLog) => void;
  onRemove: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const byMonth = new Map<string, SiteLog[]>();
    for (const log of logs) {
      const key = monthKey(log.log_date);
      byMonth.set(key, [...(byMonth.get(key) ?? []), log]);
    }
    return [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [logs]);

  return (
    <div className="relative">
      <div className="absolute bottom-4 left-4 top-4 w-px bg-border" />
      <div className="space-y-8">
        {grouped.map(([month, entries]) => (
          <section key={month}>
            <div className="mb-3 flex items-center gap-3 pl-10">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
                {monthLabel(month)}
              </h3>
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{entries.length} entrée(s)</span>
            </div>

            <div className="space-y-4">
              {entries.map((log) => (
                <div key={log.id} className="relative pl-10">
                  <span
                    className={cn(
                      "absolute left-4 top-4 size-3 -translate-x-1/2 rounded-full ring-4 ring-background",
                      phaseDot(catPhase.get(log.category_id ?? "")),
                    )}
                  />
                  <LogCard
                    log={log}
                    catName={catName}
                    canEdit={canEdit}
                    onEdit={onEdit}
                    onRemove={onRemove}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function PhotoGrid({ paths, onRemove }: { paths: string[]; onRemove?: (path: string) => void }) {
  const { data: urls = {} } = useSignedPhotos(paths);
  if (paths.length === 0) return null;
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {paths.map((p) => (
        <div key={p} className="group relative overflow-hidden rounded-md border border-border">
          {urls[p] ? (
            <a href={urls[p]} target="_blank" rel="noreferrer">
              <img
                src={urls[p]}
                alt="Photo du chantier"
                loading="lazy"
                className="aspect-4/3 w-full object-cover transition-transform group-hover:scale-105"
              />
            </a>
          ) : (
            <div className="aspect-4/3 w-full animate-pulse bg-secondary" />
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(p)}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90 text-destructive"
              aria-label="Retirer la photo"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
