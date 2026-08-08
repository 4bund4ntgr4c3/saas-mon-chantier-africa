import { createFileRoute } from "@tanstack/react-router";
import { FeatureGate } from "@/components/feature-gate";
import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import { useAllExpenses, useCategories, useSuppliers, useProjects } from "@/lib/data";
import { fcfa, frDate, labelOf, PAYMENT_METHODS } from "@/lib/format";
import type { ReportData } from "@/lib/report-export";

export const Route = createFileRoute("/_authenticated/recherche")({
  head: () => ({
    meta: [
      { title: "Recherche — BâtiBénin" },
      {
        name: "description",
        content:
          "Recherche globale des dépenses par fournisseur, catégorie, date, ville, commune ou chantier, avec export des résultats.",
      },
      { property: "og:title", content: "Recherche — BâtiBénin" },
      {
        property: "og:description",
        content: "Retrouvez n'importe quelle dépense de vos chantiers et exportez les résultats.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="recherche">
      <SearchPage />
    </FeatureGate>
  ),
});

function SearchPage() {
  const { project: currentProject } = useCurrentProject();
  const { data: projects = [] } = useProjects();
  const { data: expenses = [] } = useAllExpenses();
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();

  const [q, setQ] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState("all");
  const [supFilter, setSupFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ville, setVille] = useState("");
  const [commune, setCommune] = useState("");
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const supName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const projName = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  const defaultProject = currentProject?.id ?? "all";

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return expenses.filter((e) => {
      const project = projectFilter === "all" ? defaultProject : projectFilter;
      if (project !== "all" && e.project_id !== project) return false;
      if (catFilter !== "all" && e.category_id !== catFilter) return false;
      if (supFilter !== "all" && e.supplier_id !== supFilter) return false;
      if (from && e.expense_date < from) return false;
      if (to && e.expense_date > to) return false;
      if (ville.trim() && !(e.city ?? "").toLowerCase().includes(ville.trim().toLowerCase()))
        return false;
      if (commune.trim() && !(e.commune ?? "").toLowerCase().includes(commune.trim().toLowerCase()))
        return false;
      if (needle === "") return true;
      const haystack = [
        e.label,
        e.reference,
        catName.get(e.category_id ?? "") ?? "",
        e.supplier_id ? (supName.get(e.supplier_id) ?? "") : "",
        e.company_id ? e.company_id : "",
        e.city,
        e.commune,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [
    expenses,
    q,
    projectFilter,
    catFilter,
    supFilter,
    from,
    to,
    ville,
    commune,
    catName,
    supName,
    defaultProject,
  ]);

  const total = results.reduce((s, e) => s + Number(e.amount), 0);

  const report = useMemo<ReportData | null>(() => {
    return {
      title: "Résultats de recherche — dépenses",
      projectName:
        projectFilter === "all" && defaultProject === "all"
          ? "Tous les chantiers"
          : (projName.get(projectFilter === "all" ? defaultProject : projectFilter) ??
            "Tous les chantiers"),
      columns: [
        "Date",
        "Chantier",
        "Libellé",
        "Catégorie",
        "Fournisseur",
        "Ville",
        "Commune",
        "Montant (FCFA)",
      ],
      rows: results.map((e) => [
        e.expense_date,
        projName.get(e.project_id) ?? "—",
        e.label,
        e.category_id ? (catName.get(e.category_id) ?? "—") : "—",
        e.supplier_id ? (supName.get(e.supplier_id) ?? "—") : "—",
        e.city ?? "—",
        e.commune ?? "—",
        Number(e.amount),
      ]),
      total: ["", "", "", "", "", "", "Total", total],
      rightAlign: [7],
    };
  }, [results, total, projName, catName, supName, projectFilter, defaultProject]);

  async function runExport(kind: "pdf" | "excel") {
    if (!report) return;
    setExporting(kind);
    try {
      const { exportReportExcel, exportReportPdf } = await import("@/lib/report-export");
      if (kind === "pdf") await exportReportPdf(report);
      else await exportReportExcel(report);
      toast.success(`Résultats exportés (${results.length} ligne(s))`);
    } catch {
      toast.error("Export impossible. Réessayez.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Recherche"
        subtitle={`${results.length} résultat(s) · ${fcfa(total)}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => runExport("pdf")}
              disabled={exporting !== null || results.length === 0}
            >
              <FileDown className="mr-2 size-4" /> PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => runExport("excel")}
              disabled={exporting !== null || results.length === 0}
            >
              <FileSpreadsheet className="mr-2 size-4" /> Excel
            </Button>
          </div>
        }
      />

      <div className="panel mb-3 grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Libellé, facture, fournisseur, ville…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Chantier</Label>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les chantiers</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Catégorie</Label>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Fournisseur</Label>
          <Select value={supFilter} onValueChange={setSupFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Du</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Au</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Ville</Label>
          <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Cotonou" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Commune</Label>
          <Input
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            placeholder="Abomey-Calavi"
          />
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Chantier</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Fournisseur</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  Aucune dépense ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              results.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {frDate(e.expense_date)}
                  </td>
                  <td className="px-4 py-3">{projName.get(e.project_id) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p>{e.label}</p>
                    {e.reference && (
                      <p className="text-xs text-muted-foreground">Réf. {e.reference}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.category_id ? (
                      <Badge variant="outline">{catName.get(e.category_id)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.supplier_id ? (supName.get(e.supplier_id) ?? "—") : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[e.commune, e.city].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {labelOf(PAYMENT_METHODS, e.method)}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-primary">
                    {fcfa(Number(e.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
