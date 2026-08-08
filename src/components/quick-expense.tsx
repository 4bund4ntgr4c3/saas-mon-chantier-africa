import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import { useCategories, useSaveRow } from "@/lib/data";
import { PAYMENT_METHODS } from "@/lib/format";

/** Saisie rapide d'une dépense sur le chantier courant (2 champs essentiels + poste). */
export function QuickExpenseDialog({
  trigger,
  defaultCategoryId,
}: {
  trigger?: ReactNode;
  defaultCategoryId?: string;
}) {
  const { project, projectId } = useCurrentProject();
  const { data: categories = [] } = useCategories();
  const save = useSaveRow("expenses", "Dépense enregistrée");
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const [method, setMethod] = useState("especes");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const canSave = label.trim().length > 0 && Number(amount) > 0 && !!projectId && !!project;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !canSave) return;
    setSaving(true);
    try {
      await save.mutateAsync({
        values: {
          project_id: projectId,
          label: label.trim(),
          amount: Number(amount),
          category_id: categoryId || null,
          method,
          expense_date: date,
        },
      });
      setLabel("");
      setAmount("");
      setCategoryId(defaultCategoryId ?? "");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : setOpen(false))}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" disabled={!project} title="Ajouter une dépense rapidement">
            <Plus className="mr-1.5 size-4" /> Dépense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Saisie rapide de dépense</DialogTitle>
          <DialogDescription>
            {project ? `Chantier : ${project.name}` : "Sélectionnez d'abord un chantier."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="qe_label" className="mb-1.5 block text-xs text-muted-foreground">
              Libellé *
            </Label>
            <Input
              id="qe_label"
              autoFocus
              placeholder="Ex. Ciment 50 kg, main d'œuvre…"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qe_amount" className="mb-1.5 block text-xs text-muted-foreground">
                Montant (FCFA) *
              </Label>
              <Input
                id="qe_amount"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="qe_date" className="mb-1.5 block text-xs text-muted-foreground">
                Date
              </Label>
              <Input
                id="qe_date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qe_cat" className="mb-1.5 block text-xs text-muted-foreground">
                Poste
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="qe_cat">
                  <SelectValue placeholder="Non classé" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="qe_method" className="mb-1.5 block text-xs text-muted-foreground">
                Mode de paiement
              </Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="qe_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!canSave || saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
