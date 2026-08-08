import { createFileRoute } from "@tanstack/react-router";
import { FeatureGate } from "@/components/feature-gate";
import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import { useBudgetLines, useCategories, useCompanies, useExpenses, useSuppliers } from "@/lib/data";
import { fcfa, monthKey, monthLabel, num } from "@/lib/format";
import type { ReportData } from "@/lib/report-export";

export const Route = createFileRoute("/_authenticated/rapports")({
  head: () => ({
    meta: [
      { title: "Rapports — BâtiBénin" },
      {
        name: "description",
        content:
          "Rapports de dépenses par mois, catégorie, fournisseur et commune, comparaison budget prévu vs réalisé, export PDF et Excel.",
      },
      { property: "og:title", content: "Rapports — BâtiBénin" },
      {
        property: "og:description",
        content: "Analysez vos coûts de construction et exportez vos rapports en FCFA.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="rapports">
      <ReportsPage />
    </FeatureGate>
  ),
});

type ReportKind = "budget" | "mois" | "categorie" | "fournisseur" | "commune" | "entreprise";

const REPORT_OPTIONS: { value: ReportKind; label: string }[] = [
  { value: "budget", label: "Budget prévu vs réalisé" },
  { value: "mois", label: "Dépenses par mois" },
  { value: "categorie", label: "Dépenses par catégorie" },
  { value: "fournisseur", label: "Dépenses par fournisseur" },
  { value: "commune", label: "Dépenses par commune" },
  { value: "entreprise", label: "Dépenses par entreprise" },
];

const RIGHT = [1, 2];

function pct(value: number, total: number) {
  return total > 0 ? `${num((value / total) * 100)} %` : "—";
}

function ReportsPage() {
  const { project, projectId } = useCurrentProject();
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: companies = [] } = useCompanies();
  const { data: lines = [] } = useBudgetLines(projectId);
  const [kind, setKind] = useState<ReportKind>("budget");
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const catPhase = useMemo(() => new Map(categories.map((c) => [c.id, c.phase])), [categories]);
  const supName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const compName = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const report = useMemo<ReportData | null>(() => {
    if (!project) return null;

    if (kind === "budget") {
      const plannedByCat = new Map(lines.map((l) => [l.category_id, Number(l.planned_amount)]));
      const spentByCat = new Map<string, number>();
      for (const e of expenses) {
        if (!e.category_id) continue;
        spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
      }
      const rows: (string | number)[][] = categories
        .filter((c) => (plannedByCat.get(c.id) ?? 0) > 0 || (spentByCat.get(c.id) ?? 0) > 0)
        .map((c) => {
          const planned = plannedByCat.get(c.id) ?? 0;
          const spent = spentByCat.get(c.id) ?? 0;
          return [
            c.phase,
            c.name,
            planned,
            spent,
            planned - spent,
            planned > 0 ? `${Math.round((spent / planned) * 100)} %` : "—",
          ];
        })
        .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
      const planned = lines.reduce((s, l) => s + Number(l.planned_amount), 0);
      return {
        title: "Rapport budgétaire — prévu vs réalisé",
        projectName: project.name,
        columns: [
          "Phase",
          "Poste",
          "Prévu (FCFA)",
          "Réalisé (FCFA)",
          "Écart (FCFA)",
          "Consommé (%)",
        ],
        rows,
        total: ["Total", "", planned, total, planned - total, ""],
        rightAlign: [2, 3, 4],
      };
    }

    if (kind === "mois") {
      const byMonth = new Map<string, number>();
      for (const e of expenses) {
        const key = monthKey(e.expense_date);
        byMonth.set(key, (byMonth.get(key) ?? 0) + Number(e.amount));
      }
      const rows = [...byMonth.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [monthLabel(key), value, pct(value, total)]);
      return {
        title: "Rapport des dépenses par mois",
        projectName: project.name,
        columns: ["Mois", "Dépenses (FCFA)", "Part du total"],
        rows,
        total: ["Total", total, "100 %"],
        rightAlign: RIGHT,
      };
    }

    const aggregate =
      kind === "categorie"
        ? { label: "Catégorie", map: new Map<string, number>(), name: catName }
        : kind === "fournisseur"
          ? { label: "Fournisseur", map: new Map<string, number>(), name: supName }
          : kind === "commune"
            ? { label: "Commune", map: new Map<string, number>(), name: null }
            : { label: "Entreprise", map: new Map<string, number>(), name: compName };

    for (const e of expenses) {
      let key: string | null = null;
      if (kind === "categorie")
        key = e.category_id ? (catName.get(e.category_id) ?? "Non classé") : "Non classé";
      else if (kind === "fournisseur")
        key = e.supplier_id ? (supName.get(e.supplier_id) ?? "Inconnu") : "Sans fournisseur";
      else if (kind === "commune") key = e.commune || e.city || "Non renseignée";
      else key = e.company_id ? (compName.get(e.company_id) ?? "Inconnue") : "Sans entreprise";
      if (key !== null) aggregate.map.set(key, (aggregate.map.get(key) ?? 0) + Number(e.amount));
    }

    const rows = [...aggregate.map.entries()]
      .map(([label, value]) => [label, value, pct(value, total)])
      .sort((a, b) => Number(b[1]) - Number(a[1]));

    const titles: Record<ReportKind, string> = {
      budget: "",
      mois: "",
      categorie: "Rapport des dépenses par catégorie",
      fournisseur: "Rapport des dépenses par fournisseur",
      commune: "Rapport des dépenses par commune",
      entreprise: "Rapport des dépenses par entreprise",
    };

    return {
      title: titles[kind],
      projectName: project.name,
      columns: [aggregate.label, "Dépenses (FCFA)", "Part du total"],
      rows,
      total: ["Total", total, "100 %"],
      rightAlign: RIGHT,
    };
  }, [kind, project, expenses, categories, lines, catName, supName, compName, total]);

  async function runExport(exportKind: "pdf" | "excel") {
    if (!report) return;
    setExporting(exportKind);
    try {
      const { exportReportExcel, exportReportPdf } = await import("@/lib/report-export");
      if (exportKind === "pdf") await exportReportPdf(report);
      else await exportReportExcel(report);
      toast.success(`Rapport ${exportKind === "pdf" ? "PDF" : "Excel"} téléchargé`);
    } catch {
      toast.error("Export impossible. Réessayez.");
    } finally {
      setExporting(null);
    }
  }

  if (!project) return <EmptyProjectNotice />;

  return (
    <>
      <PageHeader
        title="Rapports"
        subtitle={`Analyse du chantier « ${project.name} » · ${fcfa(total)} dépensés au total`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={kind} onValueChange={(v) => setKind(v as ReportKind)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => runExport("pdf")}
              disabled={exporting !== null}
            >
              <FileDown className="mr-2 size-4" />
              {exporting === "pdf" ? "Export…" : "PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => runExport("excel")}
              disabled={exporting !== null}
            >
              <FileSpreadsheet className="mr-2 size-4" />
              {exporting === "excel" ? "Export…" : "Excel"}
            </Button>
          </div>
        }
      />

      {exporting && (
        <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Génération du fichier…
        </p>
      )}

      {report && (
        <div className="panel overflow-x-auto">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-sm font-semibold">{report.title}</h2>
          </div>
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {report.columns.map((c, i) => (
                  <th
                    key={c}
                    className={
                      report.rightAlign?.includes(i) ? "px-4 py-3 text-right" : "px-4 py-3"
                    }
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={report.columns.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Aucune donnée pour ce rapport.
                  </td>
                </tr>
              ) : (
                report.rows.map((r, i) => (
                  <tr key={i} className="transition-colors hover:bg-secondary/40">
                    {r.map((cell, j) => (
                      <td
                        key={j}
                        className={
                          report.rightAlign?.includes(j)
                            ? "num whitespace-nowrap px-4 py-3 text-right"
                            : "px-4 py-3"
                        }
                      >
                        {typeof cell === "number" ? fcfa(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
            {report.total && (
              <tfoot>
                <tr className="border-t border-border bg-secondary/30 font-semibold">
                  {report.total.map((cell, j) => (
                    <td
                      key={j}
                      className={
                        report.rightAlign?.includes(j)
                          ? "num whitespace-nowrap px-4 py-3 text-right"
                          : "px-4 py-3"
                      }
                    >
                      {typeof cell === "number" ? fcfa(cell) : cell}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </>
  );
}
