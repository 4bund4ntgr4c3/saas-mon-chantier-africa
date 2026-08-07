import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Building2, FileText, Receipt, Store, Wallet } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import {
  useBudgetLines,
  useCategories,
  useCompanies,
  useExpenses,
  usePayments,
  useQuotes,
  useSuppliers,
} from "@/lib/data";
import { compactFcfa, fcfa, labelOf, monthKey, monthLabel, num, PAYMENT_METHODS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — BâtiBénin suivi de chantier" },
      {
        name: "description",
        content:
          "Budget global, dépenses réelles, coût au m² et évolution mensuelle de votre chantier au Bénin, en FCFA.",
      },
      { property: "og:title", content: "Tableau de bord — BâtiBénin" },
      {
        property: "og:description",
        content: "Suivez en temps réel le budget et les dépenses de votre construction.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Kpi({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  tone?: "default" | "primary" | "accent" | "danger";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "accent"
        ? "text-accent"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="panel p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`num mt-2 text-xl font-semibold md:text-2xl ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  const { project, projectId, isLoading } = useCurrentProject();
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: payments = [] } = usePayments(projectId);
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: budgetLines = [] } = useBudgetLines(projectId);
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: companies = [] } = useCompanies();

  const catName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const budget = Number(project?.budget ?? 0);
  const remaining = budget - totalSpent;
  const progress = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;
  const builtArea = Number(project?.built_area ?? 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const key = e.category_id ? (catName.get(e.category_id) ?? "Autres") : "Non classé";
      map.set(key, (map.get(key) ?? 0) + Number(e.amount));
    });
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [expenses, catName]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const key = monthKey(e.expense_date);
      map.set(key, (map.get(key) ?? 0) + Number(e.amount));
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ mois: monthLabel(key), value }));
  }, [expenses]);

  const byMethod = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const key = labelOf(PAYMENT_METHODS, e.method);
      map.set(key, (map.get(key) ?? 0) + Number(e.amount));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const alerts = useMemo(() => {
    const spentByCat = new Map<string, number>();
    expenses.forEach((e) => {
      if (!e.category_id) return;
      spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
    });
    return budgetLines
      .map((line) => {
        const planned = Number(line.planned_amount);
        const spent = spentByCat.get(line.category_id) ?? 0;
        const ratio = planned > 0 ? (spent / planned) * 100 : 0;
        return { name: catName.get(line.category_id) ?? "Poste", planned, spent, ratio };
      })
      .filter((l) => l.ratio >= 80)
      .sort((a, b) => b.ratio - a.ratio);
  }, [budgetLines, expenses, catName]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!project) return <EmptyProjectNotice />;

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={[project.quartier, project.commune, project.city].filter(Boolean).join(" · ")}
        action={
          <Badge variant="outline" className="border-primary/40 text-primary">
            {num(progress, 1)} % d'avancement financier
          </Badge>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Budget global" value={fcfa(budget)} tone="accent" />
        <Kpi label="Dépenses totales" value={fcfa(totalSpent)} tone="primary" />
        <Kpi
          label="Budget restant"
          value={fcfa(remaining)}
          tone={remaining < 0 ? "danger" : "default"}
          hint={remaining < 0 ? "Dépassement de budget" : undefined}
        />
        <Kpi
          label="Coût au m²"
          value={builtArea > 0 ? fcfa(totalSpent / builtArea) : "—"}
          hint={builtArea > 0 ? `${num(builtArea)} m² construits` : "Renseignez la surface"}
        />
      </div>

      <div className="panel mt-3 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Avancement financier</span>
          <span className="num">
            {compactFcfa(totalSpent)} / {compactFcfa(budget)} FCFA
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Fournisseurs" value={num(suppliers.length)} />
        <Kpi label="Entreprises" value={num(companies.length)} />
        <Kpi label="Factures / dépenses" value={num(expenses.length)} />
        <Kpi label="Paiements" value={`${num(payments.length)} · ${num(quotes.length)} devis`} />
      </div>

      {alerts.length > 0 && (
        <div className="panel mt-3 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
            <AlertTriangle className="size-4 text-primary" /> Postes au-delà de 80 % du budget
          </h2>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.name} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{a.name}</span>
                <span className="num text-muted-foreground">
                  {fcfa(a.spent)} / {fcfa(a.planned)}
                </span>
                <Badge variant={a.ratio > 100 ? "destructive" : "outline"}>
                  {num(a.ratio)} %
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="panel p-4">
          <h2 className="mb-4 font-display text-sm font-semibold">Dépenses par catégorie</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid horizontal={false} stroke="var(--color-border)" />
              <XAxis
                type="number"
                tickFormatter={(v) => compactFcfa(v as number)}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <Tooltip
                formatter={(v) => fcfa(v as number)}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="value" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-4">
          <h2 className="mb-4 font-display text-sm font-semibold">Évolution mensuelle</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={byMonth}>
              <defs>
                <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mois" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis
                tickFormatter={(v) => compactFcfa(v as number)}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <Tooltip
                formatter={(v) => fcfa(v as number)}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-chart-2)"
                fill="url(#fillArea)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="panel p-4 lg:col-span-1">
          <h2 className="mb-4 font-display text-sm font-semibold">Moyens de paiement</h2>
          {byMethod.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune dépense enregistrée.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byMethod} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {byMethod.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => fcfa(v as number)}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel p-4 lg:col-span-2">
          <h2 className="mb-4 font-display text-sm font-semibold">Dernières dépenses</h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune dépense pour l'instant — commencez par en ajouter une.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {expenses.slice(0, 7).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate">{e.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.category_id ? catName.get(e.category_id) : "Non classé"} ·{" "}
                      {labelOf(PAYMENT_METHODS, e.method)}
                    </p>
                  </div>
                  <span className="num shrink-0 text-primary">{fcfa(Number(e.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <Receipt className="size-3.5" /> {num(expenses.length)} dépenses
        </span>
        <span className="flex items-center gap-2">
          <Wallet className="size-3.5" /> {fcfa(payments.reduce((s, p) => s + Number(p.amount), 0))} payés
        </span>
        <span className="flex items-center gap-2">
          <Store className="size-3.5" /> {num(suppliers.length)} fournisseurs
        </span>
        <span className="flex items-center gap-2">
          <Building2 className="size-3.5" /> {num(companies.length)} entreprises ·{" "}
          <FileText className="size-3.5" /> {num(quotes.length)} devis
        </span>
      </div>
    </>
  );
}
