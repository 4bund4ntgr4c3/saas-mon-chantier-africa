import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Mail, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { RecordDialog, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCOUNT_TYPES,
  accessFor,
  useAccountType,
  type AccountType,
  type Feature,
} from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import {
  useCategories,
  useDeleteRow,
  useNotificationPreferences,
  useProfile,
  useSaveRow,
  useSendNotificationEmail,
  useUpdateNotificationPreferences,
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

const FEATURE_LABELS: [Feature, string][] = [
  ["projets", "Projets"],
  ["journal", "Journal de chantier"],
  ["budget", "Budget"],
  ["depenses", "Dépenses"],
  ["devis", "Devis"],
  ["paiements", "Paiements"],
  ["fournisseurs", "Fournisseurs"],
  ["entreprises", "Entreprises"],
  ["facturation", "Facturation"],
  ["stock", "Stock & matériaux"],
  ["photos", "Photos de chantier"],
  ["taches", "Tâches & planning"],
  ["partage", "Partage"],
];

type PrefKey =
  | "alerts_enabled"
  | "alert_due_payments"
  | "alert_late_payments"
  | "alert_budget"
  | "alert_documents"
  | "alert_projects"
  | "weekly_digest";

const NOTIFICATION_TOGGLES: { key: PrefKey; label: string; hint: string }[] = [
  {
    key: "alerts_enabled",
    label: "Activer les alertes e-mail",
    hint: "Si désactivé, aucun e-mail ne vous est envoyé.",
  },
  {
    key: "alert_due_payments",
    label: "Paiements à échéance",
    hint: "Rappels pour les échéances dans les 7 prochains jours.",
  },
  {
    key: "alert_late_payments",
    label: "Paiements en retard",
    hint: "Échéances dépassées non réglées.",
  },
  {
    key: "alert_budget",
    label: "Postes de budget dépassés",
    hint: "Plus de 80 % du prévu dépensé sur un poste.",
  },
  {
    key: "alert_documents",
    label: "Pièces réglementaires manquantes",
    hint: "Plans, permis de construire, acte de vente, contrat.",
  },
  {
    key: "alert_projects",
    label: "Chantiers hors délai",
    hint: "Date de fin prévue dépassée.",
  },
  {
    key: "weekly_digest",
    label: "Récapitulatif hebdomadaire",
    hint: "Résumé de vos points d'attention chaque début de semaine.",
  },
];

const TOGGLE_DEFAULTS: Record<PrefKey, boolean> = {
  alerts_enabled: true,
  alert_due_payments: true,
  alert_late_payments: true,
  alert_budget: true,
  alert_documents: true,
  alert_projects: true,
  weekly_digest: true,
};

function SettingsPage() {
  const { data: profile } = useProfile();
  const saveProfile = useSaveRow("profiles", "Profil mis à jour");
  const { data: categories = [] } = useCategories();
  const saveCategory = useSaveRow("categories", "Poste enregistré");
  const removeCategory = useDeleteRow("categories");
  const { data: prefs } = useNotificationPreferences();
  const savePrefs = useUpdateNotificationPreferences();
  const sendEmail = useSendNotificationEmail();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const { type: accountType } = useAccountType();
  const [pendingType, setPendingType] = useState<AccountType | null>(null);
  const selectedType = pendingType ?? accountType;
  const [prefEmail, setPrefEmail] = useState("");
  const [toggles, setToggles] = useState<Record<PrefKey, boolean>>(TOGGLE_DEFAULTS);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  useEffect(() => {
    if (!prefs) return;
    setPrefEmail(prefs.email ?? profile?.email ?? "");
    setToggles((t) => ({
      ...t,
      alerts_enabled: prefs.alerts_enabled,
      alert_due_payments: prefs.alert_due_payments,
      alert_late_payments: prefs.alert_late_payments,
      alert_budget: prefs.alert_budget,
      alert_documents: prefs.alert_documents,
      alert_projects: prefs.alert_projects,
      weekly_digest: prefs.weekly_digest,
    }));
  }, [prefs, profile]);

  function setToggle(key: PrefKey, value: boolean) {
    setToggles((t) => ({ ...t, [key]: value }));
  }

  async function submitPrefs(e: React.FormEvent) {
    e.preventDefault();
    if (!prefs?.user_id) return;
    await savePrefs.mutateAsync({
      userId: prefs.user_id,
      values: { email: prefEmail.trim() || null, ...toggles },
    });
  }

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
      values: {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        account_type: selectedType,
      },
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
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Type de compte</Label>
              <Select value={selectedType} onValueChange={(v) => setPendingType(v as AccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {ACCOUNT_TYPES.find((t) => t.value === selectedType)?.description}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {FEATURE_LABELS.map(([feature, label]) => {
                  const access = accessFor(selectedType, feature);
                  return (
                    <li key={feature} className="flex items-center justify-between gap-3">
                      <span>{label}</span>
                      <Badge variant={access === "full" ? "default" : "outline"}>
                        {access === "full"
                          ? "Complet"
                          : access === "read"
                            ? "Consultation"
                            : "Masqué"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
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
        <h2 className="mb-3 font-display text-base font-semibold">Notifications e-mail</h2>
        {prefs === undefined ? (
          <div className="panel p-5 text-sm text-muted-foreground">Chargement…</div>
        ) : prefs === null ? (
          <div className="panel p-5 text-sm text-muted-foreground">
            Connectez-vous à votre compte pour recevoir les e-mails d'alerte et le récapitulatif
            hebdomadaire.
          </div>
        ) : (
          <form onSubmit={submitPrefs} className="panel space-y-4 p-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">À quelle adresse recevoir vos alertes ?</p>
                  <p className="text-xs text-muted-foreground">
                    Un e-mail quotidien en cas d'alerte (échéances, retards, dépassements, pièces
                    manquantes, délais) et un récapitulatif hebdomadaire.
                  </p>
                </div>
                <Mail className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor="pref_email" className="mb-1.5 block text-xs text-muted-foreground">
                Adresse e-mail
              </Label>
              <Input
                id="pref_email"
                type="email"
                value={prefEmail}
                placeholder={profile?.email ?? "vous@exemple.com"}
                onChange={(e) => setPrefEmail(e.target.value)}
              />
            </div>

            <div className="divide-y divide-border rounded-lg border border-border">
              {NOTIFICATION_TOGGLES.map(({ key, label, hint }) => (
                <div key={key} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                  <Switch
                    disabled={key !== "alerts_enabled" && !toggles.alerts_enabled}
                    checked={toggles[key]}
                    onCheckedChange={(v) => setToggle(key, v)}
                    aria-label={label}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={savePrefs.isPending}>
                {savePrefs.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={sendEmail.isPending || !toggles.alerts_enabled}
                onClick={() => sendEmail.mutate("test")}
              >
                <Mail className="mr-1.5 size-4" />
                E-mail de test
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={sendEmail.isPending || !toggles.alerts_enabled}
                onClick={() => sendEmail.mutate("now")}
              >
                <Send className="mr-1.5 size-4" />
                Envoyer les alertes maintenant
              </Button>
            </div>
          </form>
        )}
      </section>

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
