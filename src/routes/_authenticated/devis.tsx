import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { ReadOnlyNotice } from "@/components/feature-gate";
import { useAccess } from "@/lib/roles";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import {
  useCategories,
  useCompanies,
  useDeleteRow,
  useQuotes,
  useSaveRow,
  useSuppliers,
  type Quote,
} from "@/lib/data";
import { fcfa, frDate, labelOf, QUOTE_STATUSES } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/devis")({
  head: () => ({
    meta: [
      { title: "Devis fournisseurs — BâtiBénin" },
      {
        name: "description",
        content:
          "Comparez les devis de vos fournisseurs et entreprises, suivez leur statut et leur validité, en FCFA.",
      },
      { property: "og:title", content: "Devis fournisseurs — BâtiBénin" },
      {
        property: "og:description",
        content: "Centralisez et comparez les devis de votre chantier.",
      },
    ],
  }),
  component: QuotesPage,
});

function QuotesPage() {
  const { canEdit } = useAccess("devis");
  const { project, projectId } = useCurrentProject();
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: companies = [] } = useCompanies();
  const save = useSaveRow("quotes", "Devis enregistré");
  const remove = useDeleteRow("quotes");
  const [editing, setEditing] = useState<Quote | null>(null);

  const fields: Field[] = useMemo(
    () => [
      { name: "label", label: "Objet du devis", required: true, full: true },
      { name: "amount", label: "Montant (FCFA)", type: "number", required: true },
      { name: "quote_date", label: "Date du devis", type: "date", required: true },
      { name: "valid_until", label: "Valable jusqu'au", type: "date" },
      {
        name: "status",
        label: "Statut",
        type: "select",
        options: QUOTE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
      },
      {
        name: "category_id",
        label: "Catégorie",
        type: "select",
        options: categories.map((c) => ({ value: c.id, label: `${c.phase} · ${c.name}` })),
      },
      {
        name: "supplier_id",
        label: "Fournisseur",
        type: "select",
        options: suppliers.map((s) => ({ value: s.id, label: s.name })),
      },
      {
        name: "company_id",
        label: "Entreprise",
        type: "select",
        options: companies.map((c) => ({ value: c.id, label: c.name })),
      },
      { name: "reference", label: "Référence" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    [categories, suppliers, companies],
  );

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const supName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const compName = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);

  function toPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      project_id: projectId,
      label: g("label").trim(),
      amount: toNumber(g("amount")) ?? 0,
      quote_date: g("quote_date") || new Date().toISOString().slice(0, 10),
      valid_until: orNull(g("valid_until")),
      status: g("status") || "en_attente",
      category_id: orNull(g("category_id")),
      supplier_id: orNull(g("supplier_id")),
      company_id: orNull(g("company_id")),
      reference: orNull(g("reference")),
      notes: orNull(g("notes")),
    };
  }

  if (!project) return <EmptyProjectNotice />;

  const total = quotes.reduce((s, q) => s + Number(q.amount), 0);

  return (
    <>
      <PageHeader
        title="Devis"
        subtitle={`${quotes.length} devis · ${fcfa(total)} cumulés`}
        action={
          canEdit ? (
          <RecordDialog
            title="Nouveau devis"
            fields={fields}
            initial={{
              status: "en_attente",
              quote_date: new Date().toISOString().slice(0, 10),
            }}
            trigger={
              <Button>
                <Plus className="size-4" /> Ajouter un devis
              </Button>
            }
            onSubmit={async (v) => save.mutateAsync({ values: toPayload(v) })}
          />
          ) : undefined
        }
      />

      <ReadOnlyNotice feature="devis" />

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Objet</th>
              <th className="px-4 py-3">Émetteur</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Validité</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  Aucun devis enregistré.
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="transition-colors hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {frDate(q.quote_date)}
                  </td>
                  <td className="px-4 py-3">
                    <p>{q.label}</p>
                    {q.reference && (
                      <p className="text-xs text-muted-foreground">Réf. {q.reference}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(q.supplier_id && supName.get(q.supplier_id)) ||
                      (q.company_id && compName.get(q.company_id)) ||
                      "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {q.category_id ? catName.get(q.category_id) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {frDate(q.valid_until)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        q.status === "accepte" || q.status === "converti"
                          ? "default"
                          : q.status === "rejete"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {labelOf(QUOTE_STATUSES, q.status)}
                    </Badge>
                  </td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-primary">
                    {fcfa(Number(q.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => setEditing(q)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Supprimer ce devis ?")) remove.mutate(q.id);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
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
          title="Modifier le devis"
          fields={fields}
          initial={{
            label: editing.label,
            amount: String(editing.amount),
            quote_date: editing.quote_date,
            valid_until: editing.valid_until ?? "",
            status: editing.status,
            category_id: editing.category_id ?? "",
            supplier_id: editing.supplier_id ?? "",
            company_id: editing.company_id ?? "",
            reference: editing.reference ?? "",
            notes: editing.notes ?? "",
          }}
          onSubmit={async (v) => save.mutateAsync({ id: editing.id, values: toPayload(v) })}
        />
      )}
    </>
  );
}
