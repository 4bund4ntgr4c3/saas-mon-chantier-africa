import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  DoorOpen,
  Home,
  Landmark,
  PackageX,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate, ReadOnlyNotice } from "@/components/feature-gate";
import { MobileMoneyDialog } from "@/components/mobile-money-dialog";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccess } from "@/lib/roles";
import { useCurrentProject } from "@/context/project-context";
import {
  computeProgramStats,
  useBuildings,
  useCreatePropertyReservation,
  useMyDevelopmentPrograms,
  useMyPropertyReservations,
  useProgramUnits,
  useSaveRow,
  useUpdatePropertyReservationStatus,
  useDeleteRow,
  type Building,
  type DevelopmentProgram,
  type PropertyReservation,
  type PropertyUnit,
} from "@/lib/data";
import {
  BUILDING_STATUSES,
  fcfa,
  frDate,
  labelOf,
  PROGRAM_STATUSES,
  PROPERTY_RESERVATION_STATUSES,
  PROPERTY_UNIT_STATUSES,
  PROPERTY_UNIT_TYPES,
} from "@/lib/format";

export const Route = createFileRoute("/_authenticated/immobilier")({
  head: () => ({
    meta: [
      { title: "Immobilier promoteurs — BâtiBénin" },
      {
        name: "description",
        content:
          "Gérez vos programmes immobiliers au Bénin : immeubles, lots et appartements, budgets, avancement des ventes et dossiers clients.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <ReadOnlyNotice feature="marketplace" />
      <ImmobilierPage />
    </FeatureGate>
  ),
});

const PROGRAM_FIELDS: Field[] = [
  { name: "name", label: "Nom du programme", required: true, full: true },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "city", label: "Ville" },
  { name: "address", label: "Adresse", full: true },
  {
    name: "status",
    label: "Statut",
    type: "select",
    options: [...PROGRAM_STATUSES],
  },
  { name: "budget_total", label: "Budget / objectif de vente (FCFA)", type: "number" },
  { name: "start_date", label: "Début", type: "date" },
  { name: "end_date", label: "Fin prévue", type: "date" },
];

const BUILDING_FIELDS: Field[] = [
  { name: "name", label: "Nom de l'immeuble", required: true },
  { name: "floor_count", label: "Nombre d'étages", type: "number" },
  {
    name: "status",
    label: "Statut",
    type: "select",
    options: [...BUILDING_STATUSES],
  },
];

const UNIT_FIELDS: Field[] = [
  { name: "label", label: "Référence du lot (ex. Appt 3B)", required: true },
  {
    name: "unit_type",
    label: "Type",
    type: "select",
    options: [...PROPERTY_UNIT_TYPES],
  },
  { name: "floor", label: "Étage", type: "number" },
  { name: "surface_m2", label: "Surface (m²)", type: "number" },
  { name: "rooms", label: "Pièces", type: "number" },
  { name: "bathrooms", label: "Salles de bain", type: "number" },
  { name: "price", label: "Prix (FCFA)", type: "number" },
  {
    name: "status",
    label: "Statut",
    type: "select",
    options: [...PROPERTY_UNIT_STATUSES],
  },
];

const RESERVATION_CLIENT_FIELDS: Field[] = [
  { name: "client_name", label: "Nom du client", required: true },
  { name: "client_phone", label: "Téléphone" },
  { name: "client_email", label: "Email" },
  { name: "amount", label: "Montant réservé (FCFA)", type: "number" },
  { name: "notes", label: "Remarques", type: "textarea", full: true },
];

function ImmobilierPage() {
  const { canEdit } = useAccess("marketplace");
  const { projectId } = useCurrentProject();
  const { data: programs = [] } = useMyDevelopmentPrograms();
  const saveProgram = useSaveRow("development_programs", "Programme enregistré");
  const removeProgram = useDeleteRow("development_programs");
  const [tab, setTab] = useState<string>("programmes");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = programs.find((p) => p.id === selectedId) ?? null;

  function toProgramPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      name: g("name").trim(),
      description: orNull(g("description")),
      city: orNull(g("city")),
      address: orNull(g("address")),
      status: (g("status") || "commercialisation") as DevelopmentProgram["status"],
      budget_total: toNumber(g("budget_total")) ?? 0,
      start_date: orNull(g("start_date")),
      end_date: orNull(g("end_date")),
    };
  }

  return (
    <>
      <PageHeader
        title="Immobilier — Promoteurs"
        subtitle={`${programs.length} programme(s) · gestion des immeubles, lots et dossiers clients`}
        action={
          canEdit ? (
            <RecordDialog
              title="Nouveau programme"
              description="Créez un programme immobilier (immeubles, lots, objectif de ventes)."
              fields={PROGRAM_FIELDS}
              submitLabel="Créer"
              trigger={
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" /> Nouveau programme
                </Button>
              }
              onSubmit={async (v) => saveProgram.mutateAsync({ values: toProgramPayload(v) })}
            />
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList>
          <TabsTrigger value="programmes">Programmes ({programs.length})</TabsTrigger>
          <TabsTrigger value="dossiers">Dossiers clients</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "programmes" &&
        (selected ? (
          <ProgramDetail
            program={selected}
            canEdit={canEdit}
            projectId={projectId}
            onBack={() => setSelectedId(null)}
            onDelete={(p) => {
              if (confirm(`Supprimer le programme « ${p.name} » ?`)) {
                removeProgram.mutate(p.id);
                setSelectedId(null);
              }
            }}
          />
        ) : programs.length === 0 ? (
          <div className="panel grid place-items-center px-6 py-16 text-center">
            <Landmark className="mb-3 size-8 text-primary" />
            <h2 className="font-display text-lg font-semibold">Aucun programme</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Créez votre premier programme immobilier pour y associer immeubles et lots.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} onOpen={() => setSelectedId(p.id)} />
            ))}
          </ul>
        ))}

      {tab === "dossiers" && <DossiersTab canEdit={canEdit} projectId={projectId} />}
    </>
  );
}

function ProgramCard({ program: p, onOpen }: { program: DevelopmentProgram; onOpen: () => void }) {
  const { data: units = [] } = useProgramUnits(p.id);
  const stats = useMemo(() => computeProgramStats(units), [units]);
  return (
    <li className="panel flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold">{p.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[p.city, p.address].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <Badge variant="outline">{labelOf(PROGRAM_STATUSES, p.status)}</Badge>
      </div>

      {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}

      <div className="mt-3 rounded-md border border-border bg-secondary/30 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase tracking-widest text-muted-foreground">
            Avancement des ventes
          </span>
          <span className="num font-semibold">{stats.avancementPct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${stats.avancementPct}%` }}
          />
        </div>
        <p className="num mt-2 text-xs text-muted-foreground">
          {stats.vendu}/{stats.total} lots vendus · {fcfa(stats.montantVendu)} encaissés
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline">{stats.reserve} réservé(s)</Badge>
        <Badge variant="outline">{stats.disponible} dispo</Badge>
        {Number(p.budget_total) > 0 && (
          <Badge variant="outline">Objectif {fcfa(Number(p.budget_total))}</Badge>
        )}
      </div>

      <div className="mt-auto pt-3">
        <Button className="w-full" size="sm" variant="secondary" onClick={onOpen}>
          <Building2 className="mr-1.5 size-4" /> Ouvrir le programme
        </Button>
      </div>
    </li>
  );
}

function ProgramDetail({
  program,
  canEdit,
  projectId,
  onBack,
  onDelete,
}: {
  program: DevelopmentProgram;
  canEdit: boolean;
  projectId: string | null;
  onBack: () => void;
  onDelete: (p: DevelopmentProgram) => void;
}) {
  const { data: buildings = [] } = useBuildings(program.id);
  const { data: units = [] } = useProgramUnits(program.id);
  const saveProgram = useSaveRow("development_programs", "Programme enregistré");
  const saveBuilding = useSaveRow("buildings", "Immeuble enregistré");
  const removeBuilding = useDeleteRow("buildings");
  const saveUnit = useSaveRow("property_units", "Lot enregistré");
  const removeUnit = useDeleteRow("property_units");
  const stats = useMemo(() => computeProgramStats(units), [units]);
  const budget = Number(program.budget_total);
  const budgetPct = budget > 0 ? Math.min(100, Math.round((stats.montantVendu / budget) * 100)) : 0;

  const unitsByBuilding = useMemo(() => {
    const map = new Map<string, PropertyUnit[]>();
    for (const u of units) {
      const arr = map.get(u.building_id) ?? [];
      arr.push(u);
      map.set(u.building_id, arr);
    }
    return map;
  }, [units]);

  function toProgramPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      name: g("name").trim(),
      description: orNull(g("description")),
      city: orNull(g("city")),
      address: orNull(g("address")),
      status: (g("status") || "commercialisation") as DevelopmentProgram["status"],
      budget_total: toNumber(g("budget_total")) ?? 0,
      start_date: orNull(g("start_date")),
      end_date: orNull(g("end_date")),
    };
  }

  function toBuildingPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      program_id: program.id,
      name: g("name").trim(),
      floor_count: toNumber(g("floor_count")) ?? 0,
      status: (g("status") || "planification") as Building["status"],
    };
  }

  function toUnitPayload(buildingId: string, v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      building_id: buildingId,
      label: g("label").trim(),
      unit_type: (g("unit_type") || "appartement") as PropertyUnit["unit_type"],
      floor: toNumber(g("floor")) ?? 0,
      surface_m2: toNumber(g("surface_m2")) ?? 0,
      rooms: toNumber(g("rooms")) ?? 0,
      bathrooms: toNumber(g("bathrooms")) ?? 0,
      price: toNumber(g("price")) ?? 0,
      status: (g("status") || "disponible") as PropertyUnit["status"],
    };
  }

  return (
    <div className="space-y-4">
      <Button size="sm" variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-1.5 size-4" /> Tous les programmes
      </Button>

      <div className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold">
              {program.name}
              <Badge variant="outline">{labelOf(PROGRAM_STATUSES, program.status)}</Badge>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {[program.city, program.address].filter(Boolean).join(" · ") || "—"}
              {program.start_date && ` · ${frDate(program.start_date)}`}
              {program.end_date && ` → ${frDate(program.end_date)}`}
            </p>
            {program.description && (
              <p className="mt-1 text-sm text-muted-foreground">{program.description}</p>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <RecordDialog
                title={`Modifier — ${program.name}`}
                fields={PROGRAM_FIELDS}
                initial={{
                  name: program.name,
                  description: program.description ?? "",
                  city: program.city ?? "",
                  address: program.address ?? "",
                  status: program.status,
                  budget_total: String(program.budget_total),
                  start_date: program.start_date ?? "",
                  end_date: program.end_date ?? "",
                }}
                submitLabel="Enregistrer"
                trigger={
                  <Button size="icon" variant="ghost" className="size-7">
                    <Pencil className="size-3.5" />
                  </Button>
                }
                onSubmit={async (v) =>
                  saveProgram.mutateAsync({ id: program.id, values: toProgramPayload(v) })
                }
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-destructive"
                onClick={() => onDelete(program)}
                title="Supprimer le programme"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-md border border-border bg-secondary/30 p-3 sm:grid-cols-5">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lots</p>
            <p className="num text-lg font-semibold">{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Vendus</p>
            <p className="num text-lg font-semibold text-success">{stats.vendu}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Réservés</p>
            <p className="num text-lg font-semibold text-amber-600">{stats.reserve}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dispo</p>
            <p className="num text-lg font-semibold">{stats.disponible}</p>
          </div>
          <div className="text-center sm:border-l sm:border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Encaissé / objectif
            </p>
            <p className="num text-sm font-semibold text-primary">
              {fcfa(stats.montantVendu)}
              {budget > 0 && <span className="text-muted-foreground"> / {fcfa(budget)}</span>}
            </p>
          </div>
        </div>
        {budget > 0 && (
          <div className="mt-2">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${budgetPct}%` }} />
            </div>
            <p className="num mt-1 text-[11px] text-muted-foreground">
              {budgetPct}% de l'objectif de vente atteint
            </p>
          </div>
        )}
      </div>

      {buildings.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-12 text-center">
          <Home className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucun immeuble</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajoutez un premier immeuble pour y décrire vos lots.
          </p>
        </div>
      ) : (
        buildings.map((b) => (
          <div key={b.id} className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex flex-wrap items-center gap-2 font-display text-sm font-semibold">
                <Building2 className="size-4 text-primary" /> {b.name}
                <Badge variant="outline">{labelOf(BUILDING_STATUSES, b.status)}</Badge>
                {b.floor_count > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {b.floor_count} étage(s)
                  </span>
                )}
                <span className="text-xs font-normal text-muted-foreground">
                  {(unitsByBuilding.get(b.id) ?? []).length} lot(s)
                </span>
              </p>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <RecordDialog
                    title={`Ajouter un lot — ${b.name}`}
                    description="Décrivez un lot (appartement, boutique, garage…)."
                    fields={UNIT_FIELDS}
                    submitLabel="Ajouter"
                    trigger={
                      <Button size="sm" variant="secondary">
                        <Plus className="mr-1.5 size-4" /> Ajouter un lot
                      </Button>
                    }
                    onSubmit={async (v) => saveUnit.mutateAsync({ values: toUnitPayload(b.id, v) })}
                  />
                  <RecordDialog
                    title={`Modifier — ${b.name}`}
                    fields={BUILDING_FIELDS}
                    initial={{
                      name: b.name,
                      floor_count: String(b.floor_count),
                      status: b.status,
                    }}
                    submitLabel="Enregistrer"
                    trigger={
                      <Button size="icon" variant="ghost" className="size-7">
                        <Pencil className="size-3.5" />
                      </Button>
                    }
                    onSubmit={async (v) =>
                      saveBuilding.mutateAsync({ id: b.id, values: toBuildingPayload(v) })
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    onClick={() => {
                      if (confirm(`Supprimer l'immeuble « ${b.name} » et ses lots ?`))
                        removeBuilding.mutate(b.id);
                    }}
                    title="Supprimer l'immeuble"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-3">
              {(unitsByBuilding.get(b.id) ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun lot dans cet immeuble.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {(unitsByBuilding.get(b.id) ?? []).map((u) => (
                    <UnitCard
                      key={u.id}
                      unit={u}
                      canEdit={canEdit}
                      projectId={projectId}
                      onEdit={(v) =>
                        saveUnit.mutateAsync({ id: u.id, values: toUnitPayload(b.id, v) })
                      }
                      onDelete={() => {
                        if (confirm(`Supprimer le lot « ${u.label} » ?`)) removeUnit.mutate(u.id);
                      }}
                      onStatus={(status) => saveUnit.mutateAsync({ id: u.id, values: { status } })}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))
      )}

      {canEdit && (
        <div>
          <RecordDialog
            title="Ajouter un immeuble"
            description="Un immeuble regroupe des lots (appartements, boutiques, garages…)."
            fields={BUILDING_FIELDS}
            submitLabel="Ajouter"
            trigger={
              <Button variant="secondary">
                <Plus className="mr-1.5 size-4" /> Ajouter un immeuble
              </Button>
            }
            onSubmit={async (v) => saveBuilding.mutateAsync({ values: toBuildingPayload(v) })}
          />
        </div>
      )}
    </div>
  );
}

function UnitCard({
  unit: u,
  canEdit,
  projectId,
  onEdit,
  onDelete,
  onStatus,
}: {
  unit: PropertyUnit;
  canEdit: boolean;
  projectId: string | null;
  onEdit: (v: Values) => void;
  onDelete: () => void;
  onStatus: (status: PropertyUnit["status"]) => void;
}) {
  const createReservation = useCreatePropertyReservation();

  async function reserve(v: Values) {
    const g = (k: string) => v[k] ?? "";
    const amount = toNumber(g("amount")) ?? Number(u.price);
    await createReservation.mutateAsync({
      unit_id: u.id,
      project_id: projectId ?? null,
      client_name: g("client_name").trim(),
      client_phone: orNull(g("client_phone")),
      client_email: orNull(g("client_email")),
      amount,
      notes: orNull(g("notes")),
    });
  }

  return (
    <li className="rounded-md border border-border bg-secondary/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold">{u.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {labelOf(PROPERTY_UNIT_TYPES, u.unit_type)}
            {u.floor > 0 && ` · étage ${u.floor}`}
          </p>
        </div>
        <Badge
          variant={
            u.status === "disponible" ? "outline" : u.status === "reserve" ? "secondary" : "default"
          }
          className={u.status === "vendu" ? "bg-success text-success-foreground" : undefined}
        >
          {labelOf(PROPERTY_UNIT_STATUSES, u.status)}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        <span className="num">{Number(u.surface_m2)} m²</span>
        {u.rooms > 0 && <span>{u.rooms} pièce(s)</span>}
        {u.bathrooms > 0 && <span>{u.bathrooms} sdb</span>}
      </div>

      <p className="num mt-1 text-sm font-semibold text-primary">{fcfa(Number(u.price))}</p>

      {canEdit && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {u.status === "disponible" && (
            <RecordDialog
              title={`Réserver — ${u.label}`}
              description="Créez le dossier client associé à ce lot."
              fields={RESERVATION_CLIENT_FIELDS}
              initial={{ amount: String(u.price) }}
              submitLabel="Créer le dossier"
              trigger={
                <Button size="sm" variant="secondary">
                  <DoorOpen className="mr-1.5 size-4" /> Réserver
                </Button>
              }
              onSubmit={reserve}
            />
          )}
          {u.status === "reserve" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus("disponible")}>
              <RotateCcw className="mr-1.5 size-4" /> Rendre disponible
            </Button>
          )}
          <RecordDialog
            title={`Modifier — ${u.label}`}
            fields={UNIT_FIELDS}
            initial={{
              label: u.label,
              unit_type: u.unit_type,
              floor: String(u.floor),
              surface_m2: String(u.surface_m2),
              rooms: String(u.rooms),
              bathrooms: String(u.bathrooms),
              price: String(u.price),
              status: u.status,
            }}
            submitLabel="Enregistrer"
            trigger={
              <Button size="icon" variant="ghost" className="size-7">
                <Pencil className="size-3.5" />
              </Button>
            }
            onSubmit={onEdit}
          />
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </li>
  );
}

function DossiersTab({ canEdit, projectId }: { canEdit: boolean; projectId: string | null }) {
  const { data: reservations = [] } = useMyPropertyReservations();
  const { data: programs = [] } = useMyDevelopmentPrograms();
  const updateStatus = useUpdatePropertyReservationStatus();
  const [programId, setProgramId] = useState<string | null>(programs[0]?.id ?? null);

  const { data: buildings = [] } = useBuildings(programId);
  const { data: programUnits = [] } = useProgramUnits(programId);
  const unitInfo = useMemo(() => {
    const bName = new Map(buildings.map((b) => [b.id, b.name]));
    const map = new Map<string, string>();
    for (const u of programUnits) {
      map.set(u.id, `${bName.get(u.building_id) ?? "Immeuble"} · ${u.label}`);
    }
    return map;
  }, [buildings, programUnits]);

  const programOptions = programs.map((p) => ({ value: p.id, label: p.name }));

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 p-3">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Programme</label>
        <select
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          value={programId ?? ""}
          onChange={(e) => setProgramId(e.target.value || null)}
        >
          {programOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {canEdit && programId && (
          <NewReservationDialog programId={programId} projectId={projectId} />
        )}
      </div>

      {reservations.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <PackageX className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucun dossier client</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Les dossiers de réservation et de vente apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {reservations.map((r) => (
            <ReservationRow
              key={r.id}
              reservation={r}
              unitLabel={unitInfo.get(r.unit_id) ?? "Lot supprimé"}
              canEdit={canEdit}
              projectId={projectId}
              onConfirm={() => updateStatus.mutate({ id: r.id, status: "confirmee" })}
              onSell={() => updateStatus.mutate({ id: r.id, status: "vendue" })}
              onCancel={() => updateStatus.mutate({ id: r.id, status: "annulee" })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NewReservationDialog({
  programId,
  projectId,
}: {
  programId: string;
  projectId: string | null;
}) {
  const { data: buildings = [] } = useBuildings(programId);
  const { data: units = [] } = useProgramUnits(programId);
  const create = useCreatePropertyReservation();
  const bName = useMemo(() => new Map(buildings.map((b) => [b.id, b.name])), [buildings]);
  const availableUnits = units.filter((u) => u.status === "disponible");
  const unitOptions = availableUnits.map((u) => ({
    value: u.id,
    label: `${bName.get(u.building_id) ?? "Immeuble"} · ${u.label} · ${fcfa(Number(u.price))}`,
  }));

  const fields: Field[] = [
    { name: "unit_id", label: "Lot", type: "select", options: unitOptions },
    ...RESERVATION_CLIENT_FIELDS,
  ];

  async function submit(v: Values) {
    const g = (k: string) => v[k] ?? "";
    const unit = availableUnits.find((u) => u.id === g("unit_id"));
    if (!unit) {
      toast.warning("Sélectionnez un lot disponible");
      return;
    }
    const amount = toNumber(g("amount")) ?? Number(unit.price);
    await create.mutateAsync({
      unit_id: unit.id,
      project_id: projectId ?? null,
      client_name: g("client_name").trim(),
      client_phone: orNull(g("client_phone")),
      client_email: orNull(g("client_email")),
      amount,
      notes: orNull(g("notes")),
    });
  }

  return (
    <RecordDialog
      title="Nouveau dossier client"
      description="Réservations ou vente d'un lot : créez le dossier du client."
      fields={fields}
      submitLabel="Créer le dossier"
      trigger={
        <Button size="sm">
          <Plus className="mr-1.5 size-4" /> Nouveau dossier
        </Button>
      }
      onSubmit={submit}
    />
  );
}

function ReservationRow({
  reservation: r,
  unitLabel,
  canEdit,
  projectId,
  onConfirm,
  onSell,
  onCancel,
}: {
  reservation: PropertyReservation;
  unitLabel: string;
  canEdit: boolean;
  projectId: string | null;
  onConfirm: () => void;
  onSell: () => void;
  onCancel: () => void;
}) {
  const markDepositPaid = useSaveRow("property_reservations", "Acompte payé");
  const [paying, setPaying] = useState(false);
  const showDeposit =
    canEdit &&
    !r.deposit_paid &&
    (r.status === "demande" || r.status === "confirmee") &&
    Number(r.amount) > 0;

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3">
      <div className="min-w-0">
        <p className="text-sm">
          <span className="font-medium">{r.client_name}</span> · {unitLabel} ·{" "}
          <span className="num font-semibold text-primary">{fcfa(Number(r.amount))}</span>
        </p>
        {(r.client_phone || r.client_email) && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[r.client_phone, r.client_email].filter(Boolean).join(" · ")}
          </p>
        )}
        {r.notes && <p className="mt-0.5 text-xs text-muted-foreground">{r.notes}</p>}
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline">{labelOf(PROPERTY_RESERVATION_STATUSES, r.status)}</Badge>
          {r.deposit_paid && (
            <Badge className="bg-success text-success-foreground">
              <ShieldCheck className="mr-1 size-3" /> Acompte payé
            </Badge>
          )}
        </p>
      </div>
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          {showDeposit && (
            <Button size="sm" variant="secondary" onClick={() => setPaying(true)}>
              <ShieldCheck className="mr-1.5 size-4" /> Payer l'acompte
            </Button>
          )}
          {r.status === "demande" && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-success text-success-foreground hover:bg-success/80"
              onClick={onConfirm}
            >
              <CheckCircle2 className="mr-1.5 size-4" /> Confirmer
            </Button>
          )}
          {r.status === "confirmee" && (
            <Button size="sm" variant="secondary" onClick={onSell}>
              <Landmark className="mr-1.5 size-4" /> Vendre
            </Button>
          )}
          {(r.status === "demande" || r.status === "confirmee") && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
      )}
      <MobileMoneyDialog
        projectId={r.project_id ?? projectId}
        amount={Number(r.amount)}
        {...(r.client_name ? { beneficiary: r.client_name } : {})}
        open={paying}
        onOpenChange={setPaying}
        onConfirmed={() => markDepositPaid.mutate({ id: r.id, values: { deposit_paid: true } })}
      />
    </li>
  );
}
