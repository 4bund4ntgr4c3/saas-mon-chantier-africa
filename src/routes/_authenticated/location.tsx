import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Hammer,
  PackageX,
  Pencil,
  Plus,
  Trash2,
  Truck,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate, ReadOnlyNotice } from "@/components/feature-gate";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccess } from "@/lib/roles";
import { useCurrentProject } from "@/context/project-context";
import {
  useCreateEquipmentRental,
  useDeleteRow,
  useEquipment,
  useMyEquipment,
  useMyEquipmentRentals,
  useProfile,
  useSaveRow,
  useUpdateEquipmentRentalStatus,
  type Equipment,
  type EquipmentRental,
} from "@/lib/data";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_RENTAL_STATUSES,
  EQUIPMENT_STATUSES,
  fcfa,
  frDate,
  labelOf,
} from "@/lib/format";

export const Route = createFileRoute("/_authenticated/location")({
  head: () => ({
    meta: [
      { title: "Location de matériel — BâtiBénin" },
      {
        name: "description",
        content:
          "Louez du matériel de chantier au Bénin : groupe électrogène, bétonnière, échafaudage… prix par jour ou par semaine, caution, livraison.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <ReadOnlyNotice feature="marketplace" />
      <LocationPage />
    </FeatureGate>
  ),
});

const EQUIPMENT_FIELDS: Field[] = [
  { name: "name", label: "Nom du matériel", required: true, full: true },
  {
    name: "category",
    label: "Catégorie",
    type: "select",
    options: [...EQUIPMENT_CATEGORIES],
  },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "brand", label: "Marque" },
  { name: "model", label: "Modèle" },
  { name: "city", label: "Ville" },
  { name: "daily_price", label: "Prix par jour (FCFA)", type: "number", required: true },
  { name: "weekly_price", label: "Prix par semaine (FCFA)", type: "number" },
  { name: "deposit", label: "Caution (FCFA)", type: "number" },
  { name: "quantity", label: "Quantité disponible", type: "number" },
  {
    name: "condition",
    label: "État",
    type: "select",
    options: [...EQUIPMENT_CONDITIONS],
  },
  { name: "status", label: "Statut", type: "select", options: [...EQUIPMENT_STATUSES] },
];

const RENTAL_FIELDS: Field[] = [
  { name: "start_date", label: "Début de location", type: "date", required: true },
  { name: "end_date", label: "Fin de location", type: "date", required: true },
  { name: "delivery_address", label: "Adresse de livraison (si besoin)", full: true },
  { name: "delivery_fee", label: "Frais de livraison (FCFA)", type: "number" },
  { name: "notes", label: "Remarques", type: "textarea", full: true },
];

function LocationPage() {
  const { canEdit } = useAccess("marketplace");
  const { projectId } = useCurrentProject();
  const { data: profile } = useProfile();
  const uid = profile?.id ?? null;
  const { data: equipment = [] } = useEquipment();
  const { data: myEquipment = [] } = useMyEquipment();
  const { data: myRentals = [] } = useMyEquipmentRentals();
  const createRental = useCreateEquipmentRental();
  const saveEquipment = useSaveRow("equipment", "Matériel enregistré");
  const removeEquipment = useDeleteRow("equipment");
  const [tab, setTab] = useState<string>("catalogue");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const available = useMemo(
    () =>
      equipment.filter((e) => {
        if (e.status !== "disponible") return false;
        if (cat !== "all" && e.category !== cat) return false;
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        return [e.name, e.brand, e.model, e.city, e.category]
          .filter(Boolean)
          .some((s) => (s as string).toLowerCase().includes(needle));
      }),
    [equipment, q, cat],
  );

  function toEquipmentPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      name: g("name").trim(),
      category: orNull(g("category")) ?? "autre",
      description: orNull(g("description")),
      brand: orNull(g("brand")),
      model: orNull(g("model")),
      city: orNull(g("city")),
      daily_price: toNumber(g("daily_price")) ?? 0,
      weekly_price: toNumber(g("weekly_price")) ?? 0,
      deposit: toNumber(g("deposit")) ?? 0,
      quantity: toNumber(g("quantity")) ?? 1,
      condition: (g("condition") || "bon") as Equipment["condition"],
      status: (g("status") || "disponible") as Equipment["status"],
    };
  }

  async function submitRental(e: Equipment, v: Values) {
    const g = (k: string) => v[k] ?? "";
    await createRental.mutateAsync({
      equipment_id: e.id,
      start_date: g("start_date"),
      end_date: g("end_date"),
      project_id: projectId ?? null,
      delivery_address: orNull(g("delivery_address")),
      delivery_fee: toNumber(g("delivery_fee")) ?? 0,
      notes: orNull(g("notes")),
    });
  }

  return (
    <>
      <PageHeader
        title="Location de matériel"
        subtitle={`${available.length} équipement(s) disponible(s) à la location · ${myEquipment.length} dans mon parc`}
        action={
          canEdit ? (
            <RecordDialog
              title="Ajouter du matériel à louer"
              description="Définissez les tarifs (jour/semaine), la caution et l'état du matériel."
              fields={EQUIPMENT_FIELDS}
              submitLabel="Enregistrer"
              trigger={
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" /> Ajouter du matériel
                </Button>
              }
              onSubmit={async (v) => saveEquipment.mutateAsync({ values: toEquipmentPayload(v) })}
            />
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList>
          <TabsTrigger value="catalogue">Catalogue ({available.length})</TabsTrigger>
          <TabsTrigger value="mon-materiel">Mon matériel ({myEquipment.length})</TabsTrigger>
          <TabsTrigger value="mes-locations">Mes locations ({myRentals.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "catalogue" && (
        <>
          <div className="panel mb-5 flex flex-wrap items-center gap-3 p-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (nom, marque, ville…)"
              className="w-full sm:w-72"
            />
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {available.length === 0 ? (
            <div className="panel grid place-items-center px-6 py-16 text-center">
              <Wrench className="mb-3 size-8 text-primary" />
              <h2 className="font-display text-lg font-semibold">Aucun matériel disponible</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Aucun équipement ne correspond à votre recherche pour l'instant.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {available.map((e) => (
                <EquipmentCard
                  key={e.id}
                  equipment={e}
                  canEdit={canEdit}
                  onRent={(v) => submitRental(e, v)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {tab === "mon-materiel" && (
        <MyEquipmentSection
          items={myEquipment}
          canEdit={canEdit}
          onSave={(id, v) => saveEquipment.mutateAsync({ id, values: toEquipmentPayload(v) })}
          onRemove={(e) => {
            if (confirm(`Retirer « ${e.name} » du parc ?`)) removeEquipment.mutate(e.id);
          }}
        />
      )}

      {tab === "mes-locations" && <MyLocationsSection uid={uid} canEdit={canEdit} />}
    </>
  );
}

function EquipmentCard({
  equipment: e,
  canEdit,
  onRent,
}: {
  equipment: Equipment;
  canEdit: boolean;
  onRent: (v: Values) => void;
}) {
  return (
    <li className="panel flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold">{e.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[e.brand, e.model].filter(Boolean).join(" · ") || "—"}
            {e.city && ` · ${e.city}`}
          </p>
        </div>
        <Badge variant="outline">{labelOf(EQUIPMENT_CATEGORIES, e.category)}</Badge>
      </div>

      {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-md border border-border bg-secondary/30 p-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Jour</p>
          <p className="num text-sm font-semibold text-primary">{fcfa(Number(e.daily_price))}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Semaine</p>
          <p className="num text-sm font-semibold">
            {Number(e.weekly_price) > 0 ? fcfa(Number(e.weekly_price)) : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Caution</p>
          <p className="num text-sm font-semibold">{fcfa(Number(e.deposit))}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge className="bg-success text-success-foreground">
          <Hammer className="mr-1 size-3" /> {labelOf(EQUIPMENT_CONDITIONS, e.condition)}
        </Badge>
        {e.quantity > 1 && <Badge variant="outline">x{e.quantity} dispo</Badge>}
      </div>

      {canEdit && (
        <div className="mt-auto pt-3">
          <RecordDialog
            title={`Réserver — ${e.name}`}
            description={`Tarifs : ${fcfa(Number(e.daily_price))}/jour · ${
              Number(e.weekly_price) > 0
                ? `${fcfa(Number(e.weekly_price))}/semaine`
                : "pas de tarif semaine"
            } · Caution ${fcfa(Number(e.deposit))}`}
            fields={RENTAL_FIELDS}
            submitLabel="Envoyer la demande"
            trigger={
              <Button className="w-full" size="sm">
                <CalendarDays className="mr-1.5 size-4" /> Réserver
              </Button>
            }
            onSubmit={onRent}
          />
        </div>
      )}
    </li>
  );
}

function MyEquipmentSection({
  items,
  canEdit,
  onSave,
  onRemove,
}: {
  items: Equipment[];
  canEdit: boolean;
  onSave: (id: string, v: Values) => void;
  onRemove: (e: Equipment) => void;
}) {
  return (
    <div>
      {items.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <PackageX className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucun matériel</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajoutez votre matériel de chantier pour le proposer à la location.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-display text-sm font-semibold">
                    {e.name}
                    <Badge variant={e.status === "disponible" ? "default" : "outline"}>
                      {labelOf(EQUIPMENT_STATUSES, e.status)}
                    </Badge>
                    <Badge variant="outline">{labelOf(EQUIPMENT_CONDITIONS, e.condition)}</Badge>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[e.brand, e.model, e.city].filter(Boolean).join(" · ") || "—"}
                    {e.quantity > 1 && ` · x${e.quantity}`}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fcfa(Number(e.daily_price))}/jour
                    {Number(e.weekly_price) > 0 && ` · ${fcfa(Number(e.weekly_price))}/semaine`}
                    {` · caution ${fcfa(Number(e.deposit))}`}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <RecordDialog
                      title={`Modifier — ${e.name}`}
                      fields={EQUIPMENT_FIELDS}
                      initial={{
                        name: e.name,
                        category: e.category,
                        description: e.description ?? "",
                        brand: e.brand ?? "",
                        model: e.model ?? "",
                        city: e.city ?? "",
                        daily_price: String(e.daily_price),
                        weekly_price: String(e.weekly_price),
                        deposit: String(e.deposit),
                        quantity: String(e.quantity),
                        condition: e.condition,
                        status: e.status,
                      }}
                      submitLabel="Enregistrer"
                      trigger={
                        <Button size="icon" variant="ghost" className="size-7">
                          <Pencil className="size-3.5" />
                        </Button>
                      }
                      onSubmit={async (v) => onSave(e.id, v)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive"
                      onClick={() => onRemove(e)}
                      title="Retirer du parc"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MyLocationsSection({ uid, canEdit }: { uid: string | null; canEdit: boolean }) {
  const { data: equipment = [] } = useEquipment();
  const { data: myRentals = [] } = useMyEquipmentRentals();
  const updateStatus = useUpdateEquipmentRentalStatus();
  const eqById = useMemo(() => new Map(equipment.map((e) => [e.id, e])), [equipment]);
  const ownIds = useMemo(
    () => new Set(equipment.filter((e) => e.user_id === uid).map((e) => e.id)),
    [equipment, uid],
  );

  const incoming = useMemo(() => {
    const out: { rental: EquipmentRental; equipment: Equipment }[] = [];
    for (const e of equipment) {
      if (!ownIds.has(e.id)) continue;
      for (const r of myRentals) {
        if (r.equipment_id === e.id) out.push({ rental: r, equipment: e });
      }
    }
    return out;
  }, [equipment, myRentals, ownIds]);

  const rentals = [...myRentals.map((r) => ({ rental: r, equipment: eqById.get(r.equipment_id) }))];

  return (
    <div className="space-y-3">
      <div className="panel p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Demandes reçues sur mon matériel
        </p>
        {incoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune demande en attente.</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map(({ rental, equipment: eq }) => (
              <li
                key={rental.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{eq.name}</span> · {frDate(rental.start_date)} →
                    {frDate(rental.end_date)} ·{" "}
                    <span className="num font-semibold text-primary">
                      {fcfa(Number(rental.total_price))}
                    </span>
                  </p>
                  {rental.delivery_address && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Truck className="size-3" /> {rental.delivery_address}
                      {Number(rental.delivery_fee) > 0 && ` · ${fcfa(Number(rental.delivery_fee))}`}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {labelOf(EQUIPMENT_RENTAL_STATUSES, rental.status)}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    {rental.status === "demande" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-success text-success-foreground hover:bg-success/80"
                        onClick={() => updateStatus.mutate({ id: rental.id, status: "confirmee" })}
                      >
                        <CheckCircle2 className="mr-1.5 size-4" /> Confirmer
                      </Button>
                    )}
                    {rental.status === "confirmee" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus.mutate({ id: rental.id, status: "en_cours" })}
                      >
                        Démarrer
                      </Button>
                    )}
                    {rental.status === "en_cours" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus.mutate({ id: rental.id, status: "terminee" })}
                      >
                        <Truck className="mr-1.5 size-4" /> Retour reçu
                      </Button>
                    )}
                    {(rental.status === "demande" || rental.status === "confirmee") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus.mutate({ id: rental.id, status: "annulee" })}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Mes demandes de location
        </p>
        {rentals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Vous n'avez pas encore loué de matériel.</p>
        ) : (
          <ul className="space-y-2">
            {rentals.map(({ rental, equipment: eq }) => (
              <li
                key={rental.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm">
                    {eq ? <span className="font-medium">{eq.name}</span> : "Équipement"} ·{" "}
                    {frDate(rental.start_date)} → {frDate(rental.end_date)} ·{" "}
                    <span className="num font-semibold text-primary">
                      {fcfa(Number(rental.total_price))}
                    </span>
                  </p>
                  {rental.notes && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{rental.notes}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <Badge variant="outline">
                      {labelOf(EQUIPMENT_RENTAL_STATUSES, rental.status)}
                    </Badge>
                  </p>
                </div>
                {canEdit && (rental.status === "demande" || rental.status === "confirmee") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus.mutate({ id: rental.id, status: "annulee" })}
                  >
                    Annuler
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
