import { useSyncExternalStore } from "react";
import { resetDemoData } from "@/lib/demo-store";

const KEY = "batibenin.guest";
const listeners = new Set<() => void>();
let active = false;

function emit() {
  listeners.forEach((l) => l());
}

/** Lecture synchrone (utilisable hors composants, ex. garde de route). */
export function isGuestMode() {
  if (typeof window === "undefined") return false;
  active = localStorage.getItem(KEY) === "1";
  return active;
}

export function enterGuestMode() {
  resetDemoData();
  localStorage.setItem(KEY, "1");
  active = true;
  emit();
}

export function exitGuestMode() {
  localStorage.removeItem(KEY);
  active = false;
  resetDemoData();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Hook réactif : vrai quand l'aperçu invité est actif. */
export function useGuestMode() {
  return useSyncExternalStore(
    subscribe,
    () => {
      active = localStorage.getItem(KEY) === "1";
      return active;
    },
    () => false,
  );
}
