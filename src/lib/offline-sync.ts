/**
 * Module de gestion du statut hors-ligne et des brouillons de chantier (Offline-first).
 */
import { useEffect, useState } from "react";

export interface OfflineDraft {
  id: string;
  type: "expense" | "journal_entry";
  projectId?: string;
  data: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

const DRAFTS_STORAGE_KEY = "batibenin_offline_drafts_v1";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function getOfflineDrafts(): OfflineDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OfflineDraft[]) : [];
  } catch {
    return [];
  }
}

export function saveOfflineDraft(
  draft: Omit<OfflineDraft, "id" | "createdAt" | "synced">,
): OfflineDraft {
  const drafts = getOfflineDrafts();
  const newDraft: OfflineDraft = {
    ...draft,
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    synced: false,
  };
  drafts.unshift(newDraft);
  if (typeof window !== "undefined") {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  }
  return newDraft;
}

export function removeOfflineDraft(id: string) {
  const drafts = getOfflineDrafts().filter((d) => d.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  }
}

export function clearSyncedDrafts() {
  const drafts = getOfflineDrafts().filter((d) => !d.synced);
  if (typeof window !== "undefined") {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  }
}
