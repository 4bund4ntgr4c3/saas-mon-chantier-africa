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
  useAddToCart,
  useMyCart,
  useTasks,
  type MaterialRequirement,
  type Product,
  type Expense,
  type BudgetLine,
  type AiActionType,
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
  cartCount: number;
  budgetLines: BudgetLine[];
  expenses: Expense[];
  tasks: { id: string; title: string; due_date: string | null; status: string }[];
};

const QUICK_PROMPTS = [
  "Prépare mes achats de matériaux",
  "Comment va mon budget ?",
  "Quelles tâches sont en retard ?",
  "Recommande-moi des produits",
];

function AssistantPage() {
  const { project, projectId } = useCurrentProject();
  const { data: conversations = [] } = useAiConversations();
  const { data: actions = [] } = useAiActions(conversations[0]?.id ?? null);
  const upsertConversation = useUpsertAiConversation();
  const addAction = useAddAiAction();

  const { data: requirements = [] } = useMaterialRequirements(projectId);
  const { data: products = [] } = useProducts();
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
      cartCount: cart?.items?.length ?? 0,
      budgetLines,
      expenses,
      tasks,
    };
    const reply = buildReply(q, roleLabel, analysis);
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
  if (q.includes("recommand")) return "recommandation";
  return "autre";
}

type Reply = {
  intent: string;
  suggestionType: AiActionType;
  text: string;
  suggestions: Suggestion[];
};

function buildReply(question: string, roleLabel: string, a: Analysis): Reply {
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
  if (q.includes("recommand") || q.includes("produit") || q.includes("bonne affaire")) {
    return recommendationsReply(a);
  }
  return healthReply(a, roleLabel);
}

function materialsReply(a: Analysis): Reply {
  const needs = a.requirements
    .map((r) => {
      const remaining =
        Number(r.quantity_needed) - Number(r.quantity_delivered) - Number(r.quantity_consumed);
      return { ...r, remaining: Math.max(0, remaining) };
    })
    .filter((r) => r.remaining > 0)
    .sort((x, y) => y.remaining * Number(y.unit_price) - x.remaining * Number(x.unit_price));

  if (needs.length === 0) {
    return {
      intent: "achat",
      suggestionType: "achat",
      text: "Votre chantier n'a pas de besoins de matériaux en attente. Renseignez vos besoins dans Matériaux chantier pour préparer un panier.",
      suggestions: [],
    };
  }

  const lines = needs
    .map(
      (r) =>
        `${r.name} : ${r.remaining} ${r.unit ?? ""} — ${fcfa(r.remaining * Number(r.unit_price))}`,
    )
    .join("\n");
  const total = needs.reduce((s, r) => s + r.remaining * Number(r.unit_price), 0);

  const suggestions: Suggestion[] = [];
  for (const n of needs) {
    const keyword = n.name.toLowerCase().split(" ")[0] ?? "";
    const match = a.products.find((p) => p.name.toLowerCase().includes(keyword));
    if (match) {
      suggestions.push({
        type: "achat",
        label: `Ajouter : ${match.name} (×${n.remaining})`,
        payload: { productId: match.id, quantity: n.remaining },
      });
    }
  }

  return {
    intent: "achat",
    suggestionType: "achat",
    text: [
      `Voici vos besoins en matériaux à compléter (estimation ${fcfa(total)}) :`,
      lines,
      a.cartCount > 0
        ? `Votre panier contient déjà ${a.cartCount} article(s). Ajoutez les suggestions ci-dessous pour tout regrouper.`
        : "Aucun article au panier pour l'instant — ajoutez les suggestions ci-dessous.",
    ].join("\n\n"),
    suggestions,
  };
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
  const best = [...a.products]
    .filter((p) => p.active)
    .sort((x, y) => y.rating - x.rating || y.review_count - x.review_count)
    .slice(0, 3);

  const suggestions: Suggestion[] = best.map((p) => ({
    type: "recommandation",
    label: `Voir : ${p.name} (${p.rating} ★)`,
    payload: { productId: p.id, quantity: 1 },
  }));

  return {
    intent: "recommandation",
    suggestionType: "recommandation",
    text: `Les produits les mieux notés du catalogue : ${best
      .map((p) => p.name)
      .join(
        ", ",
      )}. La quincaillerie locale reste le meilleur rapport qualité/prix pour ce chantier.`,
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
