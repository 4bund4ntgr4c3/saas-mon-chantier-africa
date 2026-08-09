import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Banknote, CheckCircle2, FileText, Handshake, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate, ReadOnlyNotice } from "@/components/feature-gate";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAccess } from "@/lib/roles";
import {
  useDeleteRow,
  useMyQuoteBids,
  useMyQuoteRequests,
  useProfile,
  useQuoteBids,
  useQuoteRequests,
  useSaveRow,
  type QuoteRequest,
} from "@/lib/data";
import {
  fcfa,
  frDate,
  labelOf,
  PROVIDER_DOMAINS,
  QUOTE_BID_STATUSES,
  QUOTE_REQUEST_STATUSES,
} from "@/lib/format";

export const Route = createFileRoute("/_authenticated/demandes-devis")({
  head: () => ({
    meta: [
      { title: "Demandes de devis — BâtiBénin" },
      {
        name: "description",
        content:
          "Décrivez un besoin de construction et recevez des devis chiffrés de prestataires certifiés, puis comparez et choisissez.",
      },
      { property: "og:title", content: "Demandes de devis — BâtiBénin" },
      {
        property: "og:description",
        content: "Recevez et comparez des devis de prestataires pour vos travaux.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <ReadOnlyNotice feature="marketplace" />
      <DemandeDevisPage />
    </FeatureGate>
  ),
});

const REQUEST_FIELDS: Field[] = [
  { name: "title", label: "Titre du besoin", required: true, full: true },
  {
    name: "category",
    label: "Domaine",
    type: "select",
    options: [...PROVIDER_DOMAINS],
  },
  {
    name: "description",
    label: "Description détaillée (surface, contraintes…)",
    type: "textarea",
    full: true,
  },
  { name: "budget_min", label: "Budget min (FCFA)", type: "number" },
  { name: "budget_max", label: "Budget max (FCFA)", type: "number" },
  { name: "city", label: "Ville" },
  { name: "commune", label: "Commune" },
  { name: "deadline", label: "Date limite de réponse", type: "date" },
];

const BID_FIELDS: Field[] = [
  { name: "amount", label: "Montant de votre offre (FCFA)", type: "number", required: true },
  { name: "message", label: "Message / détails de l'offre", type: "textarea", full: true },
];

function DemandeDevisPage() {
  const { canEdit } = useAccess("marketplace");
  const { data: profile } = useProfile();
  const uid = profile?.id ?? null;
  const { data: myRequests = [] } = useMyQuoteRequests();
  const { data: allRequests = [] } = useQuoteRequests();
  const { data: myBids = [] } = useMyQuoteBids();
  const saveRequest = useSaveRow("quote_requests", "Demande publiée");
  const removeRequest = useDeleteRow("quote_requests");
  const saveBid = useSaveRow("quote_bids", "Offre envoyée");
  const award = useSaveRow("quote_requests", "Devis attribué");
  const [tab, setTab] = useState<string>("mes");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const myBidByRequest = useMemo(() => new Map(myBids.map((b) => [b.request_id, b])), [myBids]);

  const othersOpen = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allRequests.filter((r) => {
      if (uid && r.user_id === uid) return false;
      if (r.status !== "ouverte") return false;
      if (cat !== "all" && r.category !== cat) return false;
      if (!needle) return true;
      return [r.title, r.description, r.city, r.commune, r.category]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(needle));
    });
  }, [allRequests, uid, q, cat]);

  function toPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      title: g("title").trim(),
      category: orNull(g("category")),
      description: orNull(g("description")),
      budget_min: toNumber(g("budget_min")) ?? undefined,
      budget_max: toNumber(g("budget_max")) ?? undefined,
      city: orNull(g("city")),
      commune: orNull(g("commune")),
      deadline: orNull(g("deadline")),
    };
  }

  return (
    <>
      <PageHeader
        title="Demandes de devis"
        subtitle={`${myRequests.length} demande(s) en cours · ${othersOpen.length} besoin(s) ouvert(s) aux offres`}
        action={
          canEdit ? (
            <RecordDialog
              title="Publier une demande de devis"
              description="Décrivez votre besoin : les prestataires certifiés vous enverront leurs offres chiffrées."
              fields={REQUEST_FIELDS}
              submitLabel="Publier"
              trigger={
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" /> Nouvelle demande
                </Button>
              }
              onSubmit={async (v) => saveRequest.mutateAsync({ values: toPayload(v) })}
            />
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList>
          <TabsTrigger value="mes">Mes demandes ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="repondre">Répondre aux besoins ({othersOpen.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "mes" ? (
        <MyRequestsSection
          requests={myRequests}
          canEdit={canEdit}
          onRemove={(r) => {
            if (confirm("Supprimer cette demande ?")) removeRequest.mutate(r.id);
          }}
          onAward={(r, bid) =>
            award.mutateAsync({ id: r.id, values: { status: "attribuee", winner_bid_id: bid.id } })
          }
        />
      ) : (
        <>
          <div className="panel mb-5 flex flex-wrap items-center gap-3 p-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (titre, ville, description…)"
              className="w-full sm:w-72"
            />
            <Select value={cat} onValueChange={setCat}>
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
          </div>

          {othersOpen.length === 0 ? (
            <div className="panel grid place-items-center px-6 py-16 text-center">
              <Handshake className="mb-3 size-8 text-primary" />
              <h2 className="font-display text-lg font-semibold">Aucun besoin ouvert</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Aucune demande de devis ouverte ne correspond à votre recherche. Revenez plus tard !
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {othersOpen.map((r) => {
                const myBid = uid ? myBidByRequest.get(r.id) : undefined;
                return (
                  <li key={r.id} className="panel p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-display text-sm font-semibold">
                          {r.title}
                          {r.category && (
                            <Badge variant="outline">{labelOf(PROVIDER_DOMAINS, r.category)}</Badge>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[r.city, r.commune].filter(Boolean).join(" · ") ||
                            "Localisation inconnue"}
                          {r.deadline && ` · réponse avant le ${frDate(r.deadline)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        {r.budget_min || r.budget_max ? (
                          <p className="text-sm font-semibold text-primary">
                            {r.budget_min && r.budget_max
                              ? `${fcfa(Number(r.budget_min))} – ${fcfa(Number(r.budget_max))}`
                              : fcfa(Number(r.budget_min ?? r.budget_max))}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Budget non communiqué</p>
                        )}
                      </div>
                    </div>

                    {r.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                    )}

                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                      {myBid ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle2 className="mr-1 size-3" /> Offre envoyée ·{" "}
                          {fcfa(Number(myBid.amount))}
                        </Badge>
                      ) : canEdit ? (
                        <RecordDialog
                          title={`Faire une offre — ${r.title}`}
                          fields={BID_FIELDS}
                          submitLabel="Envoyer mon offre"
                          trigger={
                            <Button size="sm" variant="secondary">
                              <Banknote className="mr-1.5 size-4" /> Proposer un devis
                            </Button>
                          }
                          onSubmit={async (v) =>
                            saveBid.mutateAsync({
                              values: {
                                request_id: r.id,
                                amount: toNumber(v["amount"] ?? "") ?? 0,
                                message: orNull(v["message"]),
                              },
                            })
                          }
                        />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}

function MyRequestsSection({
  requests,
  canEdit,
  onRemove,
  onAward,
}: {
  requests: QuoteRequest[];
  canEdit: boolean;
  onRemove: (r: QuoteRequest) => void;
  onAward: (r: QuoteRequest, bid: { id: string }) => void;
}) {
  return (
    <div>
      {requests.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <FileText className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune demande</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Publiez une demande de devis pour recevoir des offres chiffrées de prestataires.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <Fragment key={r.id}>
              <RequestCard
                request={r}
                canEdit={canEdit}
                onRemove={() => onRemove(r)}
                onAward={(bid) => onAward(r, bid)}
              />
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({
  request,
  canEdit,
  onRemove,
  onAward,
}: {
  request: QuoteRequest;
  canEdit: boolean;
  onRemove: () => void;
  onAward: (bid: { id: string }) => void;
}) {
  const { data: bids = [] } = useQuoteBids(request.id);
  const isAttributed = request.status === "attribuee";
  const winner = bids.find((b) => b.id === request.winner_bid_id);

  return (
    <li className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-sm font-semibold">
            {request.title}
            {request.category && (
              <Badge variant="outline">{labelOf(PROVIDER_DOMAINS, request.category)}</Badge>
            )}
            <Badge
              variant={isAttributed ? "default" : "outline"}
              className={isAttributed ? "bg-success text-success-foreground" : undefined}
            >
              {labelOf(QUOTE_REQUEST_STATUSES, request.status)}
            </Badge>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[request.city, request.commune].filter(Boolean).join(" · ") || "Localisation inconnue"}
            {request.deadline && ` · réponse avant le ${frDate(request.deadline)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            {request.budget_min || request.budget_max
              ? request.budget_min && request.budget_max
                ? `${fcfa(Number(request.budget_min))} – ${fcfa(Number(request.budget_max))}`
                : fcfa(Number(request.budget_min ?? request.budget_max))
              : "Budget libre"}
          </span>
        </div>
      </div>

      {request.description && (
        <p className="mt-2 text-sm text-muted-foreground">{request.description}</p>
      )}

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Offres reçues ({bids.length})
        </p>
        {bids.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune offre pour l'instant. Partagez votre demande pour attirer des prestataires.
          </p>
        ) : (
          <ul className="space-y-2">
            {bids.map((b) => {
              const isWinner = b.id === request.winner_bid_id;
              return (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="num font-semibold text-primary">
                        {fcfa(Number(b.amount))}
                      </span>
                      <Badge variant="outline">{labelOf(QUOTE_BID_STATUSES, b.status)}</Badge>
                      {isWinner && (
                        <Badge className="bg-success text-success-foreground">Offre retenue</Badge>
                      )}
                    </p>
                    {b.message && <p className="mt-1 text-xs text-muted-foreground">{b.message}</p>}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Reçue le {frDate(b.created_at)}
                    </p>
                  </div>
                  {canEdit && !isAttributed && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-success text-success-foreground hover:bg-success/80"
                      onClick={() => onAward(b)}
                      disabled={isAttributed}
                    >
                      <CheckCircle2 className="mr-1.5 size-4" /> Attribuer
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {canEdit && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            {isAttributed && winner && (
              <p className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 className="size-3.5" />
                Offre de {fcfa(Number(winner.amount))} attribuée — finalisez l'échange avec le
                prestataire.
              </p>
            )}
            {!isAttributed && <span />}
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto size-7 text-destructive"
              onClick={onRemove}
              title="Supprimer la demande"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
