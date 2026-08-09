import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BellRing,
  FileText,
  Globe,
  Languages,
  Mail,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { RecordDialog, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { COUNTRIES, LANGS, usePreferences } from "@/context/preferences-context";
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
  useMyVerificationDocuments,
  useNotificationPreferences,
  useProfile,
  useProfileVerification,
  useRegisterDeviceToken,
  useSaveRow,
  useSendNotificationEmail,
  useSubmitVerificationDocument,
  useUpdateNotificationPreferences,
  type Category,
} from "@/lib/data";
import { frDate, labelOf, VERIFICATION_DOC_STATUSES, VERIFICATION_DOC_TYPES } from "@/lib/format";

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
  ["marketplace", "Marketplace de prestataires"],
  ["assistant", "Assistant IA"],
];

type PrefKey =
  | "alerts_enabled"
  | "alert_due_payments"
  | "alert_late_payments"
  | "alert_budget"
  | "alert_documents"
  | "alert_projects"
  | "weekly_digest"
  | "push_enabled"
  | "sms_enabled"
  | "whatsapp_enabled";

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
  {
    key: "push_enabled",
    label: "Notifications push",
    hint: "Alertes en temps réel sur vos appareils connectés.",
  },
  {
    key: "sms_enabled",
    label: "Notifications SMS",
    hint: "Alertes importantes envoyées par SMS.",
  },
  {
    key: "whatsapp_enabled",
    label: "Notifications WhatsApp",
    hint: "Partage de devis, commandes, rapports et liens de paiement.",
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
  push_enabled: true,
  sms_enabled: true,
  whatsapp_enabled: true,
};

function VerificationSection() {
  const { data: verification } = useProfileVerification();
  const { data: docs = [] } = useMyVerificationDocuments();
  const submitDoc = useSubmitVerificationDocument();
  const [docType, setDocType] = useState("identite");
  const [note, setNote] = useState("");
  const verified = Boolean(verification?.verified_documents || verification?.verified_identity);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await submitDoc.mutateAsync({ docType, note: note.trim() || null });
    setNote("");
  }

  const badgeStyle = verified
    ? "bg-success text-success-foreground"
    : "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">Vérification du profil</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Renforcez la confiance de vos clients en validant votre identité et vos documents
            professionnels.
          </p>
        </div>
        <Badge className={badgeStyle}>
          <ShieldCheck className="mr-1 size-3" />
          {verified ? "Profil vérifié" : "En attente de validation"}
        </Badge>
      </div>

      {verification && (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <Badge
            variant={verification.verified_identity ? "default" : "outline"}
            className="justify-start"
          >
            <BadgeCheck className="mr-1 size-3" /> Identité
            {verification.verified_identity ? "" : " — à confirmer"}
          </Badge>
          <Badge
            variant={verification.verified_business ? "default" : "outline"}
            className="justify-start"
          >
            <BadgeCheck className="mr-1 size-3" /> Entreprise
            {verification.verified_business ? "" : " — à confirmer"}
          </Badge>
          <Badge
            variant={verification.verified_documents ? "default" : "outline"}
            className="justify-start"
          >
            <BadgeCheck className="mr-1 size-3" /> Documents
            {verification.verified_documents ? "" : " — à confirmer"}
          </Badge>
        </div>
      )}

      <form onSubmit={submit} className="mt-4 space-y-3 rounded-md border border-border p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <FileText className="size-3.5" /> Soumettre un document
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Label htmlFor="doc_type" className="mb-1.5 block text-xs text-muted-foreground">
              Type de document
            </Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger id="doc_type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERIFICATION_DOC_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="doc_note" className="mb-1.5 block text-xs text-muted-foreground">
            Détails (n° RCCM, référence…)
          </Label>
          <Textarea
            id="doc_note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. : Récépissé RCCM n° 2025-B-01234"
            rows={2}
          />
        </div>
        <Button type="submit" disabled={submitDoc.isPending}>
          {submitDoc.isPending ? "Envoi…" : "Soumettre mon document"}
        </Button>
      </form>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Mes documents ({docs.length})
        </h3>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun document soumis pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 p-3">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {labelOf(VERIFICATION_DOC_TYPES, d.doc_type)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.note || "Sans précision"} · soumis le {frDate(d.created_at)}
                    {d.admin_note ? ` · ${d.admin_note}` : ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    d.status === "approuve"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                      : d.status === "rejete"
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-amber-400/40 bg-amber-400/10 text-amber-600"
                  }
                >
                  {labelOf(VERIFICATION_DOC_STATUSES, d.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { data: profile } = useProfile();
  const saveProfile = useSaveRow("profiles", "Profil mis à jour");
  const { data: categories = [] } = useCategories();
  const saveCategory = useSaveRow("categories", "Poste enregistré");
  const removeCategory = useDeleteRow("categories");
  const { data: prefs } = useNotificationPreferences();
  const savePrefs = useUpdateNotificationPreferences();
  const sendEmail = useSendNotificationEmail();
  const registerDevice = useRegisterDeviceToken();
  const { lang, setLang, country, setCountry, currencySymbol, currencyCode } = usePreferences();
  const [permStatus, setPermStatus] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );

  async function enableBrowserNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Votre navigateur ne prend pas en charge les notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    setPermStatus(permission);
    if (permission === "granted") {
      let token = window.localStorage.getItem("device_token_web");
      if (!token) {
        token = `web-${crypto.randomUUID()}`;
        window.localStorage.setItem("device_token_web", token);
      }
      registerDevice.mutate({ token, platform: "web" });
      toast.success("Notifications navigateur activées");
    } else {
      toast.error("Autorisation refusée — activez-la dans votre navigateur");
    }
  }

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
      push_enabled: prefs.push_enabled,
      sms_enabled: prefs.sms_enabled,
      whatsapp_enabled: prefs.whatsapp_enabled,
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
        <VerificationSection />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-base font-semibold">Préférences</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Langue de l'application</p>
                <p className="text-xs text-muted-foreground">Français ou English.</p>
              </div>
              <Languages className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <Select value={lang} onValueChange={(v) => setLang(v as "fr" | "en")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Pays / devise</p>
                <p className="text-xs text-muted-foreground">
                  Affichage des montants en {currencySymbol} ({currencyCode}).
                </p>
              </div>
              <Globe className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <Select
                value={country}
                onValueChange={(v) => setCountry(v as (typeof COUNTRIES)[number]["value"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label} — {c.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

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
                    disabled={
                      key !== "alerts_enabled" &&
                      key !== "push_enabled" &&
                      key !== "sms_enabled" &&
                      key !== "whatsapp_enabled" &&
                      !toggles.alerts_enabled
                    }
                    checked={toggles[key]}
                    onCheckedChange={(v) => setToggle(key, v)}
                    aria-label={label}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Notifications navigateur</p>
                <p className="text-xs text-muted-foreground">
                  {permStatus === "granted"
                    ? "Activées — les nouveaux événements s'affichent même fenêtre fermée."
                    : permStatus === "denied"
                      ? "Bloquées par le navigateur — autorisez-les dans les paramètres du site."
                      : permStatus === "default"
                        ? "Autorisez les notifications du navigateur pour ne rien manquer."
                        : "Non prises en charge par ce navigateur."}
                </p>
              </div>
              {permStatus === "granted" ? (
                <Badge variant="secondary">
                  <BellRing className="mr-1 size-3.5" /> Activé
                </Badge>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={permStatus === "unsupported" || registerDevice.isPending}
                  onClick={enableBrowserNotifications}
                >
                  <BellRing className="mr-1.5 size-4" />
                  Activer
                </Button>
              )}
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
