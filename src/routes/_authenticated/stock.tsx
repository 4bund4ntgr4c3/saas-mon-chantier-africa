import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate, ReadOnlyNotice } from "@/components/feature-gate";
import { RecordDialog, toNumber, orNull, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/context/project-context";
import { useDeleteRow, useMaterials, useSaveRow, useSuppliers, type Material } from "@/lib/data";
import { fcfa, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/stock")({
  head: () => ({
    meta: [
      { title: "Stock & matériaux — BâtiBénin" },
      {
        name: "description",
        content:
          "Inventaire des matériaux de chantier, valeur du stock et alertes de réapprovisionnement.",
      },
      { property: "og:title", content: "Stock & matériaux — BâtiBénin" },
      { property: "og:description", content: "Suivez vos matériaux et leur valeur en FCFA." },
    ],
  }),
  component: () => (
    <FeatureGate feature="stock">
      <ReadOnlyNotice feature="stock" />
      <StockPage />
    </FeatureGate>
  ),
});

function StockPage() {
  const { project, projectId } = useCurrentProject();
  const { data: materials = [] } = useMaterials(projectId);
  const { data: suppliers = [] } = useSuppliers();
  const save = useSaveRow("materials", "Matériau enregistré");
  const remove = useDeleteRow("materials");
  const [editing, setEditing] = useState<Material | null>(null);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});

  const supplierName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);

  const fields: Field[] = useMemo(
    () => [
      { name: "name", label: "Désignation", required: true, full: true },
      { name: "category", label: "Catégorie" },
      { name: "quantity", label: "Quantité", type: "number" },
      { name: "unit", label: "Unité (sac, barre, m³…)" },
      { name: "unit_price", label: "Prix unitaire (FCFA)", type: "number" },
      { name: "reorder_level", label: "Seuil de réapprovisionnement", type: "number" },
      {
        name: "supplier_id",
        label: "Fournisseur",
        type: "select",
        options: suppliers.map((s) => ({ value: s.id, label: s.name })),
      },
      { name: "notes", label: "Notes", type: "textarea", full: true },
    ],
    [suppliers],
  );

  if (!project) return <EmptyProjectNotice />;

  const totalValue = materials.reduce((s, m) => s + Number(m.quantity) * Number(m.unit_price), 0);
  const lowStock = materials.filter(
    (m) => Number(m.reorder_level) > 0 && Number(m.quantity) <= Number(m.reorder_level),
  );

  async function submit(v: Values) {
    await save.mutateAsync({
      ...(editing ? { id: editing.id } : {}),
      values: {
        project_id: projectId,
        name: (v["name"] ?? "").trim(),
        category: orNull(v["category"]),
        quantity: toNumber(v["quantity"]) ?? 0,
        unit: orNull(v["unit"]),
        unit_price: toNumber(v["unit_price"]) ?? 0,
        reorder_level: toNumber(v["reorder_level"]) ?? 0,
        supplier_id: orNull(v["supplier_id"]),
        notes: orNull(v["notes"]),
      },
    });
    setEditing(null);
  }

  async function adjustQty(m: Material, delta: number) {
    const raw = qtyDrafts[m.id];
    const next = raw !== undefined ? Number(raw.replace(/\s/g, "")) : Number(m.quantity);
    if (!Number.isFinite(next) || next + delta < 0) return;
    await save.mutateAsync({ id: m.id, values: { quantity: next + delta } });
    setQtyDrafts((prev) => {
      const copy = { ...prev };
      delete copy[m.id];
      return copy;
    });
  }

  return (
    <>
      <PageHeader
        title="Stock & matériaux"
        subtitle={`${num(materials.length)} référence(s) · valeur du stock ${fcfa(totalValue)}`}
        action={
          <RecordDialog
            title="Nouveau matériau"
            fields={fields}
            onSubmit={submit}
            trigger={
              <Button size="sm">
                <Plus className="mr-1.5 size-4" /> Ajouter un matériau
              </Button>
            }
          />
        }
      />

      {lowStock.length > 0 && (
        <div className="panel mb-5 border-primary/30 p-4">
          <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
            <AlertTriangle className="size-4 text-primary" /> À réapprovisionner
          </h2>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((m) => (
              <Badge
                key={m.id}
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                {m.name} · {num(m.quantity)} {m.unit ?? ""} (seuil {num(m.reorder_level)})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <Boxes className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucun matériau</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajoutez vos matériaux pour suivre les quantités, la valeur du stock et les alertes de
            réapprovisionnement.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Désignation</th>
                <th className="py-2 pr-4 font-medium">Catégorie</th>
                <th className="py-2 pr-4 font-medium">Quantité</th>
                <th className="py-2 pr-4 text-right font-medium">Prix unitaire</th>
                <th className="py-2 pr-4 text-right font-medium">Valeur</th>
                <th className="py-2 pr-4 font-medium">Fournisseur</th>
                <th className="py-2 pr-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {materials.map((m) => {
                const low =
                  Number(m.reorder_level) > 0 && Number(m.quantity) <= Number(m.reorder_level);
                return (
                  <tr key={m.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{m.name}</p>
                      {m.notes && <p className="text-xs text-muted-foreground">{m.notes}</p>}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{m.category ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => adjustQty(m, -1)}
                          aria-label="Retirer 1"
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <input
                          className="num w-20 rounded-md border border-input bg-transparent px-2 py-1 text-center text-sm outline-none focus:border-ring"
                          inputMode="numeric"
                          value={qtyDrafts[m.id] ?? String(m.quantity)}
                          onChange={(e) =>
                            setQtyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                          }
                          onBlur={() => {
                            const raw = qtyDrafts[m.id];
                            if (raw === undefined) return;
                            const next = Number(raw.replace(/\s/g, ""));
                            if (Number.isFinite(next) && next !== Number(m.quantity)) {
                              save.mutateAsync({ id: m.id, values: { quantity: next } });
                            }
                            setQtyDrafts((prev) => {
                              const copy = { ...prev };
                              delete copy[m.id];
                              return copy;
                            });
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => adjustQty(m, 1)}
                          aria-label="Ajouter 1"
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <span className="ml-1 text-xs text-muted-foreground">{m.unit}</span>
                      {low && (
                        <Badge variant="destructive" className="ml-1">
                          Réappro.
                        </Badge>
                      )}
                    </td>
                    <td className="num py-3 pr-4 text-right">{fcfa(Number(m.unit_price))}</td>
                    <td className="num py-3 pr-4 text-right font-medium text-primary">
                      {fcfa(Number(m.quantity) * Number(m.unit_price))}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {m.supplier_id ? (supplierName.get(m.supplier_id) ?? "—") : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditing(m)}
                          aria-label={`Modifier ${m.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => remove.mutate(m.id)}
                          aria-label={`Supprimer ${m.name}`}
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
      )}

      {editing && (
        <RecordDialog
          title="Modifier le matériau"
          fields={fields}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          initial={{
            name: editing.name,
            category: editing.category ?? "",
            quantity: String(editing.quantity),
            unit: editing.unit ?? "",
            unit_price: String(editing.unit_price),
            reorder_level: String(editing.reorder_level),
            supplier_id: editing.supplier_id ?? "",
            notes: editing.notes ?? "",
          }}
          onSubmit={submit}
        />
      )}
    </>
  );
}
