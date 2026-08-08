import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type ImportColumn = {
  key: string;
  label: string;
  aliases: string[];
};

export function ImportDialog({
  title,
  description,
  columns,
  onImport,
  trigger,
}: {
  title: string;
  description: string;
  columns: ImportColumn[];
  onImport: (rows: Record<string, string>[]) => Promise<void>;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setRows([]);
      setMissing([]);
    }
  }, [open]);

  async function handleFile(f: File) {
    try {
      const XLSX = await import("xlsx");
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]!]!;
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      const headers = new Set(Object.keys(raw[0] ?? {}).map((h) => h.toLowerCase().trim()));

      const mapped = raw.map((r) => {
        const out: Record<string, string> = {};
        for (const col of columns) {
          const hit = Object.keys(r).find((k) => col.aliases.includes(k.toLowerCase().trim()));
          const v = hit !== undefined ? r[hit] : "";
          out[col.key] = v == null ? "" : String(v).trim();
        }
        return out;
      });

      const miss = columns
        .filter((c) => !c.aliases.some((a) => headers.has(a)))
        .map((c) => c.label);

      setRows(mapped);
      setMissing(miss);
    } catch {
      toast.error("Fichier illisible", {
        description: "Utilisez un fichier CSV, XLS ou XLSX avec une ligne d'en-tête.",
      });
      setRows([]);
    }
  }

  async function onSubmit() {
    setSaving(true);
    try {
      await onImport(rows);
      setOpen(false);
    } catch {
      toast.error("Import impossible", {
        description: "Certaines lignes sont invalides — vérifiez puis réessayez.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid place-items-center rounded-md border border-dashed border-border bg-secondary/30 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Upload className="mb-2 size-6" />
          Choisir un fichier CSV, XLS ou XLSX
        </button>

        <p className="text-xs text-muted-foreground">
          Colonnes reconnues : {columns.map((c) => c.label).join(" · ")}. La première ligne doit
          contenir les en-têtes.
        </p>

        {missing.length > 0 && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              Colonnes non trouvées : {missing.join(", ")}. Les lignes seront importées sans ces
              valeurs.
            </span>
          </p>
        )}

        {rows.length > 0 && (
          <div className="max-h-56 overflow-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-secondary text-left">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="px-2 py-1.5 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 8).map((r, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className="max-w-40 truncate px-2 py-1.5 text-muted-foreground"
                      >
                        {r[c.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 8 && (
              <p className="px-2 py-2 text-center text-muted-foreground">
                … et {rows.length - 8} ligne(s) supplémentaires
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={onSubmit} disabled={saving || rows.length === 0}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Import en cours…
              </>
            ) : (
              `Importer ${rows.length} ligne(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
