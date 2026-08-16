import { useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { formatDistance, type GeoPosition } from "@/lib/geo";
import { Badge } from "@/components/ui/badge";
import { MAP_PROVIDERS, type MapProviderId } from "@/components/store-map";

export type MapPointKind = "pin" | "project" | "provider" | "truck" | "target";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string | null;
  kind?: MapPointKind;
  /** Distance en km affichée en badge (ex. « à 3 km ») */
  distanceKm?: number | null;
  /** Badges libres affichés dans le popup */
  badges?: string[];
};

const POINT_COLORS: Record<MapPointKind, string> = {
  pin: "#0f766e",
  project: "#b45309",
  provider: "#7c3aed",
  truck: "#2563eb",
  target: "#dc2626",
};

const POINT_PATHS: Record<MapPointKind, string> = {
  pin: "M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z",
  project: "M4 21V5l8-3 8 3v16M9 21v-6h6v6M9 11h.01M15 11h.01",
  provider: "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01",
  truck: "M1 5h13v11H1zM14 9h4l3 3v4h-7zM5.5 19a2 2 0 1 0 0-.01M17.5 19a2 2 0 1 0 0-.01",
  target: "M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z",
};

const pointIcon = (kind: MapPointKind) =>
  L.divIcon({
    className: "batibenin-marker",
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${POINT_COLORS[kind]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${POINT_PATHS[kind]}" fill="${kind === "truck" ? "none" : `${POINT_COLORS[kind]}22`}"/></svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -22],
  });

const userIcon = L.divIcon({
  className: "batibenin-marker",
  html: `<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="8" fill="#2563eb" stroke="white" stroke-width="2"/><circle cx="13" cy="13" r="3" fill="white"/></svg>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

const DEFAULT_CENTER: GeoPosition = { lat: 6.3656, lng: 2.4231 };

/** Carte générique multi-fournisseurs : points libres + position utilisateur + itinéraire optionnel. */
export function PointsMap({
  points,
  position = null,
  /** Itinéraire polyligne (ex. position transporteur → destination) */
  path,
  title,
  className,
  height = "h-[420px]",
}: {
  points: MapPoint[];
  position?: GeoPosition | null;
  path?: [number, number][];
  title: string;
  className?: string;
  height?: string;
}) {
  const [provider, setProvider] = useState<MapProviderId>("osm");

  const center = useMemo<GeoPosition>(() => {
    if (position) return position;
    const first = points[0];
    return first ? { lat: first.lat, lng: first.lng } : DEFAULT_CENTER;
  }, [position, points]);

  const located = MAP_PROVIDERS.find((p) => p.id === provider) ?? MAP_PROVIDERS[0]!;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <div className="flex gap-1">
          {MAP_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProvider(p.id)}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                provider === p.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        className={cn("z-0 w-full rounded-lg border border-border", height)}
        scrollWheelZoom
      >
        <TileLayer url={located.url} attribution={located.attribution} maxZoom={located.maxZoom} />
        {path && path.length >= 2 && (
          <Polyline
            positions={path}
            pathOptions={{ color: "#2563eb", weight: 2.5, dashArray: "6 6", opacity: 0.8 }}
          />
        )}
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pointIcon(p.kind ?? "pin")}>
            <Popup>
              <p className="font-medium">{p.title}</p>
              {p.subtitle && <p className="text-xs text-muted-foreground">{p.subtitle}</p>}
              {(p.distanceKm != null || (p.badges && p.badges.length > 0)) && (
                <p className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                  {p.distanceKm != null && (
                    <Badge variant="outline">à {formatDistance(p.distanceKm)}</Badge>
                  )}
                  {p.badges?.map((b) => (
                    <Badge key={b} variant="outline">
                      {b}
                    </Badge>
                  ))}
                </p>
              )}
            </Popup>
          </Marker>
        ))}
        {position && <Marker position={[position.lat, position.lng]} icon={userIcon} />}
      </MapContainer>
    </div>
  );
}
