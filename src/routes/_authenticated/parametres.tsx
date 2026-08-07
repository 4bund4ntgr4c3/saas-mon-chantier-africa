import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { RecordDialog, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  useCategories,
  useDeleteRow,
  useProfile,
  useSaveRow,
  type Category,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres du compte — BâtiBénin" },
      {
        name: "description",
        content:
          "Modifiez vos informations personnelles et gérez vos postes de dépenses personnalisés pour vos chantiers.",
      },
      { property: "og:title", content: "Paramètres du compte — BâtiBénin" },
      {
        property: "og:description",
        content: "Profil, mot de passe et postes de dépenses personnalisés.",
      },
    ],
  }),
  component: SettingsPage,
});

const PHASES = [
  "Préparation",
  "Terrassement",
  "Fondations",
  "Élévation",
  "Charpente",
  "Toiture",
  "Second œuvre",
  "Finitions",
  "Divers",
  "Autres",
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SettingsPage() {
  const { data: profile } = useProfile();
  const saveProfile = useSaveRow("profiles", "Profil mis à jour");
  const { data: categories = [] } = useCategories();
  const saveCategory = useSaveRow("categories", "Poste enregistré");
  const removeCategory = useDeleteRow("categories");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const fields: Field[] = useMemo(
    () => [
      { name: "name", label: "Nom du poste", required: true, full: true },
      {
        name: "phase",
        label: "Phase du chantier",
        type: "select",
        options: PHASES.map((p) => ({ value: p, label: p })),
      },
      { name: "sort_order", label: "Ordre d'affichage", type: "number" },
    ],
    [],
  );

  const own = categories.filter((c) => c.user_id);
  const shared = categories.filter((c) => !c.user_id);

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.id) return;
    await saveProfile.mutateAsync({
      id: profile.id,
      values: { full_name: fullName.trim() || null, phone: phone.trim() || null },
    });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    toast.success("Mot de passe mis à jour");
  }

  async function submitCategory(v: Values) {
    const name = (v["name"] ?? "").trim();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await saveCategory.mutateAsync({
      ...(editing ? { id: editing.id } : {}),
      values: {
        name,
        slug: slugify(name) || `poste-${Date.now()}`,
        phase: v["phase"] || "Autres",
        sort_order: toNumber(v["sort_order"] ?? "") ?? 100,
        user_id: auth.user.id,
      },
    });
    setEditing(null);
  }

  return (
    <>
      <PageHeader
        title="Paramètres"
        subtitle="Vos informations, votre mot de passe et vos postes de dépenses personnalisés"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 font-display text-base font-semibold">Mon profil</h2>
          <form className="space-y-4" onSubmit={submitProfile}>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Email</Label>
              <Input value={profile?.email ?? ""} readOnly disabled />
            </div>
            <div>
              <Label htmlFor="full_name" className="mb-1.5 block text-xs text-muted-foreground">
                Nom complet
              </Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-1.5 block text-xs text-muted-foreground">
                Téléphone
              </Label>
              <Input
                id="phone"
                value={phone}
                placeholder="+229 ..."
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saveProfile.isPending}>
              Enregistrer mon profil
            </Button>
          </form>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 font-display text-base font-semibold">Mot de passe</h2>
          <form className="space-y-4" onSubmit={changePassword}>
            <div>
              <Label htmlFor="newpwd" className="mb-1.5 block text-xs text-muted-foreground">
                Nouveau mot de passe
              </Label>
              <Input
                id="newpwd"
                type="password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Changer le mot de passe
            </Button>
          </form>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Postes de dépenses</h2>
          <RecordDialog
            title="Nouveau poste"
            fields={fields}
            initial={{ phase: "Autres", sort_order: "100" }}
            onSubmit={submitCategory}
            trigger={
              <Button size="sm">
                <Plus className="mr-1.5 size-4" /> Ajouter un poste
              </Button>
            }
          />
        </div>

        <div className="panel divide-y divide-border">
          {own.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Aucun poste personnalisé. Les postes standards ci-dessous sont disponibles pour tous
              vos chantiers.
            </p>
          )}
          {own.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phase}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setEditing(c)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeCategory.mutate(c.id)}
                aria-label={`Supprimer ${c.name}`}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <h3 className="mb-3 mt-6 text-sm font-medium text-muted-foreground">
          Postes standards ({shared.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {shared.map((c) => (
            <Badge key={c.id} variant="secondary">
              {c.name}
            </Badge>
          ))}
        </div>
      </section>

      {editing && (
        <RecordDialog
          title="Modifier le poste"
          fields={fields}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          initial={{
            name: editing.name,
            phase: editing.phase,
            sort_order: String(editing.sort_order),
          }}
          onSubmit={submitCategory}
        />
      )}
    </>
  );
}
