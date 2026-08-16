import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  ListPlus,
  PackagePlus,
  Pencil,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate, ReadOnlyNotice } from "@/components/feature-gate";
import { MetreCalculatorDialog } from "@/components/metre-calculator";
import { SolarCalculatorDialog } from "@/components/solar-calculator-dialog";
import { TransportCostDialog } from "@/components/transport-cost-dialog";
import { CarbonFootprintDialog } from "@/components/carbon-footprint-dialog";
import { QuickAddWizard } from "@/components/quick-add-wizard";
import { EntityDetailDialog, openDetailUnlessInteractive } from "@/components/entity-detail-dialog";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import {
  useAddMaterialDelivery,
  useAddMaterialRequirement,
  useDeleteRow,
  useMaterialDeliveries,
  useMaterialRequirements,
  useSuppliers,
  useUpdateMaterialRequirement,
  type MaterialDelivery,
  type MaterialRequirement,
} from "@/lib/data";
import { fcfa, frDate, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/materiaux")({
  head: () => ({
    meta: [
      { title: "Matériaux chantier — BâtiBénin" },
      {
        name: "description",
        content:
          "Besoins en matériaux du chantier, commandes, livraisons et suivi des quantités restantes.",
      },
      { property: "og:title", content: "Matériaux chantier — BâtiBénin" },
      {
        property: "og:description",
        content: "Planifiez et suivez les matériaux de votre chantier.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="stock">
      <ReadOnlyNotice feature="stock" />
      <MateriauxPage />
    </FeatureGate>
  ),
});

const STATUS_META: Record<string, { label: string; className: string }> = {
  besoin: { label: "À commander", className: "border-muted-foreground/40 text-muted-foreground" },
  commande: {
    label: "Commandé",
    className: "border-amber-600/50 text-amber-700 dark:text-amber-400",
  },
  partiel: { label: "Partiellement livré", className: "border-primary/50 text-primary" },
  livre: {
    label: "Livré",
    className: "border-emerald-600/50 text-emerald-700 dark:text-emerald-400",
  },
  termine: {
    label: "Terminé",
    className: "border-emerald-600/50 text-emerald-700 dark:text-emerald-400",
  },
};

const DELIVERY_STATUS: Record<string, string> = {
  planifiee: "Planifiée",
  en_route: "En route",
  partielle: "Partielle",
  livree: "Livrée",
  annulee: "Annulée",
};

function MateriauxPage() {
  const { project, projectId } = useCurrentProject();
  const { data: requirements = [] } = useMaterialRequirements(projectId);
  const { data: deliveries = [] } = useMaterialDeliveries(projectId);
  const { data: suppliers = [] } = useSuppliers();
  const addRequirement = useAddMaterialRequirement();
  const updateRequirement = useUpdateMaterialRequirement();
  const addDelivery = useAddMaterialDelivery();
  const removeDelivery = useDeleteRow("material_deliveries");

  const [editing, setEditing] = useState<MaterialRequirement | null>(null);
  const [delivering, setDelivering] = useState<MaterialRequirement | null>(null);
  const [detail, setDetail] = useState<MaterialRequirement | null>(null);

  const supplierName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);

  if (!project) return <EmptyProjectNotice />;

  const remainingTotal = requirements.reduce(
    (s, r) => s + Math.max(Number(r.quantity_needed) - Number(r.quantity_delivered), 0),
    0,
  );
  const deliveredTotal = requirements.reduce(
    (s, r) => s + Number(r.quantity_delivered) * Number(r.unit_price),
    0,
  );
  const toOrder = requirements.filter(
    (r) => Number(r.quantity_needed) > Number(r.quantity_delivered),
  );

  const reqFields: Field[] = [
    { name: "name", label: "Désignation", required: true, full: true },
    { name: "category", label: "Catégorie" },
    { name: "quantity_needed", label: "Quantité nécessaire", type: "number" },
    { name: "unit", label: "Unité (sac, barre, m³…)" },
    { name: "unit_price", label: "Prix unitaire estimé (FCFA)", type: "number" },
    {
      name: "supplier_id",
      label: "Fournisseur",
      type: "select",
      options: suppliers.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  const deliveryFields: Field[] = [
    { name: "quantity", label: "Quantité livrée", type: "number", required: true },
    { name: "unit_price", label: "Prix unitaire (FCFA)", type: "number" },
    { name: "delivered_at", label: "Date de livraison", type: "date" },
    {
      name: "status",
      label: "Statut",
      type: "select",
      options: Object.entries(DELIVERY_STATUS).map(([value, label]) => ({ value, label })),
    },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  async function submitRequirement(v: Values) {
    if (editing) {
      await updateRequirement.mutateAsync({
        id: editing.id,
        projectId: projectId!,
        patch: {
          name: (v["name"] ?? "").trim(),
          category: orNull(v["category"]),
          quantity_needed: toNumber(v["quantity_needed"]) ?? 0,
          unit: orNull(v["unit"]),
          unit_price: toNumber(v["unit_price"]) ?? 0,
          supplier_id: orNull(v["supplier_id"]),
          notes: orNull(v["notes"]),
        },
      });
      setEditing(null);
      return;
    }
    await addRequirement.mutateAsync({
      project_id: projectId!,
      name: (v["name"] ?? "").trim(),
      category: orNull(v["category"]),
      quantity_needed: toNumber(v["quantity_needed"]) ?? 0,
      unit: orNull(v["unit"]),
      unit_price: toNumber(v["unit_price"]) ?? 0,
      supplier_id: orNull(v["supplier_id"]),
      notes: orNull(v["notes"]),
    });
  }

  async function submitDelivery(v: Values) {
    if (!delivering) return;
    const qty = toNumber(v["quantity"]);
    if (!qty || qty <= 0) return;
    await addDelivery.mutateAsync({
      project_id: projectId!,
      requirement_id: delivering.id,
      supplier_id: delivering.supplier_id,
      quantity: qty,
      unit_price: toNumber(v["unit_price"]) ?? delivering.unit_price,
      delivered_at: v["delivered_at"] || null,
      status: (v["status"] as string) || "livree",
      notes: orNull(v["notes"]),
    });
    setDelivering(null);
  }

  async function markTerminated(r: MaterialRequirement) {
    await updateRequirement.mutateAsync({
      id: r.id,
      projectId: projectId!,
      patch: { status: "termine", quantity_consumed: Number(r.quantity_delivered) },
    });
  }

  return (
    <>
      <PageHeader
        title="Matériaux chantier"
        subtitle={`${num(requirements.length)} besoin(s) · ${num(remainingTotal)} unité(s) restante(s) · ${fcfa(deliveredTotal)} livrés`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CarbonFootprintDialog projectName={project.name} />
            <TransportCostDialog />
            <SolarCalculatorDialog />
            <MetreCalculatorDialog
              onApplyRequirements={async (summary) => {
                if (!projectId) return;
                await addRequirement.mutateAsync({
                  project_id: projectId,
                  name: `Estimation métré : ${summary.slice(0, 50)}...`,
                  category: "gros_oeuvre",
                  quantity_needed: 1,
                  unit: "lot",
                  unit_price: 0,
                  supplier_id: null,
                  notes: summary,
                });
              }}
            />
            <QuickAddWizard
              title="Nouveau besoin en matériaux"
              description="Dictez le besoin en une phrase, ou avancez champ par champ."
              fields={reqFields}
              itemNoun="besoin"
              parseMapping={{
                designation: "name",
                quantity: "quantity_needed",
                unit: "unit",
                unitPrice: "unit_price",
              }}
              onSubmit={submitRequirement}
              trigger={
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" /> Ajouter un besoin
                </Button>
              }
            />
            <RecordDialog
              title="Nouveau besoin en matériaux"
              fields={reqFields}
              onSubmit={submitRequirement}
              trigger={
                <Button size="sm" variant="outline">
                  <ListPlus className="mr-1.5 size-4" /> Formulaire complet
                </Button>
              }
            />
          </div>
        }
      />

      {toOrder.length > 0 && (
        <div className="panel mb-5 border-primary/30 p-4">
          <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
            <ClipboardList className="size-4 text-primary" /> À commander encore
          </h2>
          <div className="flex flex-wrap gap-2">
            {toOrder.map((r) => (
              <Badge key={r.id} variant="outline" className="border-primary/40 text-primary">
                {r.name} ·{" "}
                {num(Math.max(Number(r.quantity_needed) - Number(r.quantity_delivered), 0))}{" "}
                {r.unit ?? ""}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {requirements.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <PackagePlus className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucun besoin en matériaux</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Listez les matériaux nécessaires au chantier, puis enregistrez les livraisons pour
            suivre les quantités restantes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Besoin</th>
                  <th className="py-2 pr-4 font-medium">Catégorie</th>
                  <th className="py-2 pr-4 font-medium">Quantités</th>
                  <th className="py-2 pr-4 text-right font-medium">Montant estimé</th>
                  <th className="py-2 pr-4 font-medium">Statut</th>
                  <th className="py-2 pr-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requirements.map((r) => {
                  const meta = STATUS_META[r.status] ??
                    STATUS_META["besoin"] ?? {
                      label: r.status,
                      className: "border-muted-foreground/40 text-muted-foreground",
                    };
                  const remaining = Math.max(
                    Number(r.quantity_needed) - Number(r.quantity_delivered),
                    0,
                  );
                  const pct =
                    Number(r.quantity_needed) > 0
                      ? Math.round((Number(r.quantity_delivered) / Number(r.quantity_needed)) * 100)
                      : 0;
                  return (
                    <tr
                      key={r.id}
                      className="cursor-pointer transition-colors hover:bg-secondary/40"
                      onClick={(e) => openDetailUnlessInteractive(e, () => setDetail(r))}
                    >
                      <td className="py-3 pr-4">
                        <p className="font-medium">{r.name}</p>
                        {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                        {r.supplier_id && (
                          <p className="text-xs text-muted-foreground">
                            {supplierName.get(r.supplier_id) ?? "—"}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{r.category ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <p>
                          {num(Number(r.quantity_needed))} {r.unit ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          livré {num(Number(r.quantity_delivered))} · consommé{" "}
                          {num(Number(r.quantity_consumed))}
                        </p>
                        <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        {remaining > 0 && (
                          <p className="mt-0.5 text-xs text-destructive">
                            reste {num(remaining)} {r.unit ?? ""}
                          </p>
                        )}
                      </td>
                      <td className="num py-3 pr-4 text-right">
                        {fcfa(Number(r.quantity_needed) * Number(r.unit_price))}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className={meta.className}>
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex justify-end gap-1">
                          {remaining > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDelivering(r)}
                              aria-label={`Enregistrer une livraison pour ${r.name}`}
                            >
                              <Truck className="mr-1.5 size-3.5" /> Livrer
                            </Button>
                          )}
                          {remaining === 0 && r.status !== "termine" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => markTerminated(r)}
                              aria-label={`Clôturer ${r.name}`}
                            >
                              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditing(r)}
                            aria-label={`Modifier ${r.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {deliveries.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
                <Truck className="size-4 text-primary" /> Livraisons récentes
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Matériau</th>
                      <th className="py-2 pr-4 font-medium">Quantité</th>
                      <th className="py-2 pr-4 text-right font-medium">Montant</th>
                      <th className="py-2 pr-4 font-medium">Statut</th>
                      <th className="py-2 pr-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {deliveries.slice(0, 20).map((d) => {
                      const req = requirements.find((r) => r.id === d.requirement_id);
                      return (
                        <tr key={d.id}>
                          <td className="py-3 pr-4">
                            {d.delivered_at ? frDate(d.delivered_at) : "—"}
                          </td>
                          <td className="py-3 pr-4 font-medium">{req?.name ?? "Matériau"}</td>
                          <td className="num py-3 pr-4">
                            {num(Number(d.quantity))} {req?.unit ?? ""}
                          </td>
                          <td className="num py-3 pr-4 text-right">
                            {fcfa(Number(d.quantity) * Number(d.unit_price))}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {DELIVERY_STATUS[d.status] ?? d.status}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeDelivery.mutate(d.id)}
                                aria-label="Supprimer la livraison"
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {editing && (
        <RecordDialog
          title="Modifier le besoin"
          fields={reqFields}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          initial={{
            name: editing.name,
            category: editing.category ?? "",
            quantity_needed: String(editing.quantity_needed),
            unit: editing.unit ?? "",
            unit_price: String(editing.unit_price),
            supplier_id: editing.supplier_id ?? "",
            notes: editing.notes ?? "",
          }}
          onSubmit={submitRequirement}
        />
      )}

      {detail && (
        <EntityDetailDialog
          open={!!detail}
          onOpenChange={(o) => !o && setDetail(null)}
          title={detail.name}
          subtitle={detail.category ?? undefined}
          badge={STATUS_META[detail.status]?.label ?? detail.status}
          fields={[
            {
              label: "Quantité prévue",
              value: `${num(Number(detail.quantity_needed))} ${detail.unit ?? ""}`,
            },
            {
              label: "Livrée",
              value: `${num(Number(detail.quantity_delivered))} ${detail.unit ?? ""}`,
            },
            {
              label: "Consommée",
              value: `${num(Number(detail.quantity_consumed))} ${detail.unit ?? ""}`,
            },
            {
              label: "Reste",
              value:
                Math.max(Number(detail.quantity_needed) - Number(detail.quantity_delivered), 0) >
                0 ? (
                  <span className="text-destructive">
                    {num(Number(detail.quantity_needed) - Number(detail.quantity_delivered))}{" "}
                    {detail.unit ?? ""}
                  </span>
                ) : (
                  "Couvert"
                ),
            },
            { label: "Prix unitaire", value: fcfa(Number(detail.unit_price)) },
            {
              label: "Montant estimé",
              value: (
                <span className="num text-primary">
                  {fcfa(Number(detail.quantity_needed) * Number(detail.unit_price))}
                </span>
              ),
            },
            {
              label: "Fournisseur",
              value: (detail.supplier_id && supplierName.get(detail.supplier_id)) || "—",
            },
            { label: "Notes", value: detail.notes ?? "—", full: true },
          ]}
        >
          {(() => {
            const rel = deliveries.filter((d) => d.requirement_id === detail.id);
            if (rel.length === 0)
              return <p className="text-xs text-muted-foreground">Aucune livraison enregistrée.</p>;
            return (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Livraisons ({rel.length})
                </p>
                <ul className="divide-y divide-border rounded-md border border-border">
                  {rel.map((d) => (
                    <li key={d.id} className="flex flex-wrap justify-between gap-2 p-2 text-xs">
                      <span>
                        {frDate(d.delivered_at ?? d.created_at)} · {num(Number(d.quantity))}{" "}
                        {detail.unit ?? ""} ·{" "}
                        {(d.supplier_id && supplierName.get(d.supplier_id)) || "—"}
                      </span>
                      <span className="num text-primary">
                        {fcfa(Number(d.quantity) * Number(d.unit_price))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </EntityDetailDialog>
      )}

      {delivering && (
        <RecordDialog
          title={`Livraison — ${delivering.name}`}
          fields={deliveryFields}
          open={!!delivering}
          onOpenChange={(o) => !o && setDelivering(null)}
          onSubmit={submitDelivery}
        />
      )}
    </>
  );
}
