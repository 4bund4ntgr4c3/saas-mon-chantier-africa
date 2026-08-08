import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Pencil, Phone, Plus, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { RecordDialog, orNull, type Field, type Values } from "@/components/record-form";
import { ImportDialog, type ImportColumn } from "@/components/import-csv";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteRow, useImportRows, useSaveRow, useSuppliers, type Supplier } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/fournisseurs")({
  head: () => ({
    meta: [
      { title: "Fournisseurs de matériaux — BâtiBénin" },
      {
        name: "description",
        content:
          "Carnet d'adresses des fournisseurs de ciment, fer, sable et matériaux de construction au Bénin.",
      },
      { property: "og:title", content: "Fournisseurs de matériaux — BâtiBénin" },
      {
        property: "og:description",
        content: "Centralisez les contacts de vos fournisseurs de chantier.",
      },
    ],
  }),
  component: SuppliersPage,
});

const FIELDS: Field[] = [
  { name: "name", label: "Nom du fournisseur", required: true, full: true },
  { name: "activity", label: "Activité", placeholder: "Quincaillerie, ciment, sable…" },
  { name: "products", label: "Produits", placeholder: "Ciment CIMBENIN, fer 8, 10…" },
  { name: "phone", label: "Téléphone", placeholder: "+229 …" },
  { name: "whatsapp", label: "WhatsApp", placeholder: "+229 …" },
  { name: "email", label: "E-mail" },
  { name: "city", label: "Ville", placeholder: "Cotonou" },
  { name: "commune", label: "Commune", placeholder: "Abomey-Calavi" },
];

const IMPORT_COLUMNS: ImportColumn[] = [
  {
    key: "name",
    label: "Nom",
    aliases: ["nom", "name", "fournisseur", "supplier", "raison sociale", "raison_sociale"],
  },
  {
    key: "activity",
    label: "Activité",
    aliases: ["activite", "activité", "activity", "metier", "métier"],
  },
  { key: "products", label: "Produits", aliases: ["produits", "products", "produits vendus"] },
  {
    key: "phone",
    label: "Téléphone",
    aliases: ["telephone", "téléphone", "phone", "tel", "contact"],
  },
  { key: "whatsapp", label: "WhatsApp", aliases: ["whatsapp", "wa"] },
  { key: "email", label: "E-mail", aliases: ["email", "e-mail", "mail", "courriel"] },
  { key: "city", label: "Ville", aliases: ["ville", "city", "localite", "localité"] },
  { key: "commune", label: "Commune", aliases: ["commune"] },
];

function SuppliersPage() {
  const { data: suppliers = [] } = useSuppliers();
  const save = useSaveRow("suppliers", "Fournisseur enregistré");
  const remove = useDeleteRow("suppliers");
  const importRows = useImportRows("suppliers");
  const [editing, setEditing] = useState<Supplier | null>(null);

  function toPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      name: g("name").trim(),
      activity: orNull(g("activity")),
      products: orNull(g("products")),
      phone: orNull(g("phone")),
      whatsapp: orNull(g("whatsapp")),
      email: orNull(g("email")),
      city: orNull(g("city")),
      commune: orNull(g("commune")),
    };
  }

  return (
    <>
      <PageHeader
        title="Fournisseurs"
        subtitle={`${suppliers.length} contact(s) matériaux`}
        action={
          <div className="flex flex-wrap gap-2">
            <ImportDialog
              title="Importer des fournisseurs"
              description="Téléversez un fichier CSV ou Excel pour ajouter plusieurs fournisseurs d'un coup."
              columns={IMPORT_COLUMNS}
              onImport={async (rows) => {
                const payload = rows.map((r) => ({
                  name: r["name"]?.trim() || "Fournisseur",
                  activity: orNull(r["activity"]),
                  products: orNull(r["products"]),
                  phone: orNull(r["phone"]),
                  whatsapp: orNull(r["whatsapp"]),
                  email: orNull(r["email"]),
                  city: orNull(r["city"]),
                  commune: orNull(r["commune"]),
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
              title="Nouveau fournisseur"
              fields={FIELDS}
              trigger={
                <Button>
                  <Plus className="size-4" /> Ajouter
                </Button>
              }
              onSubmit={async (v) => save.mutateAsync({ values: toPayload(v) })}
            />
          </div>
        }
      />

      {suppliers.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          Aucun fournisseur enregistré.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((s) => (
            <article key={s.id} className="panel p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold">{s.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {[s.commune, s.city].filter(Boolean).join(" · ") || "Localisation inconnue"}
                  </p>
                </div>
                {s.activity && <Badge variant="outline">{s.activity}</Badge>}
              </div>

              {s.products && <p className="mt-3 text-sm text-muted-foreground">{s.products}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {s.phone && (
                  <Button asChild size="sm" variant="secondary">
                    <a href={`tel:${s.phone}`}>
                      <Phone className="size-4" /> {s.phone}
                    </a>
                  </Button>
                )}
                {s.whatsapp && (
                  <Button asChild size="sm" variant="secondary">
                    <a
                      href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="size-4" /> WhatsApp
                    </a>
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => setEditing(s)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`Supprimer ${s.name} ?`)) remove.mutate(s.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <RecordDialog
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={`Modifier ${editing.name}`}
          fields={FIELDS}
          initial={{
            name: editing.name,
            activity: editing.activity ?? "",
            products: editing.products ?? "",
            phone: editing.phone ?? "",
            whatsapp: editing.whatsapp ?? "",
            email: editing.email ?? "",
            city: editing.city ?? "",
            commune: editing.commune ?? "",
          }}
          onSubmit={async (v) => save.mutateAsync({ id: editing.id, values: toPayload(v) })}
        />
      )}
    </>
  );
}
