import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Receipt, Send } from "lucide-react";
import { toast } from "sonner";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate, ReadOnlyNotice } from "@/components/feature-gate";
import { RecordDialog, orNull, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCurrentProject } from "@/context/project-context";
import {
  useAddInvoicePayment,
  useDeleteRow,
  useInvoicePayments,
  useInvoices,
  useSaveRow,
  type Invoice,
} from "@/lib/data";
import { fcfa, frDate, labelOf, num, PAYMENT_METHODS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/facturation")({
  head: () => ({
    meta: [
      { title: "Facturation client — BâtiBénin" },
      {
        name: "description",
        content:
          "Facturez vos chantiers, suivez les encaissements et relancez vos clients en FCFA.",
      },
      { property: "og:title", content: "Facturation client — BâtiBénin" },
      { property: "og:description", content: "Factures, encaissements et relances de paiement." },
    ],
  }),
  component: () => (
    <FeatureGate feature="facturation">
      <ReadOnlyNotice feature="facturation" />
      <FacturationPage />
    </FeatureGate>
  ),
});

const INVOICE_FIELDS: Field[] = [
  { name: "title", label: "Intitulé", required: true, full: true },
  { name: "amount", label: "Montant (FCFA)", type: "number", required: true },
  { name: "invoice_date", label: "Date de facture", type: "date" },
  { name: "due_date", label: "Échéance", type: "date" },
  { name: "reference", label: "Référence" },
  { name: "notes", label: "Notes", type: "textarea", full: true },
];

const PAYMENT_FIELDS: Field[] = [
  { name: "amount", label: "Montant (FCFA)", type: "number", required: true },
  { name: "payment_date", label: "Date d'encaissement", type: "date" },
  {
    name: "method",
    label: "Mode de paiement",
    type: "select",
    options: PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label })),
  },
  { name: "reference", label: "Référence" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function invoiceState(inv: Invoice, paid: number) {
  if (inv.status === "annulee") return { label: "Annulée", tone: "outline" as const };
  if (paid >= Number(inv.amount)) return { label: "Payée", tone: "default" as const };
  if (inv.due_date && inv.due_date < today())
    return { label: "En retard", tone: "destructive" as const };
  if (paid > 0) return { label: "Partielle", tone: "secondary" as const };
  return { label: "Émise", tone: "outline" as const };
}

function FacturationPage() {
  const { project, projectId } = useCurrentProject();
  const { data: invoices = [] } = useInvoices(projectId);
  const { data: payments = [] } = useInvoicePayments(projectId);
  const saveInvoice = useSaveRow("invoices", "Facture enregistrée");
  const deleteInvoice = useDeleteRow("invoices");
  const addPayment = useAddInvoicePayment();
  const [payFor, setPayFor] = useState<Invoice | null>(null);

  const paidByInvoice = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments) {
      map.set(p.invoice_id, (map.get(p.invoice_id) ?? 0) + Number(p.amount));
    }
    return map;
  }, [payments]);

  const paymentsByInvoice = useMemo(() => {
    const map = new Map<string, typeof payments>();
    for (const p of payments) {
      const list = map.get(p.invoice_id) ?? [];
      list.push(p);
      map.set(p.invoice_id, list);
    }
    return map;
  }, [payments]);

  const totals = useMemo(() => {
    let invoiced = 0;
    let received = 0;
    for (const inv of invoices) {
      if (inv.status === "annulee") continue;
      invoiced += Number(inv.amount);
      received += paidByInvoice.get(inv.id) ?? 0;
    }
    const overdue = invoices.filter((inv) => {
      if (inv.status === "annulee") return false;
      return (paidByInvoice.get(inv.id) ?? 0) < Number(inv.amount);
    });
    return { invoiced, received, due: invoiced - received, overdue: overdue.length };
  }, [invoices, paidByInvoice]);

  if (!project) return <EmptyProjectNotice />;

  async function createInvoice(v: Values) {
    await saveInvoice.mutateAsync({
      values: {
        project_id: projectId,
        title: (v["title"] ?? "").trim(),
        amount: Number(v["amount"]) || 0,
        invoice_date: v["invoice_date"] || today(),
        due_date: orNull(v["due_date"]),
        reference: orNull(v["reference"]),
        notes: orNull(v["notes"]),
      },
    });
  }

  async function addInvoicePayment(inv: Invoice, v: Values) {
    const amount = Number(v["amount"]) || 0;
    if (amount <= 0) {
      toast.error("Montant invalide");
      return;
    }
    await addPayment.mutateAsync({
      invoice_id: inv.id,
      project_id: inv.project_id,
      amount,
      payment_date: v["payment_date"] || today(),
      method: (v["method"] as "especes") || "especes",
      reference: orNull(v["reference"]),
    });
  }

  async function markCancelled(inv: Invoice) {
    await saveInvoice.mutateAsync({ id: inv.id, values: { status: "annulee" } });
  }

  return (
    <>
      <PageHeader
        title="Facturation client"
        subtitle={`${num(invoices.length)} facture(s) · restant dû ${fcfa(totals.due)}`}
        action={
          <RecordDialog
            title="Nouvelle facture"
            fields={INVOICE_FIELDS}
            initial={{ invoice_date: today() }}
            onSubmit={createInvoice}
            trigger={
              <Button size="sm">
                <Plus className="mr-1.5 size-4" /> Nouvelle facture
              </Button>
            }
          />
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Total facturé" value={fcfa(totals.invoiced)} />
        <Summary label="Encaissé" value={fcfa(totals.received)} tone="ok" />
        <Summary
          label="Restant dû"
          value={fcfa(totals.due)}
          tone={totals.due > 0 ? "danger" : "ok"}
        />
        <Summary
          label="Factures à relancer"
          value={num(totals.overdue)}
          tone={totals.overdue > 0 ? "danger" : "ok"}
        />
      </div>

      {invoices.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <Receipt className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune facture</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Créez votre première facture pour suivre les encaissements et les relances de votre
            chantier.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {invoices.map((inv) => {
            const paid = paidByInvoice.get(inv.id) ?? 0;
            const remaining = Number(inv.amount) - paid;
            const pct =
              Number(inv.amount) > 0 ? Math.min(100, (paid / Number(inv.amount)) * 100) : 0;
            const state = invoiceState(inv, paid);
            const invPayments = paymentsByInvoice.get(inv.id) ?? [];
            return (
              <li key={inv.id} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {inv.title}
                      {inv.reference && (
                        <span className="text-xs text-muted-foreground">· {inv.reference}</span>
                      )}
                      <Badge variant={state.tone}>{state.label}</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Facturée le {frDate(inv.invoice_date)}
                      {inv.due_date && ` · échéance ${frDate(inv.due_date)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <span className="num text-sm font-semibold">{fcfa(Number(inv.amount))}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={inv.status === "annulee"}
                    onClick={() => setPayFor(inv)}
                  >
                    <Plus className="mr-1.5 size-4" /> Encaisser {fcfa(remaining)}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markCancelled(inv)}
                    disabled={inv.status === "annulee"}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => deleteInvoice.mutate(inv.id)}
                  >
                    Supprimer
                  </Button>
                  {state.label === "En retard" && (
                    <Button asChild size="sm" variant="outline" className="ml-auto">
                      <a
                        href={`mailto:?subject=Relance facture ${inv.reference ?? ""}&body=Bonjour,%0D%0A%0D%0AMerci de régulariser la facture « ${encodeURIComponent(inv.title)} » d'un montant de ${Number(inv.amount).toLocaleString("fr-FR")} FCFA.`}
                      >
                        <Send className="mr-1.5 size-4" /> Relancer
                      </a>
                    </Button>
                  )}
                </div>

                {invPayments.length > 0 && (
                  <div className="mt-3 border-t border-border pt-2">
                    <p className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      Encaissements ({fcfa(paid)})
                    </p>
                    <ul className="space-y-1 text-sm">
                      {invPayments.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-muted-foreground">
                            {frDate(p.payment_date)} · {labelOf(PAYMENT_METHODS, p.method)}
                            {p.reference && ` · ${p.reference}`}
                          </span>
                          <span className="num">{fcfa(Number(p.amount))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <RecordDialog
        title={`Encaisser — ${payFor?.title ?? ""}`}
        fields={PAYMENT_FIELDS}
        open={!!payFor}
        onOpenChange={(o) => !o && setPayFor(null)}
        submitLabel="Encaisser"
        initial={{ payment_date: today(), method: "virement" }}
        onSubmit={(v) => {
          if (!payFor) return;
          return addInvoicePayment(payFor, v);
        }}
      />
    </>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: "ok" | "danger" }) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          tone === "danger"
            ? "mt-1 font-display text-xl font-semibold text-destructive"
            : tone === "ok"
              ? "mt-1 font-display text-xl font-semibold text-primary"
              : "mt-1 font-display text-xl font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}
