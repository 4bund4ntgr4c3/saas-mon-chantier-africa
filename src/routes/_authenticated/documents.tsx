import { createFileRoute } from "@tanstack/react-router";
import { FeatureGate } from "@/components/feature-gate";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Download,
  File as FileIcon,
  FileImage,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentProject } from "@/context/project-context";
import {
  useAddDocuments,
  useDeleteDocument,
  useDocumentUrls,
  useDocuments,
  useSaveRow,
  type Document,
  type DocumentCategory,
} from "@/lib/data";
import { DOCUMENT_CATEGORIES, formatBytes, frDate, labelOf } from "@/lib/format";
import { useAccess } from "@/lib/roles";
import { orNull } from "@/components/record-form";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents du chantier — BâtiBénin" },
      {
        name: "description",
        content:
          "Plans, permis de construire, factures, contrats et photos du chantier : centralisez les pièces de votre construction et suivez les documents manquants.",
      },
      { property: "og:title", content: "Documents du chantier — BâtiBénin" },
      {
        property: "og:description",
        content: "Archivez et retrouvez toutes les pièces de votre projet de construction.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="documents">
      <DocumentsPage />
    </FeatureGate>
  ),
});

const REQUIRED_PIECES = DOCUMENT_CATEGORIES.filter((c) => c.value !== "autre");

function fileIcon(mime: string | null) {
  if (!mime) return <FileIcon className="size-5 text-muted-foreground" />;
  if (mime.startsWith("image/")) return <FileImage className="size-5 text-accent" />;
  if (mime === "application/pdf") return <FileText className="size-5 text-primary" />;
  return <FileIcon className="size-5 text-muted-foreground" />;
}

function DocumentsPage() {
  const { project, projectId } = useCurrentProject();
  const { data: documents = [] } = useDocuments(projectId);
  const addDocs = useAddDocuments();
  const remove = useDeleteDocument();
  const editDoc = useSaveRow("documents", "Document mis à jour");
  const { canEdit } = useAccess("documents");

  const [catFilter, setCatFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  const paths = useMemo(
    () => documents.map((d) => d.file_path).filter((p): p is string => !!p),
    [documents],
  );
  const { data: urls = {} } = useDocumentUrls(paths);

  const filtered = useMemo(
    () => (catFilter === "all" ? documents : documents.filter((d) => d.category === catFilter)),
    [documents, catFilter],
  );

  const byCategory = useMemo(() => {
    const present = new Set(documents.map((d) => d.category));
    return REQUIRED_PIECES.map((c) => ({
      ...c,
      present: present.has(c.value as DocumentCategory),
    }));
  }, [documents]);

  const missingCount = byCategory.filter((c) => !c.present).length;

  if (!project) return <EmptyProjectNotice />;

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle={`${documents.length} pièce(s) archivée(s) · ${missingCount} catégorie(s) à compléter`}
        action={
          canEdit && (
            <UploadDialog
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              projectId={projectId!}
              onAdd={addDocs.mutateAsync}
            />
          )
        }
      />

      {/* Pièces manquantes */}
      <section className="mb-5 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
          <FolderOpen className="size-4 text-primary" /> Statut des pièces du chantier
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {byCategory.map((c) => (
            <div
              key={c.value}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm"
            >
              <span className={c.present ? "" : "text-muted-foreground"}>{c.label}</span>
              {c.present ? (
                <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600">
                  <CheckCircle2 className="size-3.5" /> En stock
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  Manquant
                </Badge>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Filtres */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {DOCUMENT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} document(s) affiché(s)
        </span>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-14 text-center">
          <FolderOpen className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aucun document dans cette catégorie pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <article key={d.id} className="panel flex flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {fileIcon(d.mime_type)}
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{d.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatBytes(d.size_bytes)}
                      {d.expiry_date && (
                        <>
                          {" · "}
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="size-3" /> Échéance {frDate(d.expiry_date)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {labelOf(DOCUMENT_CATEGORIES, d.category)}
                </Badge>
              </div>

              {d.notes && (
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{d.notes}</p>
              )}

              <div className="mt-4 flex flex-1 items-end gap-2">
                {d.file_path && urls[d.file_path] ? (
                  <Button asChild size="sm" variant="secondary">
                    <a href={urls[d.file_path]} target="_blank" rel="noreferrer">
                      <Download className="size-4" /> Télécharger
                    </a>
                  </Button>
                ) : d.file_path && canEdit ? (
                  <span className="text-xs text-muted-foreground">Téléversement…</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Pièce de référence</span>
                )}
                {canEdit && (
                  <div className="ml-auto flex gap-1">
                    <EditDialog
                      doc={d}
                      onSave={(v) => editDoc.mutateAsync({ id: d.id, values: v })}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm(`Supprimer « ${d.name} » ?`))
                          remove.mutate({ id: d.id, file_path: d.file_path });
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  projectId,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  onAdd: ReturnType<typeof useAddDocuments>["mutateAsync"];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("autre");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFiles([]);
      setName("");
      setCategory("autre");
      setExpiryDate("");
      setNotes("");
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setSaving(true);
    try {
      const { uploadDocumentFiles } = await import("@/lib/data");
      const paths = await uploadDocumentFiles(files, projectId);
      const baseName = name.trim() || files[0]!.name.replace(/\.[^.]+$/, "");
      const docs = files.map((f, i) => ({
        project_id: projectId,
        name: files.length > 1 ? `${baseName} — ${f.name}` : baseName,
        category,
        file_path: paths[i] ?? null,
        size_bytes: f.size,
        mime_type: f.type || null,
        expiry_date: expiryDate || null,
        notes: orNull(notes),
      }));
      await onAdd(docs);
      onOpenChange(false);
    } catch {
      toast.error("Téléversement impossible", {
        description: "Vérifiez la connexion puis réessayez.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Ajouter des documents
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Téléverser des pièces</DialogTitle>
          <DialogDescription>
            Plans, permis, factures, contrats ou photos du chantier — stockés de façon privée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              if (picked.length > 0) {
                setFiles(picked);
                if (!name.trim()) setName(picked[0]!.name.replace(/\.[^.]+$/, ""));
              }
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid place-items-center rounded-md border border-dashed border-border bg-secondary/30 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Upload className="mb-2 size-6" />
            {files.length > 0
              ? `${files.length} fichier(s) sélectionné(s)`
              : "Choisir des fichiers (PDF, images…)"}
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="doc-name">Nom du document *</Label>
              <Input
                id="doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Plan architectural RDC"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-cat">Catégorie</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                <SelectTrigger id="doc-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-exp">Date d'échéance</Label>
              <Input
                id="doc-exp"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="doc-notes">Notes</Label>
              <Textarea
                id="doc-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Référence, numéro, émetteur…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving || files.length === 0}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Téléversement…
                </>
              ) : (
                "Téléverser"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  doc,
  onSave,
}: {
  doc: Document;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>(doc.category);
  const [expiryDate, setExpiryDate] = useState(doc.expiry_date ?? "");
  const [notes, setNotes] = useState(doc.notes ?? "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <FileText className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{doc.name}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSave({ category, expiry_date: expiryDate || null, notes: orNull(notes) });
            setOpen(false);
          }}
          className="grid gap-4"
        >
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date d'échéance</Label>
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
