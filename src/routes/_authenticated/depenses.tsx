import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import {
  useCategories,
  useCompanies,
  useDeleteRow,
  useExpenses,
  useSaveRow,
  useSuppliers,
  type Expense,
} from "@/lib/data";
import { fcfa, frDate, labelOf, PAYMENT_METHODS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/depenses")({
  head: () => ({
    meta: [
      { title: "Dépenses du chantier — BâtiBénin" },
      {
        name: "description",
        content:
          "Enregistrez et filtrez chaque dépense de construction par catégorie, fournisseur et moyen de paiement, en FCFA.",
      },
      { property: "og:title", content: "Dépenses du chantier — BâtiBénin" },
      {
        property: "og:description",
        content: "Suivi détaillé des dépenses de votre construction au Bénin.",
      },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { project, projectId } = useCurrentProject();
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: companies = [] } = useCompanies();
  const save = useSaveRow("expenses", "Dépense enregistrée");
  const remove = useDeleteRow("expenses");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const fields: Field[] = useMemo(
    () => [
      { name: "label", label: "Libellé", required: true, full: true },
      { name: "amount", label: "Montant (FCFA)", type: "number", required: true },
      { name: "expense_date", label: "Date", type: "date", required: true },
      {
        name: "category_id",
        label: "Catégorie",
        type: "select",
        options: categories.map((c) => ({ value: c.id, label: `${c.phase} · ${c.name}` })),
      },
      {
        name: "method",
        label: "Moyen de paiement",
        type: "select",
        options: PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label })),
      },
      {
        name: "supplier_id",
        label: "Fournisseur",
        type: "select",
        options: suppliers.map((s) => ({ value: s.id, label: s.name })),
      },
      {
        name: "company_id",
        label: "Entreprise / artisan",
        type: "select",
        options: companies.map((c) => ({ value: c.id, label: c.name })),
      },
      { name: "quantity", label: "Quantité", type: "number" },
      { name: "unit_price", label: "Prix unitaire (FCFA)", type: "number" },
      { name: "reference", label: "N° facture / reçu" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    [categories, suppliers, companies],
  );

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const supName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const compName = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);

  const filtered = expenses.filter((e) => {
    const okCat = catFilter === "all" || e.category_id === catFilter;
    const q = search.trim().toLowerCase();
    const okSearch =
      q === "" ||
      e.label.toLowerCase().includes(q) ||
      (e.reference ?? "").toLowerCase().includes(q);
    return okCat && okSearch;
  });

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  function toPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      project_id: projectId,
      label: g("label").trim(),
      amount: toNumber(g("amount")) ?? 0,
      expense_date: g("expense_date") || new Date().toISOString().slice(0, 10),
      category_id: orNull(g("category_id")),
      method: g("method") || "especes",
      supplier_id: orNull(g("supplier_id")),
      company_id: orNull(g("company_id")),
      quantity: toNumber(g("quantity")),
      unit_price: toNumber(g("unit_price")),
      reference: orNull(g("reference")),
      notes: orNull(g("notes")),
    };
  }

  function toValues(e: Expense): Values {
    return {
      label: e.label,
      amount: String(e.amount),
      expense_date: e.expense_date,
      category_id: e.category_id ?? "",
      method: e.method,
      supplier_id: e.supplier_id ?? "",
      company_id: e.company_id ?? "",
      quantity: e.quantity != null ? String(e.quantity) : "",
      unit_price: e.unit_price != null ? String(e.unit_price) : "",
      reference: e.reference ?? "",
      notes: e.notes ?? "",
    };
  }

  if (!project) return <EmptyProjectNotice />;

  return (
    <>
      <PageHeader
        title="Dépenses"
        subtitle={`${filtered.length} dépense(s) · ${fcfa(total)}`}
        action={
          <RecordDialog
            title="Nouvelle dépense"
            description="Chaque sortie d'argent du chantier."
            fields={fields}
            initial={{
              method: "especes",
              expense_date: new Date().toISOString().slice(0, 10),
            }}
            trigger={
              <Button data-tour="expense-new">
                <Plus className="size-4" /> Ajouter une dépense
              </Button>
            }
            onSubmit={async (v) => save.mutateAsync({ values: toPayload(v) })}
          />
        }
      />

      <div className="panel mb-3 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher un libellé ou une facture…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.phase} · {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div data-tour="expense-table" className="panel overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Bénéficiaire</th>
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  Aucune dépense enregistrée.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {frDate(e.expense_date)}
                  </td>
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
                    {(e.supplier_id && supName.get(e.supplier_id)) ||
                      (e.company_id && compName.get(e.company_id)) ||
                      "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {labelOf(PAYMENT_METHODS, e.method)}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-primary">
                    {fcfa(Number(e.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(e)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Supprimer cette dépense ?")) remove.mutate(e.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <RecordDialog
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title="Modifier la dépense"
          fields={fields}
          initial={toValues(editing)}
          onSubmit={async (v) => save.mutateAsync({ id: editing.id, values: toPayload(v) })}
        />
      )}
    </>
  );
}
