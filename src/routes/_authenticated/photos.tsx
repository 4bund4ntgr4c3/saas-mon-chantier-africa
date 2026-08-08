import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Camera, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import {
  useAddPhotos,
  useCategories,
  useDeletePhoto,
  usePhotoUrls,
  usePhotos,
  uploadPhotoFiles,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/photos")({
  head: () => ({
    meta: [
      { title: "Photos de chantier — BâtiBénin" },
      {
        name: "description",
        content: "Galerie de photos de votre chantier, organisée par phase de construction.",
      },
      { property: "og:title", content: "Photos de chantier — BâtiBénin" },
      { property: "og:description", content: "Suivez l'avancement en images, phase par phase." },
    ],
  }),
  component: () => (
    <FeatureGate feature="photos">
      <PhotosPage />
    </FeatureGate>
  ),
});

function PhotosPage() {
  const { project, projectId } = useCurrentProject();
  const { data: photos = [] } = usePhotos(projectId);
  const { data: categories = [] } = useCategories();
  const addPhotos = useAddPhotos();
  const deletePhoto = useDeletePhoto();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const phases = useMemo(
    () => [...new Set(categories.map((c) => c.phase).filter(Boolean))] as string[],
    [categories],
  );
  const phaseOptions = useMemo(
    () => [...phases, "Divers", "Avant / Après"].filter((v, i, arr) => arr.indexOf(v) === i),
    [phases],
  );

  const allPaths = useMemo(() => photos.map((p) => p.file_path).filter(Boolean), [photos]);
  const { data: urls = {} } = usePhotoUrls(allPaths);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof photos>();
    for (const p of photos) {
      const key = p.phase ?? "Sans phase";
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) =>
      b[1][0]!.created_at.localeCompare(a[1][0]!.created_at),
    );
  }, [photos]);

  if (!project) return <EmptyProjectNotice />;

  async function submitUpload(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0 || !projectId) return;
    setUploading(true);
    try {
      const paths = await uploadPhotoFiles(files, projectId);
      if (paths.length > 0) {
        await addPhotos.mutateAsync(
          paths.map((file_path) => ({
            project_id: projectId,
            file_path,
            phase: phase || null,
            caption: caption.trim() || null,
          })),
        );
      }
      setFiles([]);
      setCaption("");
      setOpen(false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Photos de chantier"
        subtitle={`${photos.length} photo(s) · ${grouped.length} phase(s)`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Upload className="mr-1.5 size-4" /> Ajouter des photos
          </Button>
        }
      />

      {photos.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <Camera className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune photo</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajoutez des photos de votre chantier, elles seront organisées par phase de construction
            pour suivre l'avancement.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([phaseName, list]) => (
            <section key={phaseName}>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {phaseName} · {list.length}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((p) => {
                  const url = urls[p.file_path];
                  return (
                    <figure
                      key={p.id}
                      className="group relative overflow-hidden rounded-lg border border-border"
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={p.caption ?? "Photo de chantier"}
                          className="aspect-4/3 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid aspect-4/3 w-full place-items-center bg-secondary/40 text-muted-foreground">
                          <ImageIcon className="size-6" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1.5 top-1.5 size-7 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                        onClick={() => deletePhoto.mutate({ id: p.id, file_path: p.file_path })}
                        aria-label="Supprimer la photo"
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                      {p.caption && (
                        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-xs text-white">
                          {p.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : setOpen(false))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Ajouter des photos</DialogTitle>
            <DialogDescription>
              Sélectionnez plusieurs photos à la fois pour le chantier « {project.name} ».
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitUpload}>
            <div>
              <Label htmlFor="photos_files" className="mb-1.5 block text-xs text-muted-foreground">
                Photos (JPG, PNG…)
              </Label>
              <Input
                id="photos_files"
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              {files.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">{files.length} fichier(s)</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="photos_phase"
                  className="mb-1.5 block text-xs text-muted-foreground"
                >
                  Phase
                </Label>
                <Select value={phase} onValueChange={setPhase}>
                  <SelectTrigger id="photos_phase">
                    <SelectValue placeholder="Sans phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phaseOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="photos_caption"
                  className="mb-1.5 block text-xs text-muted-foreground"
                >
                  Légende
                </Label>
                <Input
                  id="photos_caption"
                  value={caption}
                  placeholder="Ex. Coulage dalle"
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={files.length === 0 || uploading}>
                {uploading ? "Téléversement…" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
