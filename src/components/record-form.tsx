import { useEffect, useState, type ReactNode } from "react";
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
import { Textarea } from "@/components/ui/textarea";

export type FieldType = "text" | "number" | "date" | "select" | "textarea";

export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
};

export type Values = Record<string, string>;

export function RecordDialog({
  title,
  description,
  fields,
  initial,
  trigger,
  submitLabel = "Enregistrer",
  onSubmit,
  open,
  onOpenChange,
}: {
  title: string;
  description?: string;
  fields: Field[];
  initial?: Values;
  trigger?: ReactNode;
  submitLabel?: string;
  onSubmit: (values: Values) => Promise<void> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [values, setValues] = useState<Values>(initial ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setValues(initial ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const set = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await onSubmit(values);
              setOpen(false);
            } finally {
              setSaving(false);
            }
          }}
        >
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.full || field.type === "textarea" ? "sm:col-span-2" : undefined}
            >
              <Label htmlFor={field.name} className="mb-1.5 block text-xs text-muted-foreground">
                {field.label}
                {field.required && <span className="text-primary"> *</span>}
              </Label>
              {field.type === "select" ? (
                <Select
                  value={values[field.name] ?? ""}
                  onValueChange={(v) => set(field.name, v)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  rows={3}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  step={field.type === "number" ? "any" : undefined}
                  required={field.required ?? false}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function toNumber(value: string | undefined) {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function orNull(value: string | undefined) {
  return value && value.trim() !== "" ? value.trim() : null;
}
