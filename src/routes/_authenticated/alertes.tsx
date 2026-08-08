import { createFileRoute } from "@tanstack/react-router";
import { FeatureGate } from "@/components/feature-gate";
import { useMemo, type ReactNode } from "react";
import {
  AlertTriangle,
  CalendarX2,
  CheckCircle2,
  Clock4,
  FileWarning,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import { useBudgetLines, useCategories, useExpenses, usePayments, useQuotes } from "@/lib/data";
import { fcfa, frDate, labelOf, num, PAYMENT_METHODS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/alertes")({
  head: () => ({
    meta: [
      { title: "Alertes — BâtiBénin" },
      {
        name: "description",
        content:
          "Alertes automatiques : postes de budget dépassant 80 %, paiements en retard, devis arrivés à échéance et chantiers hors délai.",
      },
      { property: "og:title", content: "Alertes — BâtiBénin" },
      {
        property: "og:description",
        content: "Anticipez les dépassements et les retards sur votre chantier.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="alertes">
      <AlertsPage />
    </FeatureGate>
  ),
});

type AlertItem = {
  id: string;
  kind: "budget" | "paiement" | "devis" | "projet";
  title: string;
  detail: string;
  severity: "danger" | "warning";
};

function daysFromNow(value: string) {
  return Math.round((Date.now() - new Date(value).getTime()) / 86400000);
}

function AlertsPage() {
  const { project, projectId } = useCurrentProject();
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: budgetLines = [] } = useBudgetLines(projectId);
  const { data: categories = [] } = useCategories();
  const { data: payments = [] } = usePayments(projectId);
  const { data: quotes = [] } = useQuotes(projectId);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const alerts = useMemo<AlertItem[]>(() => {
    const out: AlertItem[] = [];

    // Postes de budget au-delà de 80 % de consommation.
    const spentByCat = new Map<string, number>();
    for (const e of expenses) {
      if (!e.category_id) continue;
      spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
    }
    for (const line of budgetLines) {
      const planned = Number(line.planned_amount);
      if (planned <= 0) continue;
      const spent = spentByCat.get(line.category_id) ?? 0;
      const ratio = (spent / planned) * 100;
      if (ratio >= 80) {
        out.push({
          id: `budget-${line.id}`,
          kind: "budget",
          title: `Poste « ${catName.get(line.category_id) ?? "Sans catégorie"} » à ${num(ratio)} % du budget`,
          detail: `${fcfa(spent)} dépensés sur ${fcfa(planned)} prévus`,
          severity: ratio > 100 ? "danger" : "warning",
        });
      }
    }

    // Paiements dont la date d'échéance est dépassée.
    for (const p of payments) {
      if (!p.due_date) continue;
      if (p.due_date < today) {
        const late = daysFromNow(p.due_date);
        out.push({
          id: `paiement-${p.id}`,
          kind: "paiement",
          title: `Paiement en retard de ${late} jour(s)`,
          detail: `${fcfa(Number(p.amount))} · ${labelOf(PAYMENT_METHODS, p.method)} · échéance ${frDate(p.due_date)}`,
          severity: "danger",
        });
      }
    }

    // Devis dont la validité est dépassée.
    for (const q of quotes) {
      if (!q.valid_until) continue;
      if (q.valid_until < today && q.status === "en_attente") {
        const late = daysFromNow(q.valid_until);
        out.push({
          id: `devis-${q.id}`,
          kind: "devis",
          title: `Devis « ${q.label} » expiré depuis ${late} jour(s)`,
          detail: `${fcfa(Number(q.amount))} · référence ${q.reference ?? "—"}`,
          severity: "warning",
        });
      }
    }

    // Chantier dont la date prévisionnelle de fin est dépassée.
    if (project && project.end_date && project.end_date < today && project.status !== "termine") {
      const late = daysFromNow(project.end_date);
      out.push({
        id: "projet-fin",
        kind: "projet",
        title: `Le chantier dépasse sa date prévisionnelle de fin de ${late} jour(s)`,
        detail: `Fin prévue le ${frDate(project.end_date)} · statut « ${labelOf(
          [
            { value: "planifie", label: "Planifié" },
            { value: "en_cours", label: "En cours" },
            { value: "suspendu", label: "Suspendu" },
            { value: "termine", label: "Terminé" },
          ],
          project.status,
        )} »`,
        severity: "warning",
      });
    }

    return out.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "danger" ? -1 : 1));
  }, [expenses, budgetLines, payments, quotes, project, today, catName]);

  if (!project) return <EmptyProjectNotice />;

  const danger = alerts.filter((a) => a.severity === "danger").length;
  const warning = alerts.filter((a) => a.severity === "warning").length;

  const ICONS = {
    budget: PiggyBank,
    paiement: Wallet,
    devis: FileWarning,
    projet: CalendarX2,
  } as const;

  return (
    <>
      <PageHeader
        title="Alertes"
        subtitle={`${alerts.length} alerte(s) sur le chantier « ${project.name} »`}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<AlertTriangle className="size-5" />}
          label="Alertes critiques"
          value={num(danger)}
          tone="danger"
        />
        <SummaryCard
          icon={<Clock4 className="size-5" />}
          label="Alertes de vigilance"
          value={num(warning)}
          tone="warning"
        />
        <SummaryCard
          icon={<CheckCircle2 className="size-5" />}
          label="Points sous contrôle"
          value={num(Math.max(0, budgetLines.length + payments.length - alerts.length))}
          tone="ok"
        />
      </div>

      {alerts.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <CheckCircle2 className="mb-3 size-9 text-emerald-500" />
          <h2 className="font-display text-lg font-semibold">Tout est sous contrôle</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Aucun poste au-delà de 80 % du budget, aucun paiement en retard, aucun devis expiré.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const Icon = ICONS[a.kind];
            return (
              <li
                key={a.id}
                className={`panel flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 ${
                  a.severity === "danger" ? "border-destructive/40" : ""
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-md ${
                    a.severity === "danger"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <Badge variant={a.severity === "danger" ? "destructive" : "outline"}>
                  {a.severity === "danger" ? "Critique" : "À surveiller"}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "danger" | "warning" | "ok";
}) {
  return (
    <div className="panel flex items-center gap-3 p-4">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-md ${
          tone === "danger"
            ? "bg-destructive/10 text-destructive"
            : tone === "warning"
              ? "bg-accent/10 text-accent"
              : "bg-emerald-500/10 text-emerald-600"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="num text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
