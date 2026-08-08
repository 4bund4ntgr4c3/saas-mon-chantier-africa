import { useMemo } from "react";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  type Category,
} from "@/lib/data";
import { fcfa, frDate, num, labelOf, PAYMENT_METHODS } from "@/lib/format";
import { QuickExpenseDialog } from "@/components/quick-expense";

/** Détail d'un poste budgétaire : prévu vs dépensé, dépenses, devis et paiements liés. */
export function PosteDetailDialog({
  category,
  open,
  onOpenChange,
}: {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { projectId } = useCurrentProject();
  const { data: lines = [] } = useBudgetLines(projectId);
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: payments = [] } = usePayments(projectId);
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: suppliers = [] } = useSuppliers();
  const { data: companies = [] } = useCompanies();
  const { data: categories = [] } = useCategories();

  const supplierName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const companyName = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const categoryId = category?.id;
  const line = lines.find((l) => l.category_id === categoryId);
  const planned = Number(line?.planned_amount ?? 0);
  const posteExpenses = expenses.filter((e) => e.category_id === categoryId);
  const spent = posteExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = planned - spent;
  const ratio = planned > 0 ? (spent / planned) * 100 : 0;
  const posteQuotes = quotes.filter((q) => q.category_id === categoryId);
  const postePayments = payments.filter((p) => posteExpenses.some((e) => e.id === p.expense_id));

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{category.name}</DialogTitle>
          <DialogDescription>
            Phase « {category.phase} » · suivi du poste sur ce chantier
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <div className="panel p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Prévu</p>
            <p className="num mt-1 text-base font-semibold">{fcfa(planned)}</p>
          </div>
          <div className="panel p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Dépensé</p>
            <p className="num mt-1 text-base font-semibold text-primary">{fcfa(spent)}</p>
          </div>
          <div className="panel p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {remaining >= 0 ? "Reste" : "Dépassement"}
            </p>
            <p
              className={`num mt-1 text-base font-semibold ${
                remaining < 0 ? "text-destructive" : ""
              }`}
            >
              {fcfa(Math.abs(remaining))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Progress value={Math.min(100, ratio)} className="h-2 flex-1" />
          <Badge variant={ratio > 100 ? "destructive" : ratio >= 80 ? "outline" : "secondary"}>
            {num(ratio)} %
          </Badge>
        </div>

        {planned === 0 && (
          <p className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
            <Info className="size-4" /> Aucun montant prévu pour ce poste — ajoutez-en un dans la
            page Budget.
          </p>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">
              Dépenses ({posteExpenses.length})
            </h3>
            <QuickExpenseDialog
              defaultCategoryId={category.id}
              trigger={
                <Button size="sm" variant="secondary">
                  <ArrowRight className="mr-1.5 size-4" /> Ajouter
                </Button>
              }
            />
          </div>
          {posteExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune dépense sur ce poste.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border text-sm">
              {posteExpenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {frDate(e.expense_date)} ·{" "}
                      {e.supplier_id
                        ? (supplierName.get(e.supplier_id) ?? "Fournisseur")
                        : e.company_id
                          ? (companyName.get(e.company_id) ?? "Entreprise")
                          : "—"}{" "}
                      · {labelOf(PAYMENT_METHODS, e.method)}
                    </p>
                  </div>
                  <span className="num shrink-0 text-primary">{fcfa(Number(e.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {posteQuotes.length > 0 && (
          <div>
            <h3 className="mb-2 font-display text-sm font-semibold">
              Devis ({posteQuotes.length})
            </h3>
            <ul className="divide-y divide-border rounded-lg border border-border text-sm">
              {posteQuotes.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{q.label}</p>
                    <p className="text-xs text-muted-foreground">réf. {q.reference ?? "—"}</p>
                  </div>
                  <span className="num shrink-0">{fcfa(Number(q.amount))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {postePayments.length > 0 && (
          <div>
            <h3 className="mb-2 font-display text-sm font-semibold">
              Paiements liés ({postePayments.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              Total versé :{" "}
              <span className="num font-medium">
                {fcfa(postePayments.reduce((s, p) => s + Number(p.amount), 0))}
              </span>{" "}
              ({catName.get(category.id) ?? category.name})
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
