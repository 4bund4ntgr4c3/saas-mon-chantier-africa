import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Building2,
  FileDown,
  FileSpreadsheet,
  FileText,
  PiggyBank,
  Plus,
  Receipt,
  Store,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { RoleDashboardStrip } from "@/components/role-dashboard-strip";
import { StartupChecklist } from "@/components/startup-checklist";
import { QuickExpenseDialog } from "@/components/quick-expense";
import { ShareProjectButton } from "@/components/share-project";
import { AiConseiller } from "@/components/ai-conseiller";
import { WeatherSiteWidget } from "@/components/weather-widget";
import { EscrowDialog } from "@/components/escrow-dialog";
import { CostSimulatorDialog } from "@/components/cost-simulator-dialog";
import { WhatsAppShareDialog } from "@/components/whatsapp-share-dialog";
import { GanttScheduleDialog } from "@/components/gantt-schedule-dialog";
import { SafetyAuditDialog } from "@/components/safety-audit-dialog";
import { SiteKioskDialog } from "@/components/site-kiosk-dialog";
import { MaintenanceLogDialog } from "@/components/maintenance-log-dialog";
import { OwnerDashboardDialog } from "@/components/owner-dashboard-dialog";
import { OwnerVaultDialog } from "@/components/owner-vault-dialog";
import { UtilityBillsDialog } from "@/components/utility-bills-dialog";
import { RainwaterHarvestingDialog } from "@/components/rainwater-harvesting-dialog";
import { WorkerAttendanceDialog } from "@/components/worker-attendance-dialog";
import { WeatherDelaysDialog } from "@/components/weather-delays-dialog";
import { ThermalComfortDialog } from "@/components/thermal-comfort-dialog";
import { ElectricalLoadDialog } from "@/components/electrical-load-dialog";
import { exportDossierChantierPdf } from "@/lib/dossier-export";
import { computeSCurve, physicalProgress } from "@/lib/s-curve";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentProject } from "@/context/project-context";
import {
  useBudgetLines,
  useCategories,
  useCompanies,
  useExpenses,
  usePayments,
  useQuotes,
  useSuppliers,
  useTasks,
} from "@/lib/data";
import { useAccess } from "@/lib/roles";
import { tr } from "@/lib/i18n";
import { usePreferences } from "@/context/preferences-context";
import {
  compactFcfa,
  fcfa,
  labelOf,
  monthKey,
  monthLabel,
  num,
  PAYMENT_METHODS,
} from "@/lib/format";

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
  const { lang } = usePreferences();
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: payments = [] } = usePayments(projectId);
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: budgetLines = [] } = useBudgetLines(projectId);
  const { data: tasks = [] } = useTasks(projectId);
  const { canView: canSeeBudget } = useAccess("budget");
  const { canView: canSeePayments } = useAccess("paiements");
  const { canView: canSeeCompanies } = useAccess("entreprises");
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: companies = [] } = useCompanies();
  const [exporting, setExporting] = useState<"pdf" | "excel" | "recap" | "dossier" | null>(null);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const catPhase = useMemo(() => new Map(categories.map((c) => [c.id, c.phase])), [categories]);

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

  const budgetVsActual = useMemo(() => {
    const spentByCat = new Map<string, number>();
    expenses.forEach((e) => {
      if (!e.category_id) return;
      spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
    });
    return budgetLines
      .map((line) => {
        const planned = Number(line.planned_amount);
        const spent = spentByCat.get(line.category_id) ?? 0;
        return {
          phase: catPhase.get(line.category_id) ?? "Poste",
          name: catName.get(line.category_id) ?? "Poste",
          planned,
          spent,
          restant: planned - spent,
          ratio: planned > 0 ? Math.round((spent / planned) * 100) : 0,
        };
      })
      .filter((l) => l.planned > 0 || l.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [budgetLines, expenses, catName, catPhase]);

  // Courbe en S : budget cumulé prévu (phasing smoothstep BTP) vs dépenses réelles.
  const sCurve = useMemo(() => {
    if (!project) return [];
    const lastExpense = expenses.reduce<string | null>((acc, e) => {
      if (e.expense_date && (!acc || e.expense_date > acc)) return e.expense_date;
      return acc;
    }, null);
    return computeSCurve({
      budget,
      startDate: project.start_date,
      endDate: project.end_date ?? lastExpense ?? new Date().toISOString().slice(0, 10),
      expenses,
    }).map((p) => ({ mois: monthLabel(p.moisKey), prévu: p.prevu, réalisé: p.realise }));
  }, [project, expenses, budget]);

  const physical = useMemo(() => physicalProgress(tasks), [tasks]);

  const runExport = async (kind: "pdf" | "excel" | "recap" | "dossier") => {
    if (!project) return;
    setExporting(kind);
    try {
      if (kind === "dossier") {
        await exportDossierChantierPdf({
          projectName: project.name,
          location: [project.quartier, project.commune, project.city].filter(Boolean).join(", "),
          clientName: "Maître d'ouvrage",
          totalBudget: budget,
          totalSpent,
          progressPercent: Math.min(100, Math.round(progress)),
          phases: byCategory.map((c) => ({
            name: c.name,
            status: "in_progress",
            budget: 0,
            spent: c.value,
          })),
          recentPhotosCount: 0,
          summaryNotes: "Suivi certifié BâtiBénin",
        });
        toast.success("Dossier Banque & Diaspora généré !");
        return;
      }
      if (kind === "recap") {
        const { exportProjectSummaryPdf } = await import("@/lib/project-summary-export");
        await exportProjectSummaryPdf({
          project: {
            name: project.name,
            city: project.city,
            commune: project.commune,
            quartier: project.quartier,
            address: project.address,
            status: project.status,
            start_date: project.start_date,
            end_date: project.end_date,
            budget: Number(project.budget ?? 0),
            built_area: Number(project.built_area ?? 0),
            land_area: Number(project.land_area ?? 0),
            house_type: project.house_type,
          },
          spent: totalSpent,
          paid: payments.reduce((s, p) => s + Number(p.amount), 0),
          spentByCategory: byCategory.map((c) => ({ name: c.name, spent: c.value })),
          suppliersCount: suppliers.length,
          companiesCount: companies.length,
          expensesCount: expenses.length,
          paymentsCount: payments.length,
          quotesCount: quotes.length,
        });
        toast.success("Fiche projet PDF téléchargée");
        return;
      }
      const { exportBudgetExcel, exportBudgetPdf } = await import("@/lib/budget-export");
      const payload = {
        projectName: project.name,
        projectBudget: budget,
        unassigned: expenses
          .filter((e) => !e.category_id)
          .reduce((s, e) => s + Number(e.amount), 0),
        rows: budgetLines.map((line) => ({
          phase: catPhase.get(line.category_id) ?? "Poste",
          category: catName.get(line.category_id) ?? "Poste",
          planned: Number(line.planned_amount),
          spent: (() => {
            const cat = line.category_id;
            return expenses
              .filter((e) => e.category_id === cat)
              .reduce((s, e) => s + Number(e.amount), 0);
          })(),
        })),
      };
      if (kind === "pdf") await exportBudgetPdf(payload);
      else await exportBudgetExcel(payload);
      toast.success(kind === "pdf" ? "Rapport PDF téléchargé" : "Rapport Excel téléchargé");
    } catch {
      toast.error("Export impossible. Réessayez.");
    } finally {
      setExporting(null);
    }
  };

  if (isLoading)
    return <p className="text-sm text-muted-foreground">{tr(lang, "dash.chargement")}</p>;

  return (
    <>
      <RoleDashboardStrip />
      {!project ? (
        <EmptyProjectNotice />
      ) : (
        <>
          <PageHeader
            title={project.name}
            subtitle={[project.quartier, project.commune, project.city].filter(Boolean).join(" · ")}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary">
                  {num(progress, 1)} % {tr(lang, "dash.avancement-financier")}
                </Badge>
                <OwnerVaultDialog projectName={project.name} />
                <WorkerAttendanceDialog projectName={project.name} />
                <ThermalComfortDialog />
                <ElectricalLoadDialog />
                <WeatherDelaysDialog />
                <UtilityBillsDialog />
                <RainwaterHarvestingDialog />
                <OwnerDashboardDialog
                  projectName={project.name}
                  progress={Math.round(progress)}
                  totalBudget={project.budget ? Number(project.budget) : 30000000}
                  spent={Number(totalSpent)}
                />
                <MaintenanceLogDialog />
                <SiteKioskDialog projectName={project.name} />
                <CostSimulatorDialog />
                <WhatsAppShareDialog projectName={project.name} />
                <GanttScheduleDialog projectName={project.name} />
                <SafetyAuditDialog projectName={project.name} />
                <EscrowDialog
                  contractTitle={`Chantier ${project.name}`}
                  contractorName="Artisan & Entreprise"
                  totalAmount={budget > 0 ? budget : 2500000}
                />
                <ShareProjectButton project={project} />
                <QuickExpenseDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-2 size-4" /> {tr(lang, "dash.depense-rapide")}
                    </Button>
                  }
                />
                {canSeeBudget && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exporting !== null}
                      onClick={() => runExport("dossier")}
                      title="Dossier complet certifié pour banques ou proches à l'étranger"
                      className="border-primary/40 text-primary font-medium"
                    >
                      <FileText className="mr-2 size-4" />
                      {exporting === "dossier" ? "Export…" : "Dossier Diaspora"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exporting !== null}
                      onClick={() => runExport("recap")}
                      title="Fiche récapitulative du chantier en PDF"
                    >
                      <FileText className="mr-2 size-4" />
                      {exporting === "recap" ? "Export…" : "Récap PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exporting !== null}
                      onClick={() => runExport("pdf")}
                    >
                      <FileDown className="mr-2 size-4" />
                      {exporting === "pdf" ? "Export…" : "Export PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exporting !== null}
                      onClick={() => runExport("excel")}
                    >
                      <FileSpreadsheet className="mr-2 size-4" />
                      {exporting === "excel" ? "Export…" : "Export Excel"}
                    </Button>
                  </>
                )}
              </div>
            }
          />

          <div className="grid gap-4 lg:grid-cols-3 mb-4">
            <div className="lg:col-span-2">
              <StartupChecklist project={project} />
            </div>
            <div>
              <WeatherSiteWidget />
            </div>
          </div>

          <div data-tour="kpis" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {canSeeBudget && (
              <Kpi label={tr(lang, "dash.budget-global")} value={fcfa(budget)} tone="accent" />
            )}
            <Kpi
              label={tr(lang, "dash.depenses-totales")}
              value={fcfa(totalSpent)}
              tone="primary"
            />
            {canSeeBudget && (
              <Kpi
                label={tr(lang, "dash.budget-restant")}
                value={fcfa(remaining)}
                tone={remaining < 0 ? "danger" : "default"}
                hint={remaining < 0 ? tr(lang, "dash.depassement") : undefined}
              />
            )}
            <Kpi
              label={tr(lang, "dash.cout-m2")}
              value={builtArea > 0 ? fcfa(totalSpent / builtArea) : "—"}
              hint={
                builtArea > 0
                  ? `${num(builtArea)} ${tr(lang, "dash.surface-construite")}`
                  : tr(lang, "dash.renseignez-surface")
              }
            />
          </div>

          {canSeeBudget && (
            <div className="panel mt-3 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tr(lang, "dash.avancement-titre")}</span>
                <span className="num">
                  {compactFcfa(totalSpent)} / {compactFcfa(budget)} FCFA
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label={tr(lang, "dash.fournisseurs")} value={num(suppliers.length)} />
            {canSeeCompanies && (
              <Kpi label={tr(lang, "dash.entreprises")} value={num(companies.length)} />
            )}
            <Kpi label={tr(lang, "dash.factures")} value={num(expenses.length)} />
            <Kpi
              label={canSeePayments ? tr(lang, "dash.paiements") : tr(lang, "dash.devis")}
              value={
                canSeePayments
                  ? `${num(payments.length)} · ${num(quotes.length)} ${tr(lang, "dash.devis")}`
                  : num(quotes.length)
              }
            />
          </div>

          {canSeeBudget && alerts.length > 0 && (
            <div className="panel mt-3 p-4">
              <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
                <AlertTriangle className="size-4 text-primary" /> {tr(lang, "dash.alertes-postes")}
              </h2>
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li
                    key={a.name}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
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

          <div className="mt-3">
            <AiConseiller projectId={projectId} />
          </div>

          <div data-tour="charts" className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="panel p-4">
              <h2 className="mb-4 font-display text-sm font-semibold">
                {tr(lang, "dash.par-categorie")}
              </h2>
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
              <h2 className="mb-4 font-display text-sm font-semibold">
                {tr(lang, "dash.evolution-mensuelle")}
              </h2>
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

          {canSeeBudget && (
            <div className="panel mt-3 p-4" data-tour="budget-vs-reel">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
                  <PiggyBank className="size-4 text-primary" /> {tr(lang, "dash.prevu-vs-realise")}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {num(budgetVsActual.filter((l) => l.ratio > 100).length)}{" "}
                  {tr(lang, "dash.poste-depassement")}
                </span>
              </div>
              {budgetVsActual.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun poste budgétaire — générez le budget depuis la checklist ou la page Budget.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {budgetVsActual.map((l) => (
                    <div key={l.name} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-32 flex-1">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {l.phase}
                        </p>
                      </div>
                      <div className="flex min-w-40 flex-1 items-center gap-2">
                        <Progress
                          value={Math.min(100, l.ratio)}
                          className={l.ratio > 100 ? "h-1.5 [&>div]:bg-destructive" : "h-1.5"}
                        />
                        <span
                          className={
                            l.ratio > 100
                              ? "num w-16 text-right text-xs font-semibold text-destructive"
                              : "num w-16 text-right text-xs text-muted-foreground"
                          }
                        >
                          {num(l.ratio)} %
                        </span>
                      </div>
                      <span
                        className={`num w-32 text-right text-xs ${
                          l.restant < 0 ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {l.restant < 0
                          ? tr(lang, "dash.depassement-court")
                          : tr(lang, "dash.reste")}{" "}
                        · {compactFcfa(Math.abs(l.restant))}
                      </span>
                      <Badge
                        variant={l.ratio > 100 ? "destructive" : "outline"}
                        className="w-28 justify-center"
                      >
                        {compactFcfa(l.planned)} → {compactFcfa(l.spent)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {canSeeBudget && budget > 0 && sCurve.length > 1 && (
            <div className="panel mt-3 p-4" data-tour="cashflow">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-sm font-semibold">{tr(lang, "dash.courbe-s")}</h2>
                {physical !== null && (
                  <Badge variant={physical >= progress ? "outline" : "destructive"}>
                    {tr(lang, "dash.avancement-physique")} {num(physical, 0)} % ·{" "}
                    {tr(lang, "dash.financier")} {num(progress, 0)} %
                    {physical + 5 < progress
                      ? tr(lang, "dash.depenses-devancent")
                      : physical - 5 > progress
                        ? tr(lang, "dash.travaux-devancent")
                        : ""}
                  </Badge>
                )}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={sCurve}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="mois" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis
                    tickFormatter={(v) => compactFcfa(v as number)}
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                  />
                  <Tooltip
                    formatter={(v, name) => [
                      fcfa(v as number),
                      name === "prévu" ? "Prévu" : "Réalisé",
                    ]}
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="prévu"
                    stroke="var(--color-chart-4)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="réalisé"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="panel p-4 lg:col-span-1">
              <h2 className="mb-4 font-display text-sm font-semibold">
                {tr(lang, "dash.moyens-paiement")}
              </h2>
              {byMethod.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tr(lang, "dash.aucune-depense")}</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={byMethod}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                    >
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
              <h2 className="mb-4 font-display text-sm font-semibold">
                {tr(lang, "dash.dernieres-depenses")}
              </h2>
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {tr(lang, "dash.aucune-depense-commencez")}
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
              <Receipt className="size-3.5" /> {num(expenses.length)}{" "}
              {tr(lang, "dash.depenses-totales").toLowerCase()}
            </span>
            {canSeePayments && (
              <span className="flex items-center gap-2">
                <Wallet className="size-3.5" />{" "}
                {fcfa(payments.reduce((s, p) => s + Number(p.amount), 0))}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Store className="size-3.5" /> {num(suppliers.length)}{" "}
              {tr(lang, "dash.fournisseurs").toLowerCase()}
            </span>
            <span className="flex items-center gap-2">
              {canSeeCompanies && (
                <>
                  <Building2 className="size-3.5" /> {num(companies.length)}{" "}
                  {tr(lang, "dash.entreprises").toLowerCase()} ·{" "}
                </>
              )}
              <FileText className="size-3.5" /> {num(quotes.length)} {tr(lang, "dash.devis")}
            </span>
          </div>
        </>
      )}
    </>
  );
}
