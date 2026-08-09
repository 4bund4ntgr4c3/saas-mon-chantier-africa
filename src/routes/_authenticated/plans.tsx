import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import { useAddPlans, useDeletePlan, usePlans, usePlanUrls, uploadPlanFiles } from "@/lib/data";
import { formatBytes, frDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/plans")({
  head: () => ({
    meta: [{ title: "Plans du chantier — BâtiBénin" }],
  }),
  component: () => (
    <FeatureGate feature="documents">
      <PlansPage />
    </FeatureGate>
  ),
});

function PlansPage() {
  const { project, projectId } = useCurrentProject();
  const { data: plans = [] } = usePlans(projectId);
  const addPlans = useAddPlans();
  const remove = useDeletePlan();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const paths = useMemo(
    () => plans.map((p) => p.file_path).filter((p): p is string => !!p),
    [plans],
  );
  const { data: urls = {} } = usePlanUrls(paths);

  const selected = plans.find((p) => p.id === selectedId) ?? plans[0] ?? null;

  useEffect(() => {
    if (plans.length > 0 && !plans.some((p) => p.id === selectedId)) {
      setSelectedId(plans[0]!.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

  if (!project) return <EmptyProjectNotice />;

  async function upload(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const list = Array.from(files);
      let filePaths = await uploadPlanFiles(list, projectId!);
      if (filePaths.length === 0) {
        filePaths = list.map((f, i) => `demo/${projectId}/${i}-${f.name}`);
      }
      await addPlans.mutateAsync(
        filePaths.map((fp, i) => ({
          project_id: projectId!,
          name: list[i]!.name,
          file_path: fp,
          size_bytes: list[i]!.size,
          mime_type: list[i]!.type || null,
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <>
      <PageHeader
        title="Plans du chantier"
        subtitle={`${plans.length} plan(s) · ${project.name}`}
        action={
          <>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.dwg"
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Plus className="mr-1.5 size-4" />
              )}
              Ajouter des plans
            </Button>
          </>
        }
      />

      {plans.length === 0 ? (
        <div
          className={cn(
            "panel grid place-items-center border-2 border-dashed px-6 py-20 text-center",
            dragOver && "border-primary bg-primary/5",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            upload(e.dataTransfer.files);
          }}
        >
          <FileText className="mb-3 size-8 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">Aucun plan</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Déposez vos plans ici (PDF, images, DWG) ou cliquez sur « Ajouter des plans ». Ils
            seront conservés dans les documents du chantier.
          </p>
          <Button className="mt-5" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="mr-1.5 size-4" /> Sélectionner des fichiers
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <ul className="space-y-2">
            {plans.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "panel flex w-full items-start gap-3 p-3 text-left transition-colors",
                    selected?.id === p.id && "border-primary ring-1 ring-primary",
                  )}
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.size_bytes ? formatBytes(p.size_bytes) : ""}
                      {p.mime_type && p.size_bytes ? " · " : ""}
                      {p.mime_type ?? ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="panel p-4">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-semibold">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      Ajouté le {frDate(selected.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {urls[selected.file_path] && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={urls[selected.file_path]} target="_blank" rel="noreferrer">
                          <Download className="mr-1.5 size-4" /> Télécharger
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        remove.mutate({ id: selected.id, file_path: selected.file_path })
                      }
                    >
                      <Trash2 className="mr-1.5 size-4" /> Supprimer
                    </Button>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-md border border-border bg-secondary/30">
                  {urls[selected.file_path] && selected.mime_type?.startsWith("image/") ? (
                    <img
                      src={urls[selected.file_path]}
                      alt={selected.name}
                      className="h-[420px] w-full object-contain"
                    />
                  ) : urls[selected.file_path] && selected.mime_type === "application/pdf" ? (
                    <iframe
                      src={urls[selected.file_path]}
                      title={selected.name}
                      className="h-[420px] w-full"
                    />
                  ) : (
                    <div className="grid h-64 place-items-center gap-2 text-center">
                      <FileText className="size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Aperçu non disponible pour ce type de fichier.
                      </p>
                      {urls[selected.file_path] && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={urls[selected.file_path]} target="_blank" rel="noreferrer">
                            <Download className="mr-1.5 size-4" /> Ouvrir le fichier
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {selected.annotations && Object.keys(selected.annotations).length > 0 && (
                  <div className="mt-3">
                    <Badge variant="secondary">Annoté</Badge>
                  </div>
                )}
              </>
            ) : (
              <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
                Sélectionnez un plan pour l'afficher.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
