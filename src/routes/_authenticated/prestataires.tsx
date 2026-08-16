import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  Award,
  Eye,
  LocateFixed,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { AccessBadgeDialog } from "@/components/access-badge-dialog";
import { PointsMap, type MapPoint } from "@/components/points-map";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { frDate, labelOf, PROVIDER_DOMAINS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatDistance, haversineKm, useGeolocation } from "@/lib/geo";
import {
  useAddProviderReview,
  useDeleteRow,
  useProfile,
  useProfileVerification,
  useProviderReviews,
  useProviders,
  useSaveProvider,
  type Provider,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/prestataires")({
  head: () => ({
    meta: [
      { title: "Prestataires certifiés — BâtiBénin" },
      {
        name: "description",
        content:
          "Marketplace de prestataires de services certifiés : maçons, électriciens, architectes, géomètres et plus encore.",
      },
      { property: "og:title", content: "Prestataires certifiés — BâtiBénin" },
      {
        property: "og:description",
        content: "Trouvez des artisans et entreprises certifiés pour vos chantiers.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <ProvidersPage />
    </FeatureGate>
  ),
});

const FIELDS: Field[] = [
  { name: "name", label: "Nom de l'entreprise", required: true, full: true },
  { name: "contact_name", label: "Personne de contact" },
  {
    name: "category",
    label: "Domaine d'activité",
    required: true,
    type: "select",
    options: [...PROVIDER_DOMAINS],
  },
  { name: "services", label: "Services proposés", type: "textarea", full: true },
  { name: "certifications", label: "Certifications / agréments", full: true },
  { name: "years_experience", label: "Années d'expérience", type: "number" },
  { name: "phone", label: "Téléphone", placeholder: "+229 …" },
  { name: "whatsapp", label: "WhatsApp", placeholder: "+229 …" },
  { name: "email", label: "E-mail" },
  { name: "website", label: "Site web" },
  { name: "city", label: "Ville" },
  { name: "commune", label: "Commune" },
  { name: "lat", label: "Latitude (optionnel)", type: "number" },
  { name: "lng", label: "Longitude (optionnel)", type: "number" },
];

function toPayload(v: Values): Record<string, unknown> {
  const g = (k: string) => v[k] ?? "";
  return {
    name: g("name").trim(),
    contact_name: orNull(g("contact_name")),
    category: orNull(g("category")),
    services: orNull(g("services")),
    certifications: orNull(g("certifications")),
    years_experience: toNumber(g("years_experience")),
    phone: orNull(g("phone")),
    whatsapp: orNull(g("whatsapp")),
    email: orNull(g("email")),
    website: orNull(g("website")),
    city: orNull(g("city")),
    commune: orNull(g("commune")),
    lat: toNumber(g("lat")),
    lng: toNumber(g("lng")),
  };
}

const NEARBY_RADII = [2, 5, 10, 25] as const;

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value.toLocaleString("fr-FR")}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{value.toLocaleString("fr-FR")}</span>
    </span>
  );
}

function ProvidersPage() {
  const { data: providers = [] } = useProviders();
  const { data: profile } = useProfile();
  const uid = profile?.id ?? null;
  const save = useSaveProvider("Prestataire enregistré");
  const remove = useDeleteRow("providers");
  const [editing, setEditing] = useState<Provider | null>(null);
  const [detail, setDetail] = useState<Provider | null>(null);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [locate, setLocate] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const { position } = useGeolocation(locate);

  const isOwner = (p: Provider) => !!uid && p.user_id === uid;

  const providerDistances = useMemo(() => {
    const map = new Map<string, number>();
    if (!position) return map;
    for (const p of providers) {
      if (p.lat == null || p.lng == null) continue;
      map.set(p.id, haversineKm(position.lat, position.lng, p.lat, p.lng));
    }
    return map;
  }, [position, providers]);

  const nearbyProviders = useMemo(() => {
    if (!position) return new Set<string>();
    const set = new Set<string>();
    for (const [id, km] of providerDistances) {
      if (km <= radiusKm) set.add(id);
    }
    return set;
  }, [position, radiusKm, providerDistances]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = providers.filter((p) => {
      if (domain !== "all" && p.category !== domain) return false;
      if (certifiedOnly && !p.verified) return false;
      if (locate && position && !nearbyProviders.has(p.id)) return false;
      if (!needle) return true;
      return [p.name, p.services, p.city, p.commune, p.contact_name, p.certifications]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(needle));
    });
    if (locate && position) {
      return [...list].sort(
        (a, b) =>
          (providerDistances.get(a.id) ?? Infinity) - (providerDistances.get(b.id) ?? Infinity),
      );
    }
    return list;
  }, [providers, q, domain, certifiedOnly, locate, position, nearbyProviders, providerDistances]);

  const mapPoints = useMemo<MapPoint[]>(
    () =>
      filtered
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({
          id: p.id,
          lat: p.lat as number,
          lng: p.lng as number,
          title: p.name,
          subtitle: [p.commune, p.city].filter(Boolean).join(" · ") || null,
          kind: "provider" as const,
          distanceKm: providerDistances.get(p.id) ?? null,
          badges: p.category ? [labelOf(PROVIDER_DOMAINS, p.category)] : [],
        })),
    [filtered, providerDistances],
  );

  const certifiedCount = providers.filter((p) => p.verified).length;

  return (
    <>
      <PageHeader
        title="Prestataires"
        subtitle={`${providers.length} prestataire(s) · ${certifiedCount} certifié(s)`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <AccessBadgeDialog />
            <RecordDialog
              title="Référencer un prestataire"
              description="Ajoutez un artisan, bureau d'études ou entreprise du BTP à l'annuaire."
              fields={FIELDS}
              submitLabel="Publier"
              trigger={
                <Button>
                  <Plus className="size-4" /> Ajouter mon entreprise
                </Button>
              }
              onSubmit={async (v) => save.mutateAsync({ values: toPayload(v) })}
            />
          </div>
        }
      />

      <div className="panel mb-5 flex flex-wrap items-center gap-3 p-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (nom, service, ville…)"
          className="w-full sm:w-72"
        />
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Domaine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les domaines</SelectItem>
            {PROVIDER_DOMAINS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={certifiedOnly ? "secondary" : "outline"}
          onClick={() => setCertifiedOnly((v) => !v)}
          className="ml-auto"
        >
          <ShieldCheck className="size-4" /> Certifiés uniquement
        </Button>
        <Button
          variant={locate ? "default" : "outline"}
          onClick={() => setLocate((v) => !v)}
          className={cn(locate && !position && "opacity-70")}
        >
          <LocateFixed className="size-4" />
          {locate ? (position ? "Position activée" : "Localisation…") : "Près de moi"}
        </Button>
        {locate && position && (
          <Select value={String(radiusKm)} onValueChange={(v) => setRadiusKm(Number(v))}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Rayon" />
            </SelectTrigger>
            <SelectContent>
              {NEARBY_RADII.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  Rayon {r} km
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {locate && (
        <div className="mb-5">
          {mapPoints.length > 0 || position ? (
            <PointsMap points={mapPoints} position={position} title="Carte des prestataires" />
          ) : (
            <div className="panel p-6 text-center text-sm text-muted-foreground">
              Aucun prestataire géolocalisé pour l'instant.
            </div>
          )}
          {position && nearbyProviders.size > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {nearbyProviders.size} prestataire(s) dans un rayon de {radiusKm} km
            </p>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          Aucun prestataire ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <article key={p.id} className="panel flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-semibold">{p.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {[p.commune, p.city].filter(Boolean).join(" · ") || "Localisation inconnue"}
                  </p>
                </div>
                {p.verified ? (
                  <Badge className="shrink-0 bg-success text-success-foreground">
                    <ShieldCheck className="mr-1 size-3" /> Certifié
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0">
                    En attente
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Stars value={Number(p.rating)} />
                <span className="text-xs text-muted-foreground">({p.review_count} avis)</span>
                {p.category && (
                  <Badge variant="outline">{labelOf(PROVIDER_DOMAINS, p.category)}</Badge>
                )}
                {providerDistances.has(p.id) && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> à {formatDistance(providerDistances.get(p.id)!)}
                  </span>
                )}
              </div>

              {p.services && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.services}</p>
              )}

              {p.certifications && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.certifications
                    .split("·")
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 rounded-sm bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                      >
                        <Award className="size-3" /> {c}
                      </span>
                    ))}
                </div>
              )}

              {p.years_experience ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {p.years_experience} an{p.years_experience > 1 ? "s" : ""} d'expérience
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <Button size="sm" variant="secondary" onClick={() => setDetail(p)}>
                  <Eye className="size-4" /> Profil
                </Button>
                {p.phone && (
                  <Button asChild size="sm" variant="secondary">
                    <a href={`tel:${p.phone}`}>
                      <Phone className="size-4" /> {p.phone}
                    </a>
                  </Button>
                )}
                {p.whatsapp && (
                  <Button asChild size="icon" variant="secondary" title="WhatsApp">
                    <a
                      href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                  </Button>
                )}
                {isOwner(p) && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditing(p)}
                      title="Modifier"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      title="Supprimer"
                      onClick={() => {
                        if (confirm(`Supprimer ${p.name} ?`)) remove.mutate(p.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {detail && <ProviderDialog provider={detail} onClose={() => setDetail(null)} />}

      {editing && (
        <RecordDialog
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={`Modifier ${editing.name}`}
          fields={FIELDS}
          submitLabel="Enregistrer"
          initial={{
            name: editing.name,
            contact_name: editing.contact_name ?? "",
            category: editing.category ?? "",
            services: editing.services ?? "",
            certifications: editing.certifications ?? "",
            years_experience: editing.years_experience ? String(editing.years_experience) : "",
            phone: editing.phone ?? "",
            whatsapp: editing.whatsapp ?? "",
            email: editing.email ?? "",
            website: editing.website ?? "",
            city: editing.city ?? "",
            commune: editing.commune ?? "",
            lat: editing.lat != null ? String(editing.lat) : "",
            lng: editing.lng != null ? String(editing.lng) : "",
          }}
          onSubmit={async (v) => save.mutateAsync({ id: editing.id, values: toPayload(v) })}
        />
      )}
    </>
  );
}

function ProviderDialog({ provider, onClose }: { provider: Provider; onClose: () => void }) {
  const { data: reviews = [] } = useProviderReviews(provider.id);
  const addReview = useAddProviderReview();
  const { data: verification } = useProfileVerification();
  const verifiedReview = Boolean(
    verification?.verified_documents || verification?.verified_identity,
  );
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await addReview.mutateAsync({
        providerId: provider.id,
        rating: Number(rating),
        comment: comment.trim() || null,
        verified: verifiedReview,
      });
      setComment("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 font-display">
            {provider.name}
            {provider.verified ? (
              <Badge className="bg-success text-success-foreground">
                <ShieldCheck className="mr-1 size-3" /> Certifié
              </Badge>
            ) : (
              <Badge variant="outline">En attente</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={Number(provider.rating)} />
              <span className="text-xs text-muted-foreground">
                {provider.review_count} avis · {provider.years_experience ?? "—"} an(s) d'expérience
              </span>
            </div>
            {provider.category && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{labelOf(PROVIDER_DOMAINS, provider.category)}</Badge>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {[provider.commune, provider.city].filter(Boolean).join(" · ") ||
                    "Localisation inconnue"}
                </span>
              </div>
            )}
          </div>

          {provider.services && (
            <div>
              <h3 className="mb-1.5 font-display text-sm font-semibold">Services</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{provider.services}</p>
            </div>
          )}

          {provider.certifications && (
            <div>
              <h3 className="mb-1.5 font-display text-sm font-semibold">
                Certifications & agréments
              </h3>
              <ul className="space-y-1.5">
                {provider.certifications
                  .split("·")
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-foreground">
                      <ShieldCheck className="size-4 shrink-0 text-success" /> {c}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-1.5 font-display text-sm font-semibold">Contact</h3>
            <div className="flex flex-wrap gap-2">
              {provider.phone && (
                <Button asChild size="sm" variant="secondary">
                  <a href={`tel:${provider.phone}`}>
                    <Phone className="size-4" /> {provider.phone}
                  </a>
                </Button>
              )}
              {provider.whatsapp && (
                <Button asChild size="sm" variant="secondary">
                  <a
                    href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                </Button>
              )}
              {provider.email && (
                <Button asChild size="sm" variant="secondary">
                  <a href={`mailto:${provider.email}`}>
                    <Mail className="size-4" /> {provider.email}
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-display text-sm font-semibold">
              Avis ({reviews.length > 0 ? reviews.length : provider.review_count})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun avis publié pour l'instant.</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-md border border-border bg-secondary/30 p-3">
                    <div className="flex items-center justify-between">
                      <Stars value={Number(r.rating)} />
                      <span className="text-[10px] text-muted-foreground">
                        {frDate(r.created_at)}
                      </span>
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm">{r.comment}</p>}
                    {r.verified && (
                      <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-success">
                        <ShieldCheck className="size-3.5" /> Achat vérifié
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={submitReview}
              className="mt-4 space-y-3 rounded-md border border-border p-3"
            >
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Note</Label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} / 5
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={saving} className="ml-auto">
                  {saving ? "Publication…" : "Laisser un avis"}
                </Button>
              </div>
              <Textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Votre expérience avec ce prestataire…"
              />
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
