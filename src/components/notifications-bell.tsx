import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentProject } from "@/context/project-context";
import { useAuditLogs, type AuditLog } from "@/lib/data";
import { fcfa } from "@/lib/format";

const ACTION_LABEL: Record<string, string> = {
  creation: "Création",
  modification: "Modification",
  suppression: "Suppression",
};

const ENTITY_LABEL: Record<string, string> = {
  budget: "Budget",
  paiement: "Paiement",
  depense: "Dépense",
  devis: "Devis",
  journal: "Journal de chantier",
  projet: "Projet",
  fournisseur: "Fournisseur",
  entreprise: "Entreprise",
};

const SEEN_KEY = "batibenin:notifications:last-seen";

/** Une alerte n'est envoyée que pour les actions réellement sensibles. */
function isSensitive(log: AuditLog) {
  if (log.action === "suppression") return true;
  return log.entity === "budget" || log.entity === "paiement";
}

export function notificationText(log: AuditLog) {
  const entity = ENTITY_LABEL[log.entity] ?? log.entity;
  const action = ACTION_LABEL[log.action] ?? log.action;
  const label = log.label ? ` « ${log.label} »` : "";
  const before = log.amount_before;
  const after = log.amount_after;
  const amounts =
    before != null && after != null && Number(before) !== Number(after)
      ? ` — ${fcfa(Number(before))} → ${fcfa(Number(after))}`
      : after != null
        ? ` — ${fcfa(Number(after))}`
        : "";
  return `${action} · ${entity}${label}${amounts}`;
}

function relative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function NotificationsBell() {
  const { projectId } = useCurrentProject();
  const { data: logs = [] } = useAuditLogs(projectId);
  const [lastSeen, setLastSeen] = useState<string>(() => {
    if (typeof window === "undefined") return new Date().toISOString();
    return window.localStorage.getItem(SEEN_KEY) ?? new Date(0).toISOString();
  });
  const toasted = useRef<Set<string>>(new Set());
  const bootstrapped = useRef(false);

  const alerts = useMemo(() => logs.filter(isSensitive).slice(0, 30), [logs]);
  const unread = useMemo(() => alerts.filter((l) => l.created_at > lastSeen), [alerts, lastSeen]);

  // Notification in-app (toast) pour chaque nouvelle action sensible.
  useEffect(() => {
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      alerts.forEach((l) => toasted.current.add(l.id));
      return;
    }
    alerts
      .filter((l) => !toasted.current.has(l.id) && l.created_at > lastSeen)
      .forEach((l) => {
        toasted.current.add(l.id);
        toast.warning("Action sensible", { description: notificationText(l) });
      });
  }, [alerts, lastSeen]);

  function markAllRead() {
    const now = new Date().toISOString();
    window.localStorage.setItem(SEEN_KEY, now);
    setLastSeen(now);
  }

  return (
    <Popover onOpenChange={(open) => open && unread.length > 0 && markAllRead()}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unread.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-medium">Alertes</span>
          <Badge variant="outline">{alerts.length}</Badge>
        </div>
        <ScrollArea className="max-h-80">
          {alerts.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Aucune action sensible récente.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {alerts.map((l) => (
                <li key={l.id} className="px-3 py-2 text-sm">
                  <p className="leading-snug">{notificationText(l)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{relative(l.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button asChild size="sm" variant="secondary" className="w-full">
            <Link to="/audit">Voir le journal d'audit</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
