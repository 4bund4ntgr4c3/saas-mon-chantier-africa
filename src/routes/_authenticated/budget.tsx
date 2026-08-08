import { createFileRoute } from "@tanstack/react-router";
import { FeatureGate } from "@/components/feature-gate";
import { useMemo, useState } from "react";
import { Check, FileDown, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCurrentProject } from "@/context/project-context";
import { useBudgetLines, useCategories, useExpenses, useSaveRow } from "@/lib/data";
import { fcfa } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { title: "Budget prévisionnel — BâtiBénin" },
      {
        name: "description",
        content:
          "Planifiez le budget de votre chantier par poste (terrassement, fondations, finitions…) et comparez-le aux dépenses réelles en FCFA.",
      },
      { property: "og:title", content: "Budget prévisionnel — BâtiBénin" },
      {
        property: "og:description",
        content: "Comparez budget planifié et dépenses réelles poste par poste.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="budget">
      <BudgetPage />
    </FeatureGate>
  ),
});

function BudgetPage() {
  const { project, projectId } = useCurrentProject();
  const { data: categories = [] } = useCategories();
  const { data: lines = [] } = useBudgetLines(projectId);
  const { data: expenses = [] } = useExpenses(projectId);
  const save = useSaveRow("budget_lines", "Budget mis à jour");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const lineByCategory = useMemo(() => new Map(lines.map((l) => [l.category_id, l])), [lines]);

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      if (!e.category_id) continue;
      map.set(e.category_id, (map.get(e.category_id) ?? 0) + Number(e.amount));
    }
    return map;
  }, [expenses]);

  const grouped = useMemo(() => {
    const byPhase = new Map<string, typeof categories>();
    for (const c of categories) {
      const list = byPhase.get(c.phase) ?? [];
      list.push(c);
      byPhase.set(c.phase, list);
    }
    return [...byPhase.entries()];
  }, [categories]);

  if (!project) return <EmptyProjectNotice />;

  const planned = lines.reduce((s, l) => s + Number(l.planned_amount), 0);
  const spent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const unassigned = expenses
    .filter((e) => !e.category_id)
    .reduce((s, e) => s + Number(e.amount), 0);

  async function savePlanned(categoryId: string) {
    const raw = drafts[categoryId];
    if (raw === undefined) return;
    const amount = Number(raw.replace(/\s/g, "").replace(",", ".")) || 0;
    const existing = lineByCategory.get(categoryId);
    await save.mutateAsync({
      ...(existing ? { id: existing.id } : {}),
      values: existing
        ? { planned_amount: amount }
        : { project_id: projectId, category_id: categoryId, planned_amount: amount },
    });

    setDrafts((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }

  async function runExport(kind: "pdf" | "excel") {
    if (!project) return;
    setExporting(kind);
    try {
      const { exportBudgetExcel, exportBudgetPdf } = await import("@/lib/budget-export");
      const payload = {
        projectName: project.name,
        projectBudget: Number(project.budget ?? 0),
        unassigned,
        rows: grouped.flatMap(([phase, cats]) =>
          cats.map((c) => ({
            phase,
            category: c.name,
            planned: Number(lineByCategory.get(c.id)?.planned_amount ?? 0),
            spent: spentByCategory.get(c.id) ?? 0,
          })),
        ),
      };
      if (kind === "pdf") await exportBudgetPdf(payload);
      else await exportBudgetExcel(payload);
      toast.success(kind === "pdf" ? "Rapport PDF téléchargé" : "Rapport Excel téléchargé");
    } catch {
      toast.error("Export impossible. Réessayez.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Budget prévisionnel"
        subtitle={`${fcfa(planned)} planifiés · ${fcfa(spent)} dépensés · enveloppe projet ${fcfa(project.budget)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => runExport("pdf")}
              disabled={exporting !== null}
            >
              <FileDown className="mr-2 size-4" />
              {exporting === "pdf" ? "Export…" : "Export PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => runExport("excel")}
              disabled={exporting !== null}
            >
              <FileSpreadsheet className="mr-2 size-4" />
              {exporting === "excel" ? "Export…" : "Export Excel"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Budget planifié par poste" value={fcfa(planned)} />
        <SummaryCard label="Dépenses réelles" value={fcfa(spent)} />
        <SummaryCard
          label={spent > planned ? "Dépassement" : "Reste à dépenser"}
          value={fcfa(Math.abs(planned - spent))}
          tone={spent > planned ? "danger" : "ok"}
        />
      </div>

      {unassigned > 0 && (
        <p className="mb-5 rounded-md border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          {fcfa(unassigned)} de dépenses ne sont rattachées à aucun poste — ajoutez une catégorie à
          ces dépenses pour un suivi complet.
        </p>
      )}

      <div className="space-y-7">
        {grouped.map(([phase, cats]) => (
          <section key={phase}>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {phase}
            </h2>
            <div className="panel divide-y divide-border">
              {cats.map((c) => {
                const line = lineByCategory.get(c.id);
                const plannedAmount = Number(line?.planned_amount ?? 0);
                const used = spentByCategory.get(c.id) ?? 0;
                const pct = plannedAmount > 0 ? Math.min(100, (used / plannedAmount) * 100) : 0;
                const draft = drafts[c.id];
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span
                          className={
                            plannedAmount > 0 && used > plannedAmount
                              ? "text-xs font-medium text-destructive"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          {fcfa(used)}
                          {plannedAmount > 0 ? ` / ${fcfa(plannedAmount)}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-40"
                        inputMode="decimal"
                        placeholder="Montant prévu"
                        value={draft ?? (plannedAmount ? String(plannedAmount) : "")}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      />
                      <Button
                        size="icon"
                        variant={draft === undefined ? "ghost" : "default"}
                        disabled={draft === undefined || save.isPending}
                        onClick={() => savePlanned(c.id)}
                        aria-label={`Enregistrer le budget de ${c.name}`}
                      >
                        <Check className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "danger";
}) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          tone === "danger"
            ? "mt-1 font-display text-xl font-semibold text-destructive"
            : "mt-1 font-display text-xl font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}
