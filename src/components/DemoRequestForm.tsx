import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitDemoRequest, demoRequestSchema } from "@/lib/demo-requests.functions";

const empty = { full_name: "", company: "", email: "", phone: "", message: "" };

export function DemoRequestForm() {
  const submit = useServerFn(submitDemoRequest);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = demoRequestSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await submit({ data: parsed.data });
      setValues(empty);
      toast.success("Demande envoyée", { description: "Notre équipe vous recontacte sous 24h." });
    } catch {
      toast.error("Envoi impossible", { description: "Veuillez réessayer dans un instant." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dr-name">Nom complet *</Label>
          <Input id="dr-name" value={values.full_name} onChange={set("full_name")} maxLength={100} placeholder="Koffi Adjovi" />
          {errors["full_name"] && <p className="text-xs text-destructive">{errors["full_name"]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dr-company">Entreprise</Label>
          <Input id="dr-company" value={values.company} onChange={set("company")} maxLength={120} placeholder="BTP Cotonou SARL" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dr-email">Email *</Label>
          <Input id="dr-email" type="email" value={values.email} onChange={set("email")} maxLength={255} placeholder="vous@entreprise.bj" />
          {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dr-phone">Téléphone</Label>
          <Input id="dr-phone" value={values.phone} onChange={set("phone")} maxLength={40} placeholder="+229 XX XX XX XX" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dr-message">Votre besoin</Label>
        <Textarea
          id="dr-message"
          value={values.message}
          onChange={set("message")}
          maxLength={1000}
          rows={3}
          placeholder="Nombre de chantiers, équipes, besoins spécifiques…"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-sm bg-primary px-8 py-3.5 font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Envoi en cours…" : "Demander une démo"}
      </button>
      <p className="text-xs text-muted-foreground">Réponse sous 24h ouvrées. Aucune carte bancaire requise.</p>
    </form>
  );
}
