import { useEffect, useState } from "react";

/** Distance en kilomètres entre deux points (formule de Haversine). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Distance en kilomètres entre deux positions. */
export function distanceKm(a: GeoPosition, b: GeoPosition): number {
  return haversineKm(a.lat, a.lng, b.lat, b.lng);
}

/** Vrai si `point` se trouve dans un rayon de `radiusKm` autour de `center`. */
export function withinRadius(point: GeoPosition, center: GeoPosition, radiusKm: number): boolean {
  return distanceKm(point, center) <= radiusKm;
}

/** Formate une distance en mètres/kilomètres lisibles (ex. « 850 m », « 3,2 km »). */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  const rounded = Math.round(distanceKm * 10) / 10;
  return `${String(rounded).replace(".", ",")} km`;
}

export type GeoPosition = { lat: number; lng: number };

/**
 * Position de l'utilisateur via l'API géolocalisation du navigateur.
 * `enabled` permet de ne pas demander la permission tant qu'on en a pas besoin.
 */
export function useGeolocation(enabled = false) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("Géolocalisation non disponible");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
      },
      () => setError("Position introuvable"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { position, error, reset: () => setPosition(null) };
}
