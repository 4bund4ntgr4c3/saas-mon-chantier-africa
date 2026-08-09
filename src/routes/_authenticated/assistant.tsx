import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ShoppingCart,
  Mic,
  MicOff,
  Sparkles,
  TrendingUp,
  Wallet,
  ListChecks,
  ThumbsUp,
  Loader2,
  PackageSearch,
} from "lucide-react";
import { useCurrentProject } from "@/context/project-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  useAiActions,
  useAiConversations,
  useUpsertAiConversation,
  useAddAiAction,
  useBudgetLines,
  useExpenses,
  useMaterialRequirements,
  useProducts,
  useStores,
  useStoreStockForecast,
  useAddToCart,
  useMyCart,
  useTasks,
  type MaterialRequirement,
  type Product,
  type Expense,
  type BudgetLine,
  type AiActionType,
  type Store,
  type StockForecast,
} from "@/lib/data";
import { useAccountType, accountTypeLabel } from "@/lib/roles";
import { fcfa } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/assistant")({
  component: AssistantPage,
});

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Suggestion = {
  type: AiActionType;
  label: string;
  payload?: Record<string, unknown>;
};

type Analysis = {
  requirements: MaterialRequirement[];
  products: Product[];
  stores: Store[];
  forecast: StockForecast[];
  cartCount: number;
  budgetLines: BudgetLine[];
  expenses: Expense[];
  tasks: { id: string; title: string; due_date: string | null; status: string }[];
};

const QUICK_PROMPTS = [
  "Prépare mes achats de matériaux",
  "Comment va mon budget ?",
  "Quelles tâches sont en retard ?",
  "Recommande-moi les meilleurs prix en boutique",
  "Prévision de stock de ma boutique",
];

function AssistantPage() {
  const { project, projectId } = useCurrentProject();
  const { data: conversations = [] } = useAiConversations();
  const { data: actions = [] } = useAiActions(conversations[0]?.id ?? null);
  const upsertConversation = useUpsertAiConversation();
  const addAction = useAddAiAction();

  const { data: requirements = [] } = useMaterialRequirements(projectId);
  const { data: products = [] } = useProducts();
  const { data: stores = [] } = useStores();
  const { data: forecast = [] } = useStoreStockForecast(stores[0]?.id ?? null);
  const { data: cart } = useMyCart();
  const { data: budgetLines = [] } = useBudgetLines(projectId);
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: tasks = [] } = useTasks(projectId);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [thinking, setThinking] = useState(false);

  const { type: accountType } = useAccountType();
  const roleLabel = accountTypeLabel(accountType);

  if (!project || !projectId) {
    return (
      <div className="panel p-4">
        <p className="text-sm text-muted-foreground">
          Sélectionnez un chantier pour que l'assistant puisse analyser vos données.
        </p>
      </div>
    );
  }

  async function handleSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q || thinking) return;
    setInput("");
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);
    setSuggestions([]);

    let activeConvId: string | null = null;
    try {
      activeConvId = await upsertConversation.mutateAsync({
        title: q.slice(0, 60),
        projectId,
        role: accountType,
      });
    } catch {
      activeConvId = conversations[0]?.id ?? null;
    }
    if (activeConvId) {
      addAction.mutate({
        conversationId: activeConvId,
        actionType: inferType(q),
        title: q,
        payload: { question: q },
      });
    }

    const analysis: Analysis = {
      requirements,
      products,
      stores,
      forecast,
      cartCount: cart?.items?.length ?? 0,
      budgetLines,
      expenses,
      tasks,
    };
    const reply = buildReply(q, roleLabel, accountType, analysis);
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: reply.text,
    };
    setMessages((m) => [...m, assistantMsg]);
    setSuggestions(reply.suggestions);
    setThinking(false);
  }

  return (
    <div className="space-y-4">
      <PageIntro roleLabel={roleLabel} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <ChatLog messages={messages} suggestions={suggestions} products={products} />
          <SuggestionChips quickPrompts={QUICK_PROMPTS} onPick={(p) => handleSend(p)} />
          <Composer
            value={input}
            onChange={setInput}
            onSend={() => handleSend()}
            disabled={thinking}
          />
        </div>
        <div>
          <AiActionsPanel
            actions={actions}
            suggestions={suggestions?.length ? suggestions : null}
          />
          {accountType === "quincaillerie" && <SupplierForecastPanel forecast={forecast} />}
        </div>
      </div>
    </div>
  );
}

function PageIntro({ roleLabel }: { roleLabel: string }) {
  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 font-display text-lg font-bold">
          <Sparkles className="size-5 text-primary" /> Assistant
        </h1>
        <Badge variant="secondary">Rôle : {roleLabel}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Posez une question en français — vous pouvez aussi dicter votre message avec le micro («
        Parler au chantier »). L'assistant analyse les données réelles du chantier sélectionné et
        propose des actions.
      </p>
    </div>
  );
}

function ChatLog({
  messages,
  suggestions,
  products,
}: {
  messages: ChatMessage[];
  suggestions: Suggestion[];
  products: Product[];
}) {
  if (messages.length === 0) {
    return (
      <div className="panel p-6">
        <p className="text-sm text-muted-foreground">
          Commencez par un clic sur une suggestion, ou écrivez « Prépare mes achats de matériaux »
          pour que l'assistant analyse vos besoins et prépare le panier.
        </p>
      </div>
    );
  }
  return (
    <div className="panel space-y-3 p-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            "max-w-[85%] whitespace-pre-line rounded-lg border px-3 py-2 text-sm leading-relaxed",
            m.role === "user"
              ? "ml-auto border-primary/30 bg-primary/5"
              : "mr-auto border-border bg-card",
          )}
        >
          {m.text}
        </div>
      ))}
      {suggestions.length > 0 && (
        <SuggestionActions suggestions={suggestions} products={products} />
      )}
    </div>
  );
}

function SuggestionActions({
  suggestions,
  products,
}: {
  suggestions: Suggestion[];
  products: Product[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <ActionButton key={s.label} suggestion={s} products={products} />
      ))}
    </div>
  );
}

function ActionButton({ suggestion, products }: { suggestion: Suggestion; products: Product[] }) {
  const addToCart = useAddToCart();
  const productId = (suggestion.payload?.["productId"] as string | undefined) ?? null;
  const quantity = Number(suggestion.payload?.["quantity"] ?? 1);

  async function run() {
    if (suggestion.type === "achat" && productId) {
      const product = products.find((p) => p.id === productId);
      await addToCart.mutateAsync({
        productId,
        quantity,
        unitPrice: product?.price ?? 0,
      });
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={run} disabled={!suggestion.payload?.["productId"]}>
      {suggestion.type === "achat" ? (
        <ShoppingCart className="size-3.5" />
      ) : (
        <ArrowRight className="size-3.5" />
      )}
      {suggestion.label}
    </Button>
  );
}

function SuggestionChips({
  quickPrompts,
  onPick,
}: {
  quickPrompts: string[];
  onPick: (p: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickPrompts.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const [listening, setListening] = useState(false);
  const win = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : null;
  const supported = Boolean(win?.["webkitSpeechRecognition"] || win?.["SpeechRecognition"]);

  function toggleListening() {
    if (!win) return;
    const Ctor = (win["SpeechRecognition"] ?? win["webkitSpeechRecognition"]) as
      (new () => SpeechRecognitionLike) | undefined;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      onChange(value ? `${value} ${transcript}` : transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }

  return (
    <div className="flex items-end gap-2">
      <Button
        variant="outline"
        size="icon"
        className="shrink-0"
        title="Parler au chantier (reconnaissance vocale)"
        onClick={toggleListening}
        disabled={!supported}
      >
        {listening ? <MicOff className="size-4 text-destructive" /> : <Mic className="size-4" />}
      </Button>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Écrivez ou dictez votre question…"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <Button onClick={onSend} disabled={disabled || !value.trim()} className="shrink-0">
        {disabled ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
      </Button>
    </div>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
};

function AiActionsPanel({
  actions,
  suggestions,
}: {
  actions: AiActionLike[];
  suggestions: Suggestion[] | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Dernières actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {suggestions && suggestions.length > 0 && (
          <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
            <p className="font-medium">Actions suggérées</p>
            <ul className="mt-1 list-inside list-disc text-muted-foreground">
              {suggestions.map((s) => (
                <li key={s.label}>{s.label}</li>
              ))}
            </ul>
          </div>
        )}
        {actions.length === 0 && !suggestions && (
          <p className="text-muted-foreground">Aucune action enregistrée pour l'instant.</p>
        )}
        {actions.map((a) => (
          <div key={a.id} className="flex items-start gap-2 rounded-md border border-border p-2">
            <AiTypeIcon type={a.action_type} />
            <div className="min-w-0">
              <p className="text-sm leading-snug">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.created_at.slice(0, 10)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

type AiActionLike = {
  id: string;
  action_type: string;
  title: string;
  created_at: string;
};

const FORECAST_LABELS: Record<StockForecast["status"], string> = {
  rupture: "Rupture",
  critique: "Critique",
  bas: "Stock bas",
  ok: "OK",
};

function SupplierForecastPanel({ forecast }: { forecast: StockForecast[] }) {
  const atRisk = forecast.filter((f) => f.status !== "ok");
  const display = atRisk.length > 0 ? atRisk : forecast;
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <PackageSearch className="size-4 text-primary" /> Prévision de stock (30 j)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {display.length === 0 && (
          <p className="text-muted-foreground">Aucun produit dans votre boutique pour l'instant.</p>
        )}
        {display.slice(0, 6).map((f) => (
          <div
            key={f.productId}
            className="flex items-start gap-2 rounded-md border border-border p-2"
          >
            <StatusDot status={f.status} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-snug">{f.name}</p>
              <p className="text-xs text-muted-foreground">
                Stock {f.stock} {f.unit ?? ""} · {f.soldLast30d} vendus / 30 j
                {f.daysLeft !== null && ` · ~${f.daysLeft} j restants`}
              </p>
              {f.status !== "ok" && (
                <p className="text-xs font-medium text-amber-600">
                  Réappro suggéré : +{f.suggestedReorder} {f.unit ?? ""}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn(
                f.status === "rupture" && "border-destructive bg-destructive/10 text-destructive",
                f.status === "critique" && "border-amber-500 bg-amber-50 text-amber-700",
                f.status === "bas" && "border-amber-300 bg-amber-50/60 text-amber-600",
              )}
            >
              {FORECAST_LABELS[f.status]}
            </Badge>
          </div>
        ))}
        {atRisk.length > 1 && (
          <p className="pt-1 text-xs text-muted-foreground">
            + {atRisk.length - display.slice(0, 6).filter((f) => atRisk.includes(f)).length}{" "}
            nécessitant votre attention — demandez « prévision de stock » pour le détail complet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusDot({ status }: { status: StockForecast["status"] }) {
  return (
    <span
      className={cn(
        "mt-1.5 size-2 shrink-0 rounded-full",
        status === "ok" && "bg-success",
        status === "bas" && "bg-amber-400",
        status === "critique" && "bg-amber-500",
        status === "rupture" && "bg-destructive",
      )}
    />
  );
}

function AiTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "achat":
      return <ShoppingCart className="mt-0.5 size-4 text-primary" />;
    case "finance":
      return <Wallet className="mt-0.5 size-4 text-primary" />;
    case "planning":
      return <ListChecks className="mt-0.5 size-4 text-primary" />;
    case "recommandation":
      return <ThumbsUp className="mt-0.5 size-4 text-primary" />;
    case "document":
      return <TrendingUp className="mt-0.5 size-4 text-primary" />;
    default:
      return <Sparkles className="mt-0.5 size-4 text-primary" />;
  }
}

function inferType(q: string): AiActionType {
  if (q.includes("achat") || q.includes("matériau") || q.includes("panier")) return "achat";
  if (q.includes("budget") || q.includes("dépense") || q.includes("finance")) return "finance";
  if (q.includes("retard") || q.includes("tâche") || q.includes("planning")) return "planning";
  if (q.includes("recommand") || q.includes("prix")) return "recommandation";
  if (q.includes("stock") || q.includes("réappro") || q.includes("rupture")) return "achat";
  return "autre";
}

type Reply = {
  intent: string;
  suggestionType: AiActionType;
  text: string;
  suggestions: Suggestion[];
};

function buildReply(question: string, roleLabel: string, accountType: string, a: Analysis): Reply {
  const q = question.toLowerCase();
  if (
    q.includes("achat") ||
    q.includes("matériau") ||
    q.includes("panier") ||
    q.includes("matériel")
  ) {
    return materialsReply(a);
  }
  if (
    q.includes("budget") ||
    q.includes("dépense") ||
    q.includes("finance") ||
    q.includes("argent")
  ) {
    return budgetReply(a);
  }
  if (
    q.includes("retard") ||
    q.includes("tâche") ||
    q.includes("planning") ||
    q.includes("planif")
  ) {
    return planningReply(a);
  }
  if (q.includes("stock") || q.includes("réappro") || q.includes("rupture")) {
    if (accountType === "quincaillerie") return supplierForecastReply(a);
  }
  if (
    q.includes("recommand") ||
    q.includes("produit") ||
    q.includes("bonne affaire") ||
    q.includes("prix") ||
    q.includes("boutique")
  ) {
    return recommendationsReply(a);
  }
  return healthReply(a, roleLabel);
}

/** Normalise un nom pour comparer produits entre boutiques. */
function normName(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

/**
 * Meilleure offre pour un besoin : produits en stock dont le nom contient le
 * mot-clé, triés par prix croissant. `storeById` résout le libellé boutique.
 */
function bestOfferFor(needName: string, products: Product[], storeById: Map<string, Store>) {
  const keyword = normName(needName).slice(0, 10);
  const candidates = products
    .filter((p) => p.active && Number(p.stock) > 0 && normName(p.name).includes(keyword))
    .sort((x, y) => Number(x.price) - Number(y.price));
  if (candidates.length === 0) return null;
  const best = candidates[0]!;
  return {
    product: best,
    store: storeById.get(best.store_id) ?? null,
    suppliers: candidates.length,
  };
}

function materialsReply(a: Analysis): Reply {
  const storeById = new Map(a.stores.map((s) => [s.id, s]));
  const needs = a.requirements
    .map((r) => {
      const remaining =
        Number(r.quantity_needed) - Number(r.quantity_delivered) - Number(r.quantity_consumed);
      const qty = Math.max(0, remaining);
      const offer = bestOfferFor(r.name, a.products, storeById);
      const unitPrice = offer ? Number(offer.product.price) : Number(r.unit_price);
      return { ...r, remaining: qty, offer, unitPrice };
    })
    .filter((r) => r.remaining > 0)
    .sort((x, y) => y.remaining * y.unitPrice - x.remaining * x.unitPrice);

  if (needs.length === 0) {
    return {
      intent: "achat",
      suggestionType: "achat",
      text: "Votre chantier n'a pas de besoins de matériaux en attente. Renseignez vos besoins dans Matériaux chantier pour préparer un panier.",
      suggestions: [],
    };
  }

  const lines = needs.map((r) => {
    const qty = suggestOrderQuantity(r.remaining, r.offer?.product);
    const place = r.offer?.store ? ` — ${r.offer.store.name}` : "";
    const unitLabel = r.offer?.product?.unit ?? r.unit ?? "";
    return `${r.name} : ${qty} ${unitLabel.trim() ? unitLabel + " " : ""}à ${fcfa(r.unitPrice)}${place}`;
  });
  const total = needs.reduce((s, r) => s + r.remaining * r.unitPrice, 0);
  const referenceTotal = needs.reduce((s, r) => s + r.remaining * Number(r.unit_price), 0);
  const savings = referenceTotal - total;

  const suggestions: Suggestion[] = [];
  for (const n of needs) {
    const product = n.offer?.product ?? null;
    if (!product) continue;
    const qty = suggestOrderQuantity(n.remaining, product);
    const label = n.offer?.store
      ? `Ajouter : ${product.name} ×${qty} (${n.offer.store.name})`
      : `Ajouter : ${product.name} (×${qty})`;
    suggestions.push({
      type: "achat",
      label,
      payload: { productId: product.id, quantity: qty },
    });
  }

  const savingsLine =
    savings > 0
      ? `\n\n💡 Meilleur prix trouvé chez ${needs.filter((n) => n.offer?.store).length} boutique(s) différente(s) — économie estimée de ${fcfa(savings)} par rapport au prix de référence.`
      : "";

  return {
    intent: "achat",
    suggestionType: "achat",
    text:
      [
        `Voici votre plan d'achat optimal (estimation ${fcfa(total)}) :`,
        lines.join("\n"),
        a.cartCount > 0
          ? `Votre panier contient déjà ${a.cartCount} article(s). Ajoutez les suggestions ci-dessous pour tout regrouper.`
          : "Aucun article au panier pour l'instant — ajoutez les suggestions ci-dessous.",
      ].join("\n\n") + savingsLine,
    suggestions,
  };
}

/** Arrondit la quantité à commander au multiple de la commande minimale. */
function suggestOrderQuantity(remaining: number, product?: Product | null): number {
  if (!product) return remaining;
  const min = Number(product.min_order_quantity ?? 1);
  if (min <= 1) return remaining;
  return Math.max(min, Math.ceil(remaining / min) * min);
}

function budgetReply(a: Analysis): Reply {
  const totalPlanned = a.budgetLines.reduce((s, l) => s + Number(l.planned_amount), 0);
  const totalSpent = a.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const pct = totalPlanned > 0 ? Math.round((totalSpent / totalPlanned) * 100) : 0;

  return {
    intent: "finance",
    suggestionType: "finance",
    text: [
      `Budget du chantier : ${fcfa(totalSpent)} dépensés sur ${fcfa(totalPlanned)} prévus (${pct} %).`,
      pct >= 100
        ? "Attention : vous avez atteint ou dépassé le budget prévu. Recalibrez vos devis."
        : pct >= 80
          ? "Vous approchez de la limite budgétaire. Surveillez les prochains achats."
          : "La consommation budgétaire reste sous contrôle.",
      a.budgetLines.length === 0
        ? "Aucun poste budgétaire n'est défini — créez une répartition pour un meilleur suivi."
        : `${a.budgetLines.length} poste(s) budgétaire(s) défini(s).`,
    ].join("\n\n"),
    suggestions: [],
  };
}

function planningReply(a: Analysis): Reply {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = a.tasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== "terminee" && t.status !== "annulee",
  );

  return {
    intent: "planning",
    suggestionType: "planning",
    text:
      overdue.length === 0
        ? "Aucune tâche en retard. Gardez le rythme : créez les prochaines étapes du chantier."
        : `${overdue.length} tâche(s) en retard : ${overdue
            .map((t) => t.title)
            .slice(0, 5)
            .join(", ")}. Reprogrammez-les pour tenir le planning.`,
    suggestions: [],
  };
}

function recommendationsReply(a: Analysis): Reply {
  const storeById = new Map(a.stores.map((s) => [s.id, s]));

  // Produits "bien notés" déjà en stock, toutes boutiques confondues.
  const best = [...a.products]
    .filter((p) => p.active && Number(p.stock) > 0)
    .sort((x, y) => y.rating - x.rating || y.review_count - x.review_count)
    .slice(0, 3);

  // Produits les moins chers du catalogue (bonnes affaires), toutes boutiques.
  const cheapest = [...a.products]
    .filter((p) => p.active && Number(p.stock) > 0)
    .sort((x, y) => Number(x.price) - Number(y.price))
    .slice(0, 3);

  const seller = (p: Product) => storeById.get(p.store_id)?.name ?? "boutique locale";

  const suggestions: Suggestion[] = [
    ...best.map((p) => ({
      type: "recommandation" as const,
      label: `Voir : ${p.name} (${p.rating} ★)`,
      payload: { productId: p.id, quantity: 1 },
    })),
    ...cheapest.map((p) => ({
      type: "achat" as const,
      label: `Ajouter : ${p.name} à ${fcfa(p.price)}`,
      payload: { productId: p.id, quantity: 1 },
    })),
  ];

  return {
    intent: "recommandation",
    suggestionType: "recommandation",
    text: [
      `Meilleures notes (${best.length ? best.map((p) => `${p.name} — ${seller(p)}`).join(" · ") : "aucun produit noté pour l'instant"}) :`,
      `Meilleurs prix (${cheapest.length ? cheapest.map((p) => `${p.name} à ${fcfa(p.price)} (${seller(p)})`).join(" · ") : "aucun article en stock"}) :`,
      "Comparez les offres entre boutiques vérifiées, ou laissez-moi préparer un panier : dites « Prépare mes achats de matériaux ».",
    ].join("\n\n"),
    suggestions,
  };
}

function supplierForecastReply(a: Analysis): Reply {
  const atRisk = a.forecast.filter((f) => f.status !== "ok");
  if (a.forecast.length === 0) {
    return {
      intent: "achat",
      suggestionType: "achat",
      text: "Aucun produit dans votre boutique pour l'instant. Publiez des produits depuis « Ma boutique » pour que je puisse prévoir vos stocks.",
      suggestions: [],
    };
  }
  if (atRisk.length === 0) {
    return {
      intent: "achat",
      suggestionType: "achat",
      text: `Bonnes nouvelles : votre stock est sain sur l'ensemble du catalogue (${a.forecast.length} produit(s) suivis sur 30 jours). Aucun réapprovisionnement urgent.`,
      suggestions: [],
    };
  }
  const top = atRisk.slice(0, 5);
  const lines = top
    .map(
      (f) =>
        `${f.name} : stock ${f.stock} ${f.unit ?? ""} · ${f.soldLast30d} vendus/30 j · ${f.daysLeft !== null ? `~${f.daysLeft} j restants` : "vente lente"} → réappro +${f.suggestedReorder} ${f.unit ?? ""}`,
    )
    .join("\n");
  const suggestions: Suggestion[] = top
    .filter((f) => f.stock <= f.suggestedReorder)
    .map((f) => ({
      type: "recommandation" as const,
      label: `Réapprovisionner : ${f.name} (+${f.suggestedReorder})`,
      payload: { productId: f.productId, quantity: f.suggestedReorder },
    }));

  return {
    intent: "achat",
    suggestionType: "achat",
    text: [
      `${atRisk.length} produit(s) à surveiller dans votre boutique (ventes sur 30 jours) :`,
      lines,
      "Commandez avant la rupture, notamment les références à rotation rapide.",
    ].join("\n\n"),
    suggestions,
  };
}

function healthReply(a: Analysis, roleLabel: string): Reply {
  const spent = a.expenses.reduce((s, e) => s + Number(e.amount), 0);
  return {
    intent: "info",
    suggestionType: "autre",
    text: `Bonjour ! En tant que ${roleLabel}, je surveille votre chantier : ${fcfa(
      spent,
    )} déjà dépensés, ${a.tasks.length} tâche(s) planifiée(s). Dites-moi « budget », « achats », « retard » ou « recommandations » pour aller plus loin.`,
    suggestions: [],
  };
}
