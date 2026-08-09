import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileWarning,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useBudgetLines,
  useCategories,
  useDocuments,
  useExpenses,
  usePayments,
  useReserves,
  useTasks,
} from "@/lib/data";
import { useAccess } from "@/lib/roles";
import { fcfa, frDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Conseil = {
  id: string;
  type: "budget" | "retard" | "reserve" | "document" | "paiement" | "info";
  titre: string;
  detail: string;
  severite: "haute" | "moyenne" | "basse";
};

/** Conseiller de chantier : synthétise les données et propose des actions. */
export function AiConseiller({ projectId }: { projectId: string | null }) {
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: payments = [] } = usePayments(projectId);
  const { data: budgetLines = [] } = useBudgetLines(projectId);
  const { data: documents = [] } = useDocuments(projectId);
  const { data: tasks = [] } = useTasks(projectId);
  const { data: reserves = [] } = useReserves(projectId);
  const { data: categories = [] } = useCategories();
  const { canView: canSeeBudget } = useAccess("budget");
  const { canView: canSeePayments } = useAccess("paiements");

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const conseils = useMemo<Conseil[]>(() => {
    const list: Conseil[] = [];
    const today = new Date().toISOString().slice(0, 10);

    // 1. Budget
    if (canSeeBudget) {
      const spentByCat = new Map<string, number>();
      expenses.forEach((e) => {
        if (!e.category_id) return;
        spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
      });
      const overruns = budgetLines
        .map((line) => ({
          name: catName.get(line.category_id) ?? "Poste",
          planned: Number(line.planned_amount),
          spent: spentByCat.get(line.category_id) ?? 0,
          ratio:
            Number(line.planned_amount) > 0
              ? ((spentByCat.get(line.category_id) ?? 0) / Number(line.planned_amount)) * 100
              : 0,
        }))
        .filter((l) => l.ratio >= 90)
        .sort((a, b) => b.ratio - a.ratio);
      if (overruns.length > 0) {
        const pire = overruns[0]!;
        list.push({
          id: "budget-over",
          type: "budget",
          titre: `Dépassement imminent sur « ${pire.name} »`,
          detail: `${pire.name} est à ${Math.round(pire.ratio)} % de son budget (${fcfa(pire.spent)} dépensés sur ${fcfa(pire.planned)} prévus). Recalibrez le poste ou sécurisez une rallonge.`,
          severite: pire.ratio >= 100 ? "haute" : "moyenne",
        });
      }
      const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
      const noBudgetLines = budgetLines.length === 0;
      if (noBudgetLines) {
        list.push({
          id: "budget-noline",
          type: "info",
          titre: "Répartition budgétaire non définie",
          detail:
            "Aucun poste de budget n'est renseigné. Créez une répartition (fondation, élévation, finitions…) pour suivre l'avancement par phase.",
          severite: "basse",
        });
      } else if (totalSpent === 0) {
        list.push({
          id: "budget-empty",
          type: "info",
          titre: "Première dépense en attente",
          detail:
            "Enregistrez vos dépenses pour activer les alertes budgétaires et les graphiques d'avancement.",
          severite: "basse",
        });
      }
    }

    // 2. Tâches en retard
    const overdueTasks = tasks.filter(
      (t) => t.due_date && t.due_date < today && t.status !== "terminee" && t.status !== "annulee",
    );
    if (overdueTasks.length > 0) {
      list.push({
        id: "task-overdue",
        type: "retard",
        titre: `${overdueTasks.length} tâche(s) en retard`,
        detail: `La plus ancienne : « ${overdueTasks[0]!.title} », échéance ${frDate(overdueTasks[0]!.due_date!)}. Reprogammons-la ou notifiez l'équipe.`,
        severite: overdueTasks.length >= 3 ? "haute" : "moyenne",
      });
    }

    // 3. Réserves ouvertes prioritaires
    const openCritical = reserves.filter(
      (r) => r.status !== "resolue" && r.status !== "annulee" && r.priority === "critique",
    );
    const openCount = reserves.filter(
      (r) => r.status !== "resolue" && r.status !== "annulee",
    ).length;
    if (openCritical.length > 0) {
      list.push({
        id: "reserve-critical",
        type: "reserve",
        titre: `${openCritical.length} réserve(s) critique(s) à traiter`,
        detail: `« ${openCritical[0]!.title} ». Ces points bloquent potentiellement l'avancement du chantier.`,
        severite: "haute",
      });
    } else if (openCount > 0) {
      list.push({
        id: "reserve-open",
        type: "reserve",
        titre: `${openCount} réserve(s) ouverte(s)`,
        detail: "Pensez à planifier leur résolution avec l'entreprise avant la phase de réception.",
        severite: "basse",
      });
    }

    // 4. Paiements attendus
    if (canSeePayments) {
      const duePayments = payments.filter((p) => p.due_date && p.due_date < today);
      if (duePayments.length > 0) {
        const totalDue = duePayments.reduce((s, p) => s + Number(p.amount), 0);
        list.push({
          id: "payment-due",
          type: "paiement",
          titre: `${duePayments.length} paiement(s) attendu(s) en retard`,
          detail: `Total en attente : ${fcfa(totalDue)}. Rapprochez les paiements pour éviter les litiges.`,
          severite: totalDue > 0 ? "moyenne" : "basse",
        });
      }
    }

    // 5. Documents manquants
    const REQUIRED = ["permis_construire", "contrat", "plan", "facture"] as const;
    const present = new Set(documents.map((d) => d.category));
    const missing = REQUIRED.filter((c) => !present.has(c));
    if (missing.length > 0) {
      const LABELS: Record<string, string> = {
        permis_construire: "permis de construire",
        contrat: "contrat",
        plan: "plans",
        facture: "factures",
      };
      list.push({
        id: "doc-missing",
        type: "document",
        titre: `${missing.length} pièce(s) importante(s) manquante(s)`,
        detail: `Il manque : ${missing.map((m) => LABELS[m]).join(", ")}. Centralisez-les dans Documents pour sécuriser le chantier.`,
        severite: missing.includes("permis_construire") ? "haute" : "moyenne",
      });
    }

    // 6. État global positif
    if (list.length === 0) {
      list.push({
        id: "ok",
        type: "info",
        titre: "Aucun point de vigilance majeur",
        detail:
          "Budget, planning, réserves et pièces : tout semble en ordre. Continuez à saisir vos dépenses et votre journal pour garder le chantier sous contrôle.",
        severite: "basse",
      });
    }

    return list.sort(
      (a, b) =>
        ({ haute: 0, moyenne: 1, basse: 2 })[a.severite]! -
        { haute: 0, moyenne: 1, basse: 2 }[b.severite]!,
    );
  }, [
    expenses,
    payments,
    budgetLines,
    documents,
    tasks,
    reserves,
    catName,
    canSeeBudget,
    canSeePayments,
  ]);

  const score = useMemo(() => {
    const total = conseils.length || 1;
    const hautes = conseils.filter((c) => c.severite === "haute").length;
    const moyennes = conseils.filter((c) => c.severite === "moyenne").length;
    const base = Math.max(20, 100 - hautes * 22 - moyennes * 8);
    return { hautes, moyennes, pct: Math.min(100, base) };
  }, [conseils]);

  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
          <Sparkles className="size-4 text-primary" /> Conseiller de chantier
        </h2>
        <div className="flex items-center gap-2">
          {score.hautes > 0 && (
            <Badge variant="destructive">{score.hautes} point(s) critique(s)</Badge>
          )}
          <span className="num text-xs text-muted-foreground">Santé {score.pct}/100</span>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            score.pct >= 80 ? "bg-success" : score.pct >= 50 ? "bg-amber-500" : "bg-destructive",
          )}
          style={{ width: `${score.pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-3">
        {conseils.map((c) => (
          <li key={c.id} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md",
                c.severite === "haute"
                  ? "bg-destructive/10 text-destructive"
                  : c.severite === "moyenne"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-success/10 text-success",
              )}
            >
              <Icon type={c.type} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug">{c.titre}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Icon({ type }: { type: Conseil["type"] }) {
  switch (type) {
    case "budget":
      return <Wallet className="size-4" />;
    case "retard":
      return <CalendarClock className="size-4" />;
    case "reserve":
      return <AlertTriangle className="size-4" />;
    case "document":
      return <FileWarning className="size-4" />;
    case "paiement":
      return <TrendingUp className="size-4" />;
    default:
      return <Lightbulb className="size-4" />;
  }
}
