import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompanies, useDeleteRow, useSaveRow, type Company } from "@/lib/data";
import { fcfa } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/entreprises")({
  head: () => ({
    meta: [
      { title: "Entreprises et artisans — BâtiBénin" },
      {
        name: "description",
        content:
          "Maçons, ferrailleurs, plombiers, électriciens : suivez les entreprises du chantier et leurs contrats en FCFA.",
      },
      { property: "og:title", content: "Entreprises et artisans — BâtiBénin" },
      {
        property: "og:description",
        content: "Gérez les corps de métier intervenant sur votre construction.",
      },
    ],
  }),
  component: CompaniesPage,
});

const FIELDS: Field[] = [
  { name: "name", label: "Nom de l'entreprise", required: true, full: true },
  { name: "trade", label: "Corps de métier", placeholder: "Maçonnerie, plomberie…" },
  { name: "manager", label: "Responsable" },
  { name: "phone", label: "Téléphone", placeholder: "+229 …" },
  { name: "email", label: "E-mail" },
  { name: "contract_ref", label: "Référence du contrat" },
  { name: "contract_amount", label: "Montant du contrat (FCFA)", type: "number" },
];

function CompaniesPage() {
  const { data: companies = [] } = useCompanies();
  const save = useSaveRow("companies", "Entreprise enregistrée");
  const remove = useDeleteRow("companies");
  const [editing, setEditing] = useState<Company | null>(null);

  function toPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      name: g("name").trim(),
      trade: orNull(g("trade")),
      manager: orNull(g("manager")),
      phone: orNull(g("phone")),
      email: orNull(g("email")),
      contract_ref: orNull(g("contract_ref")),
      contract_amount: toNumber(g("contract_amount")),
    };
  }

  return (
    <>
      <PageHeader
        title="Entreprises & artisans"
        subtitle={`${companies.length} intervenant(s)`}
        action={
          <RecordDialog
            title="Nouvelle entreprise"
            fields={FIELDS}
            trigger={
              <Button>
                <Plus className="size-4" /> Ajouter
              </Button>
            }
            onSubmit={async (v) => save.mutateAsync({ values: toPayload(v) })}
          />
        }
      />

      {companies.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          Aucune entreprise enregistrée.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((c) => (
            <article key={c.id} className="panel p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">{c.manager ?? "Responsable —"}</p>
                </div>
                {c.trade && <Badge variant="outline">{c.trade}</Badge>}
              </div>

              <dl className="mt-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Contrat</dt>
                  <dd className="num text-primary">
                    {c.contract_amount != null ? fcfa(Number(c.contract_amount)) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Référence</dt>
                  <dd>{c.contract_ref ?? "—"}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {c.phone && (
                  <Button asChild size="sm" variant="secondary">
                    <a href={`tel:${c.phone}`}>
                      <Phone className="size-4" /> {c.phone}
                    </a>
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => setEditing(c)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`Supprimer ${c.name} ?`)) remove.mutate(c.id);
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
            trade: editing.trade ?? "",
            manager: editing.manager ?? "",
            phone: editing.phone ?? "",
            email: editing.email ?? "",
            contract_ref: editing.contract_ref ?? "",
            contract_amount:
              editing.contract_amount != null ? String(editing.contract_amount) : "",
          }}
          onSubmit={async (v) => save.mutateAsync({ id: editing.id, values: toPayload(v) })}
        />
      )}
    </>
  );
}
