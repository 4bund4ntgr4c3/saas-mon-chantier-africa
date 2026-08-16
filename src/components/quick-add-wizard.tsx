import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Plus, Sparkles } from "lucide-react";
import { DictationButton } from "@/components/dictation-button";
import { type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { normalizeSpokenNumber, parseSpokenItems, type SpokenItem } from "@/lib/spoken-item";
import { isDictationSupported } from "@/lib/use-dictation";

/**
 * Wizard « saisie guidée » : ajout d'éléments pas à pas, pensé pour les débutants.
 * Étape 1 — dicter (ou écrire) l'élément en une phrase, analysée automatiquement ;
 * étapes suivantes — un champ à la fois (dictée possible sur chaque champ) ;
 * récapitulatif — puis mode continu : « Ajouter un autre… » réouvre la saisie.
 */

export type WizardParseMapping = {
  designation?: string;
  quantity?: string;
  unit?: string;
  unitPrice?: string;
};

const DEFAULT_MAPPING: WizardParseMapping = {
  designation: "name",
  quantity: "quantity",
  unit: "unit",
  unitPrice: "unit_price",
};

type Phase = "dictation" | "steps" | "multi" | "recap" | "saved";

function normalizeLoose(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Cherche une option de select correspondant à la transcription dictée. */
function matchSelectOption(transcript: string, field: Field): string | null {
  const t = normalizeLoose(transcript);
  if (!t || field.type !== "select") return null;
  const options = field.options ?? [];
  for (const o of options) {
    if (normalizeLoose(o.label) === t || normalizeLoose(o.value) === t) return o.value;
  }
  for (const o of options) {
    if (normalizeLoose(o.label).includes(t) || t.includes(normalizeLoose(o.label))) {
      return o.value;
    }
  }
  return null;
}

export function QuickAddWizard({
  title,
  description,
  fields,
  initial,
  trigger,
  itemNoun = "élément",
  parseMapping = DEFAULT_MAPPING,
  open,
  onOpenChange,
  onSubmit,
}: {
  title: string;
  description?: string;
  fields: Field[];
  initial?: Values;
  trigger?: ReactNode;
  itemNoun?: string;
  parseMapping?: WizardParseMapping;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (values: Values) => Promise<void> | void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [phase, setPhase] = useState<Phase>("dictation");
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Values>(initial ?? {});
  const [sentence, setSentence] = useState("");
  const [parseHint, setParseHint] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<SpokenItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [dictationSupported] = useState(() => isDictationSupported());

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setPhase("dictation");
      setStepIndex(0);
      setValues(initial ?? {});
      setSentence("");
      setParseHint(null);
      setRecognizedItems(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const set = (name: string, value: string) => setValues((prev) => ({ ...prev, [name]: value }));

  const itemToValues = (item: SpokenItem): Values => {
    const out: Values = {};
    const pairs: [string | undefined, string | null][] = [
      [parseMapping.designation, item.designation],
      [parseMapping.quantity, item.quantity !== null ? String(item.quantity) : null],
      [parseMapping.unit, item.unit],
      [parseMapping.unitPrice, item.unit_price !== null ? String(item.unit_price) : null],
    ];
    for (const [fieldName, raw] of pairs) {
      if (!fieldName || raw === null) continue;
      if (!fields.some((f) => f.name === fieldName)) continue;
      out[fieldName] = raw;
    }
    return out;
  };

  function startStepsWith(prefill: Values) {
    const merged = { ...(initial ?? {}), ...prefill };
    setValues(merged);
    setRecognizedItems(null);
    const firstEmpty = fields.findIndex((f) => !(merged[f.name] ?? "").trim());
    setStepIndex(firstEmpty === -1 ? 0 : firstEmpty);
    setPhase("steps");
  }

  function analyzeSentence() {
    const items = parseSpokenItems(sentence);
    if (items.length === 0) {
      setParseHint("Aucun élément n'a été reconnu dans la phrase — poursuivez champ par champ.");
      startStepsWith({});
      return;
    }
    setParseHint(null);
    if (items.length === 1 && items[0]) {
      startStepsWith(itemToValues(items[0]));
      return;
    }
    setRecognizedItems(items);
    setPhase("multi");
  }

  function next() {
    if (stepIndex < fields.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }
    setPhase("recap");
  }

  async function saveOne(payload: Values) {
    setSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    if (recognizedItems === null) {
      await saveOne(values);
      setPhase("saved");
      return;
    }
    const base = initial ?? {};
    setSaving(true);
    try {
      for (const item of recognizedItems) {
        await onSubmit({ ...base, ...itemToValues(item) });
      }
      setPhase("saved");
    } finally {
      setSaving(false);
    }
  }

  function resetForAnother() {
    setSentence("");
    setValues(initial ?? {});
    setStepIndex(0);
    setParseHint(null);
    setRecognizedItems(null);
    setPhase("dictation");
  }

  const field = fields[stepIndex];
  const progress =
    phase === "saved"
      ? 100
      : phase === "recap"
        ? 100
        : phase === "steps" && field
          ? (stepIndex / fields.length) * 100
          : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Progress value={progress} className="h-1.5" />

        {phase === "dictation" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Textarea
                rows={3}
                value={sentence}
                placeholder="Parlez naturellement : « 10 sacs de ciment à 4500 francs »"
                onChange={(e) => setSentence(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (sentence.trim()) analyzeSentence();
                  }
                }}
              />
              <DictationButton
                className="shrink-0"
                label="Dicter l'élément en une phrase"
                onTranscript={(t) => setSentence((prev) => (prev ? `${prev} ${t}` : t))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {dictationSupported
                ? "Une seule phrase suffit : la quantité, l'unité et le prix sont reconnus automatiquement."
                : "La dictée vocale n'est pas disponible sur ce navigateur — écrivez la phrase ou poursuivez champ par champ."}
            </p>
            {parseHint && <p className="text-xs text-primary">{parseHint}</p>}
            <div className="flex justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => startStepsWith({})}>
                Saisir champ par champ
              </Button>
              <Button type="button" disabled={!sentence.trim()} onClick={analyzeSentence}>
                <Sparkles className="mr-1.5 size-4" /> Analyser la phrase
              </Button>
            </div>
          </div>
        )}

        {phase === "steps" && field && (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Étape {stepIndex + 1} / {fields.length}
            </p>
            {parseHint && stepIndex === 0 && <p className="text-xs text-primary">{parseHint}</p>}
            <div>
              <Label
                htmlFor={`wizard-${field.name}`}
                className="mb-1.5 block text-base font-medium"
              >
                {field.label}
                {field.required && <span className="text-primary"> *</span>}
              </Label>
              <div className="flex items-start gap-2">
                {field.type === "select" ? (
                  <Select
                    value={values[field.name] ?? ""}
                    onValueChange={(v) => set(field.name, v)}
                  >
                    <SelectTrigger id={`wizard-${field.name}`} className="flex-1">
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
                    id={`wizard-${field.name}`}
                    rows={3}
                    className="flex-1"
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder ?? ""}
                    onChange={(e) => set(field.name, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`wizard-${field.name}`}
                    className="flex-1"
                    type={
                      field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
                    }
                    step={field.type === "number" ? "any" : undefined}
                    required={field.required ?? false}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder ?? ""}
                    onChange={(e) => set(field.name, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!(field.required && !(values[field.name] ?? "").trim())) next();
                      }
                    }}
                  />
                )}
                <DictationButton
                  className="mt-0.5 shrink-0"
                  label={`Dicter « ${field.label} »`}
                  onTranscript={(t) => {
                    if (field.type === "number") {
                      set(field.name, normalizeSpokenNumber(t));
                      return;
                    }
                    const option = matchSelectOption(t, field);
                    if (option !== null) {
                      set(field.name, option);
                      return;
                    }
                    set(field.name, t);
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {field.required
                  ? "Ce champ est obligatoire."
                  : "Champ optionnel — passez à l'étape suivante si besoin."}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (stepIndex === 0) setPhase("dictation");
                  else setStepIndex(stepIndex - 1);
                }}
              >
                <ChevronLeft className="mr-1 size-4" /> Précédent
              </Button>
              <Button
                type="button"
                disabled={field.required && !(values[field.name] ?? "").trim()}
                onClick={next}
              >
                {stepIndex === fields.length - 1 ? "Récapitulatif" : "Suivant"}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}

        {phase === "multi" && recognizedItems !== null && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {recognizedItems.length} éléments reconnus dans la phrase. Vérifiez puis enregistrez
              tout d'un coup.
            </p>
            <ul className="space-y-2">
              {recognizedItems.map((item, index) => (
                <li key={index} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">
                    {item.designation ?? `Élément ${index + 1}`}
                    {item.quantity !== null && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {item.quantity} {item.unit ?? ""}
                      </span>
                    )}
                  </p>
                  {item.unit_price !== null && (
                    <p className="num text-xs text-muted-foreground">
                      Prix unitaire : {item.unit_price} FCFA
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const first = recognizedItems[0];
                  startStepsWith(first ? itemToValues(first) : {});
                }}
              >
                Reprendre champ par champ
              </Button>
              <Button type="button" disabled={saving} onClick={saveAll}>
                {saving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                Enregistrer les {recognizedItems.length} éléments
              </Button>
            </div>
          </div>
        )}

        {phase === "recap" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Vérifiez avant d'enregistrer :</p>
            <dl className="space-y-1.5">
              {fields.map((f) => {
                const raw = (values[f.name] ?? "").trim();
                if (!raw) return null;
                const option = f.options?.find((o) => o.value === raw);
                return (
                  <div key={f.name} className="flex justify-between gap-3 text-sm">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right font-medium">{option ? option.label : raw}</dd>
                  </div>
                );
              })}
            </dl>
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => setPhase("steps")}>
                <ChevronLeft className="mr-1 size-4" /> Modifier
              </Button>
              <Button type="button" disabled={saving} onClick={saveAll}>
                {saving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                Enregistrer
              </Button>
            </div>
          </div>
        )}

        {phase === "saved" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <p className="font-medium">
                {recognizedItems && recognizedItems.length > 1
                  ? `${recognizedItems.length} éléments enregistrés.`
                  : "Enregistré."}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Terminer
              </Button>
              <Button type="button" onClick={resetForAnother}>
                <Plus className="mr-1.5 size-4" /> Ajouter un autre {itemNoun}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
