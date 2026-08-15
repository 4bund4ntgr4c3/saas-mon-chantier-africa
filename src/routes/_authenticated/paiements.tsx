import { createFileRoute } from "@tanstack/react-router";
import { FeatureGate } from "@/components/feature-gate";
import { useMemo, useState } from "react";
import { Pencil, Plus, Smartphone, Trash2, Upload } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { MobileMoneyDialog } from "@/components/mobile-money-dialog";
import { PaymentRemindersDialog } from "@/components/payment-reminders-dialog";
import { PaymentGatewayDialog } from "@/components/payment-gateway-dialog";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { ImportDialog, type ImportColumn } from "@/components/import-csv";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import {
  useCompanies,
  useDeleteRow,
  useImportRows,
  usePayments,
  usePaymentTransactions,
  useSaveRow,
  useSuppliers,
  type Payment,
} from "@/lib/data";
import {
  fcfa,
  frDate,
  labelOf,
  PAYMENT_METHODS,
  PAYMENT_PROVIDERS,
  PAYMENT_TYPES,
  PAYMENT_TRANSACTION_STATUSES,
} from "@/lib/format";

export const Route = createFileRoute("/_authenticated/paiements")({
  head: () => ({
    meta: [
      { title: "Paiements et acomptes — BâtiBénin" },
      {
        name: "description",
        content:
          "Historique des acomptes, paiements partiels et soldes versés aux fournisseurs et entreprises du chantier.",
      },
      { property: "og:title", content: "Paiements et acomptes — BâtiBénin" },
      {
        property: "og:description",
        content: "Gardez la trace de chaque versement de votre construction.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="paiements">
      <PaymentsPage />
    </FeatureGate>
  ),
});

function PaymentsPage() {
  const { project, projectId } = useCurrentProject();
  const { data: payments = [] } = usePayments(projectId);
  const { data: transactions = [] } = usePaymentTransactions(projectId);
  const { data: suppliers = [] } = useSuppliers();
  const { data: companies = [] } = useCompanies();
  const save = useSaveRow("payments", "Paiement enregistré");
  const remove = useDeleteRow("payments");
  const [editing, setEditing] = useState<Payment | null>(null);
  const [mmOpen, setMmOpen] = useState(false);

  const fields: Field[] = useMemo(
    () => [
      { name: "amount", label: "Montant (FCFA)", type: "number", required: true },
      { name: "payment_date", label: "Date du paiement", type: "date", required: true },
      { name: "due_date", label: "Date d'échéance", type: "date" },
      {
        name: "kind",
        label: "Type de paiement",
        type: "select",
        options: PAYMENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
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
        label: "Entreprise",
        type: "select",
        options: companies.map((c) => ({ value: c.id, label: c.name })),
      },
      { name: "reference", label: "Référence / n° transaction" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    [suppliers, companies],
  );

  const importRows = useImportRows("payments");

  const IMPORT_COLUMNS: ImportColumn[] = [
    { key: "amount", label: "Montant", aliases: ["montant", "amount", "montant fcfa"] },
    {
      key: "payment_date",
      label: "Date de paiement",
      aliases: ["date", "date de paiement", "payment date"],
    },
    {
      key: "due_date",
      label: "Échéance",
      aliases: ["echeance", "échéance", "due date", "date limite"],
    },
    { key: "kind", label: "Type", aliases: ["type", "type de paiement", "kind"] },
    {
      key: "method",
      label: "Moyen",
      aliases: ["moyen", "moyen de paiement", "methode", "méthode", "method"],
    },
    { key: "supplier", label: "Fournisseur", aliases: ["fournisseur", "supplier"] },
    {
      key: "company",
      label: "Entreprise",
      aliases: ["entreprise", "company", "societe", "société"],
    },
    { key: "reference", label: "Référence", aliases: ["reference", "référence", "transaction"] },
    { key: "notes", label: "Notes", aliases: ["notes", "commentaire"] },
  ];

  const supName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const compName = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);

  function toPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      project_id: projectId,
      amount: toNumber(g("amount")) ?? 0,
      payment_date: g("payment_date") || new Date().toISOString().slice(0, 10),
      due_date: orNull(g("due_date")),
      kind: g("kind") || "comptant",
      method: g("method") || "especes",
      supplier_id: orNull(g("supplier_id")),
      company_id: orNull(g("company_id")),
      reference: orNull(g("reference")),
      notes: orNull(g("notes")),
    };
  }

  if (!project) return <EmptyProjectNotice />;

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <PageHeader
        title="Paiements"
        subtitle={`${payments.length} versement(s) · ${fcfa(total)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <PaymentGatewayDialog />
            <PaymentRemindersDialog />
            <Button variant="outline" onClick={() => setMmOpen(true)}>
              <Smartphone className="size-4 mr-1.5" /> Payer par mobile money
            </Button>
            <MobileMoneyDialog
              projectId={projectId}
              amount={100000}
              open={mmOpen}
              onOpenChange={setMmOpen}
            />
            <ImportDialog
              title="Importer des paiements"
              description="Téléversez un fichier CSV ou Excel de paiements pour ce chantier."
              columns={IMPORT_COLUMNS}
              onImport={async (rows) => {
                const supByName = new Map(suppliers.map((s) => [s.name.toLowerCase(), s.id]));
                const compByName = new Map(companies.map((c) => [c.name.toLowerCase(), c.id]));
                const kindByName = new Map(
                  PAYMENT_TYPES.map((t) => [t.label.toLowerCase(), t.value]),
                );
                const methodByName = new Map(
                  PAYMENT_METHODS.map((m) => [m.label.toLowerCase(), m.value]),
                );
                const payload = rows.map((r) => ({
                  project_id: projectId,
                  amount:
                    Number(
                      String(r["amount"] ?? "")
                        .replace(/\s/g, "")
                        .replace(",", "."),
                    ) || 0,
                  payment_date: r["payment_date"] || new Date().toISOString().slice(0, 10),
                  due_date: orNull(r["due_date"]),
                  kind: kindByName.get((r["kind"] ?? "").toLowerCase().trim()) ?? "comptant",
                  method: methodByName.get((r["method"] ?? "").toLowerCase().trim()) ?? "especes",
                  supplier_id: supByName.get((r["supplier"] ?? "").toLowerCase().trim()) ?? null,
                  company_id: compByName.get((r["company"] ?? "").toLowerCase().trim()) ?? null,
                  reference: orNull(r["reference"]),
                  notes: orNull(r["notes"]),
                }));
                await importRows.mutateAsync(payload);
              }}
              trigger={
                <Button variant="outline">
                  <Upload className="size-4" /> Importer
                </Button>
              }
            />
            <RecordDialog
              title="Nouveau paiement"
              fields={fields}
              initial={{
                kind: "comptant",
                method: "especes",
                payment_date: new Date().toISOString().slice(0, 10),
              }}
              trigger={
                <Button data-tour="payment-new">
                  <Plus className="size-4" /> Ajouter un paiement
                </Button>
              }
              onSubmit={async (v) => save.mutateAsync({ values: toPayload(v) })}
            />
          </div>
        }
      />

      <div data-tour="payment-table" className="panel overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Bénéficiaire</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Moyen</th>
              <th className="px-4 py-3">Échéance</th>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  Aucun paiement enregistré.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {frDate(p.payment_date)}
                  </td>
                  <td className="px-4 py-3">
                    {(p.supplier_id && supName.get(p.supplier_id)) ||
                      (p.company_id && compName.get(p.company_id)) ||
                      "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{labelOf(PAYMENT_TYPES, p.kind)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {labelOf(PAYMENT_METHODS, p.method)}
                  </td>
                  <td className="px-4 py-3">
                    {p.due_date ? (
                      p.due_date < new Date().toISOString().slice(0, 10) ? (
                        <Badge variant="destructive">En retard · {frDate(p.due_date)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">{frDate(p.due_date)}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.reference ?? "—"}</td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-primary">
                    {fcfa(Number(p.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Supprimer ce paiement ?")) remove.mutate(p.id);
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

      <div data-tour="mm-transactions" className="panel overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-display text-sm font-semibold">Transactions mobile money</h3>
          <p className="text-xs text-muted-foreground">
            Paiements initiés via passerelles (MTN MoMo, Moov Money, …) en sandbox.
          </p>
        </div>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Passerelle</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Référence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Aucune transaction mobile money.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {frDate(t.created_at)}
                  </td>
                  <td className="px-4 py-3">{labelOf(PAYMENT_PROVIDERS, t.provider)}</td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-primary">
                    {fcfa(Number(t.amount))}
                  </td>
                  <td className="px-4 py-3">
                    <TransactionBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.transaction_id ?? t.reference ?? "—"}
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
          title="Modifier le paiement"
          fields={fields}
          initial={{
            amount: String(editing.amount),
            payment_date: editing.payment_date,
            due_date: editing.due_date ?? "",
            kind: editing.kind,
            method: editing.method,
            supplier_id: editing.supplier_id ?? "",
            company_id: editing.company_id ?? "",
            reference: editing.reference ?? "",
            notes: editing.notes ?? "",
          }}
          onSubmit={async (v) => save.mutateAsync({ id: editing.id, values: toPayload(v) })}
        />
      )}
      <MobileMoneyDialog
        projectId={projectId}
        amount={total}
        open={mmOpen}
        onOpenChange={setMmOpen}
      />
    </>
  );
}

function TransactionBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    initiee: "text-muted-foreground",
    en_attente: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    confirmee:
      "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    echouee: "border-destructive bg-destructive/10 text-destructive",
    annulee: "border-destructive bg-destructive/10 text-destructive",
  };
  return (
    <Badge variant="outline" className={`border ${tone[status] ?? ""}`}>
      {labelOf(PAYMENT_TRANSACTION_STATUSES, status)}
    </Badge>
  );
}
