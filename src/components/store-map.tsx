import { useMemo, useState } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { formatDistance, haversineKm, type GeoPosition } from "@/lib/geo";
import { Badge } from "@/components/ui/badge";
import type { Store } from "@/lib/data";

export const MAP_PROVIDERS = [
  {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: "esri",
    name: "Esri World",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 18,
  },
  {
    id: "carto",
    name: "CARTO Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
] as const;

export type MapProviderId = (typeof MAP_PROVIDERS)[number]["id"];

const storeIcon = (verified: boolean) =>
  L.divIcon({
    className: "batibenin-marker",
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${verified ? "#0f766e" : "#334155"}" stroke="white" stroke-width="1.5"><path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6" fill="white" stroke="none"/></svg>`,
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

export function StoreMap({
  stores,
  position = null,
  className,
  height = "h-[420px]",
}: {
  stores: Store[];
  position?: GeoPosition | null;
  className?: string;
  height?: string;
}) {
  const [provider, setProvider] = useState<MapProviderId>("osm");

  const center = useMemo<GeoPosition>(() => {
    if (position) return position;
    const first = stores.find((s) => s.lat != null && s.lng != null);
    return first && first.lat != null && first.lng != null
      ? { lat: first.lat, lng: first.lng }
      : DEFAULT_CENTER;
  }, [position, stores]);

  const located = MAP_PROVIDERS.find((p) => p.id === provider) ?? MAP_PROVIDERS[0]!;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Carte des boutiques
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
        {stores.map((s) => {
          if (s.lat == null || s.lng == null) return null;
          const radius = Number(s.delivery_radius_km ?? 0);
          const distance = position ? haversineKm(position.lat, position.lng, s.lat, s.lng) : null;
          return (
            <div key={s.id}>
              {radius > 0 && (
                <Circle
                  center={[s.lat, s.lng]}
                  radius={radius * 1000}
                  pathOptions={{ color: "#0f766e", weight: 1, dashArray: "4 4", fillOpacity: 0.08 }}
                />
              )}
              <Marker position={[s.lat, s.lng]} icon={storeIcon(s.verified)}>
                <Popup>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[s.city, s.commune].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                    {distance != null && (
                      <Badge variant="outline">à {formatDistance(distance)}</Badge>
                    )}
                    {radius > 0 && <Badge variant="outline">Rayon {radius} km</Badge>}
                  </p>
                </Popup>
              </Marker>
            </div>
          );
        })}
        {position && <Marker position={[position.lat, position.lng]} icon={userIcon} />}
      </MapContainer>
    </div>
  );
}
