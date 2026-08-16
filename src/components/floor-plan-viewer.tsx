import { useMemo, useState } from "react";
import { CalendarCheck, Layers, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fcfa, labelOf, PROPERTY_UNIT_STATUSES, PROPERTY_UNIT_TYPES } from "@/lib/format";
import type { PropertyUnit } from "@/lib/data";

const STATUS_STYLES: Record<PropertyUnit["status"], string> = {
  disponible: "border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10",
  reserve:
    "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200",
  vendu:
    "border-emerald-500 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200",
};

const floorLabel = (floor: number) => (floor <= 0 ? "RDC" : `Étage ${floor}`);

/**
 * Plan d'étage interactif d'un immeuble : sélecteur d'étage, lots colorés par statut
 * (disponible / réservé / vendu), fiche du lot sélectionné, planification de visite
 * par WhatsApp et changement rapide de statut (promoteur).
 */
export function FloorPlanViewer({
  building,
  units,
  canEdit = false,
  onStatus,
  className,
}: {
  building: { id: string; name: string; floor_count: number };
  units: PropertyUnit[];
  canEdit?: boolean;
  onStatus?: (unitId: string, status: PropertyUnit["status"]) => void;
  className?: string;
}) {
  const floors = useMemo(() => {
    const set = new Set<number>();
    for (let f = 0; f < Math.max(1, building.floor_count); f++) set.add(f);
    for (const u of units) set.add(u.floor);
    return [...set].sort((a, b) => a - b);
  }, [building.floor_count, units]);

  const [floor, setFloor] = useState(floors[0] ?? 0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const floorUnits = useMemo(() => units.filter((u) => u.floor === floor), [units, floor]);
  const selected = floorUnits.find((u) => u.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const count = (s: PropertyUnit["status"]) => floorUnits.filter((u) => u.status === s).length;
    return {
      total: floorUnits.length,
      dispo: count("disponible"),
      reserve: count("reserve"),
      vendu: count("vendu"),
    };
  }, [floorUnits]);

  const shareVisit = (u: PropertyUnit) => {
    const text = `Bonjour, je souhaite planifier une visite du lot ${u.label} (${labelOf(
      PROPERTY_UNIT_TYPES,
      u.unit_type,
    )}, ${Number(u.surface_m2)} m², ${fcfa(Number(u.price))}) de l'immeuble ${building.name}. Quelles sont vos disponibilités ?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <div className={cn("rounded-md border border-border bg-card p-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="size-4 text-primary" /> Plan d'étage — {building.name}
        </p>
        <div className="flex flex-wrap gap-1">
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFloor(f);
                setSelectedId(null);
              }}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                f === floor
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {floorLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="num font-semibold text-foreground">{stats.total}</span> lot(s)
        <Badge variant="outline">{stats.dispo} dispo</Badge>
        <Badge variant="outline">{stats.reserve} réservé(s)</Badge>
        <Badge variant="outline">{stats.vendu} vendu(s)</Badge>
      </p>

      {floorUnits.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Aucun lot à {floorLabel(floor).toLowerCase()}.
        </p>
      ) : (
        <div
          className="mt-3 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(3, floorUnits.length)}, minmax(0, 1fr))`,
          }}
        >
          {floorUnits.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedId(u.id === selectedId ? null : u.id)}
              className={cn(
                "flex min-h-24 flex-col items-start justify-between rounded-md border-2 p-2.5 text-left transition-colors",
                STATUS_STYLES[u.status],
                u.id === selectedId && "ring-2 ring-primary ring-offset-1",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="font-display text-sm font-semibold">{u.label}</span>
                <span className="text-[10px] uppercase tracking-wide opacity-80">
                  {labelOf(PROPERTY_UNIT_STATUSES, u.status)}
                </span>
              </span>
              <span className="text-xs opacity-80">
                {labelOf(PROPERTY_UNIT_TYPES, u.unit_type)}
              </span>
              <span className="num text-xs">
                {Number(u.surface_m2)} m²{u.rooms > 0 ? ` · ${u.rooms} p` : ""}
                {u.bathrooms > 0 ? ` · ${u.bathrooms} sdb` : ""}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-sm border-2 border-primary/40 bg-primary/5" />{" "}
          Disponible
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-sm border-2 border-amber-400 bg-amber-50 dark:bg-amber-950" />{" "}
          Réservé
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-sm border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950" />{" "}
          Vendu
        </span>
      </div>

      {selected && (
        <div className="mt-3 rounded-md border border-primary/40 bg-primary/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-sm font-semibold">
                {selected.label} · {floorLabel(selected.floor)}
              </p>
              <p className="num mt-0.5 text-sm font-semibold text-primary">
                {fcfa(Number(selected.price))}
              </p>
            </div>
            <Badge variant="outline">{labelOf(PROPERTY_UNIT_STATUSES, selected.status)}</Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => shareVisit(selected)}>
              <CalendarCheck className="mr-1.5 size-4" /> Planifier une visite
            </Button>
            {canEdit && selected.status !== "vendu" && (
              <>
                {selected.status === "disponible" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatus?.(selected.id, "reserve")}
                  >
                    Marquer réservé
                  </Button>
                )}
                {selected.status === "reserve" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatus?.(selected.id, "vendu")}
                  >
                    Marquer vendu
                  </Button>
                )}
              </>
            )}
          </div>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <MessageCircle className="size-3" /> La visite se planifie par WhatsApp avec le
            promoteur.
          </p>
        </div>
      )}
    </div>
  );
}
