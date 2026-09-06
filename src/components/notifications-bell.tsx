import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationKindIcon } from "@/components/notification-kind-icon";
import { useCurrentProject } from "@/context/project-context";
import {
  useAuditLogs,
  useBudgetLines,
  useCategories,
  useDocuments,
  useExpenses,
  useMarkNotificationsRead,
  useNotifications,
  usePayments,
  useQuotes,
  type AppNotification,
  type AuditLog,
} from "@/lib/data";
import { fcfa, frDate, labelOf, num, PAYMENT_METHODS } from "@/lib/format";
import { cn } from "@/lib/utils";

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

type BusinessAlert = {
  id: string;
  title: string;
  detail: string;
  severity: "danger" | "warning";
};

function daysFromNow(value: string) {
  return Math.round((Date.now() - new Date(value).getTime()) / 86400000);
}

export function NotificationsBell() {
  const { project, projectId } = useCurrentProject();
  const { data: logs = [] } = useAuditLogs(projectId);
  const { data: notifications = [] } = useNotifications(100);
  const { data: expenses = [] } = useExpenses(projectId);
  const { data: budgetLines = [] } = useBudgetLines(projectId);
  const { data: categories = [] } = useCategories();
  const { data: payments = [] } = usePayments(projectId);
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: documents = [] } = useDocuments(projectId);
  const markRead = useMarkNotificationsRead();
  const [lastSeen, setLastSeen] = useState<string>(() => {
    if (typeof window === "undefined") return new Date().toISOString();
    return window.localStorage.getItem(SEEN_KEY) ?? new Date(0).toISOString();
  });
  const toasted = useRef<Set<string>>(new Set());
  const bootstrapped = useRef(false);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const businessAlerts = useMemo<BusinessAlert[]>(() => {
    if (!project) return [];
    const out: BusinessAlert[] = [];
    const today = new Date().toISOString().slice(0, 10);

    const spentByCat = new Map<string, number>();
    for (const e of expenses) {
      if (!e.category_id) continue;
      spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
    }
    for (const line of budgetLines) {
      const planned = Number(line.planned_amount);
      if (planned <= 0) continue;
      const spent = spentByCat.get(line.category_id) ?? 0;
      const ratio = (spent / planned) * 100;
      if (ratio >= 80) {
        out.push({
          id: `budget-${line.id}`,
          title: `Poste « ${catName.get(line.category_id) ?? "Sans catégorie"} » à ${num(ratio)} %`,
          detail: `${fcfa(spent)} dépensés sur ${fcfa(planned)} prévus`,
          severity: ratio > 100 ? "danger" : "warning",
        });
      }
    }

    for (const p of payments) {
      if (!p.due_date || p.due_date >= today) continue;
      out.push({
        id: `paiement-${p.id}`,
        title: `Paiement en retard de ${daysFromNow(p.due_date)} j`,
        detail: `${fcfa(Number(p.amount))} · ${labelOf(PAYMENT_METHODS, p.method)} · échéance ${frDate(p.due_date)}`,
        severity: "danger",
      });
    }

    for (const q of quotes) {
      if (!q.valid_until || q.valid_until >= today || q.status !== "en_attente") continue;
      out.push({
        id: `devis-${q.id}`,
        title: `Devis « ${q.label} » expiré depuis ${daysFromNow(q.valid_until)} j`,
        detail: `${fcfa(Number(q.amount))} · réf. ${q.reference ?? "—"}`,
        severity: "warning",
      });
    }

    const required = ["plan", "permis_construire", "acte_vente", "contrat"] as const;
    const present = new Set(documents.map((d) => d.category));
    const missing = required.filter((c) => !present.has(c));
    if (missing.length > 0) {
      out.push({
        id: "documents-manquants",
        title: `${missing.length} pièce(s) réglementaire(s) manquante(s)`,
        detail: "Plans, permis, acte de vente ou contrat absents du dossier.",
        severity: "warning",
      });
    }

    if (project.end_date && project.end_date < today && project.status !== "termine") {
      out.push({
        id: "projet-fin",
        title: `Chantier hors délai de ${daysFromNow(project.end_date)} j`,
        detail: `Fin prévue le ${frDate(project.end_date)}.`,
        severity: "warning",
      });
    }

    return out;
  }, [project, expenses, budgetLines, payments, quotes, documents, catName]);

  const alerts = useMemo(() => logs.filter(isSensitive).slice(0, 30), [logs]);
  const unreadAlerts = useMemo(
    () => alerts.filter((l) => l.created_at > lastSeen),
    [alerts, lastSeen],
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read_at),
    [notifications],
  );
  const badgeCount = unreadAlerts.length + businessAlerts.length + unreadNotifications.length;

  // Toast des nouvelles alertes métier (dédupliquées par session).
  useEffect(() => {
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      businessAlerts.forEach((a) => toasted.current.add(a.id));
      return;
    }
    businessAlerts
      .filter((a) => !toasted.current.has(a.id))
      .forEach((a) => {
        toasted.current.add(a.id);
        toast.warning("Alerte chantier", { description: `${a.title} — ${a.detail}` });
      });
  }, [businessAlerts]);

  // Toast des nouvelles actions sensibles du journal d'audit.
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

  // Toast + notification navigateur des nouvelles notifications persistées non lues.
  useEffect(() => {
    if (!bootstrapped.current) {
      unreadNotifications.forEach((n) => toasted.current.add(n.id));
      return;
    }
    const push = typeof window !== "undefined" && "Notification" in window;
    unreadNotifications
      .filter((n) => !toasted.current.has(n.id))
      .forEach((n) => {
        toasted.current.add(n.id);
        toast.success(n.title, { description: n.body ?? undefined });
        if (push && Notification.permission === "granted") {
          try {
            new Notification(n.title, {
              ...(n.body ? { body: n.body } : {}),
              tag: n.id,
            });
          } catch {
            // ignoré si l'API échoue
          }
        }
      });
  }, [unreadNotifications]);

  function markAllRead() {
    const now = new Date().toISOString();
    window.localStorage.setItem(SEEN_KEY, now);
    setLastSeen(now);
    markRead.mutate();
  }

  return (
    <Popover onOpenChange={(open) => open && unreadNotifications.length > 0 && markAllRead()}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {badgeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          <Badge variant="outline">{badgeCount}</Badge>
        </div>
        <ScrollArea className="max-h-96">
          {badgeCount === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Aucune alerte ni action récente.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} />
              ))}
              {businessAlerts.length > 0 && (
                <li className="px-3 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                  À surveiller
                </li>
              )}
              {businessAlerts.map((a) => (
                <li
                  key={a.id}
                  className="px-3 py-2 text-sm transition-colors hover:bg-muted/60 dark:hover:bg-white/5"
                >
                  <p className="flex items-start gap-2 leading-snug">
                    <span
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                        a.severity === "danger"
                          ? "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-300"
                          : "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                      }`}
                    >
                      <AlertTriangle className="size-3.5" />
                    </span>
                    <span className="font-medium">{a.title}</span>
                  </p>
                  <p className="mt-0.5 pl-9 text-xs text-muted-foreground">{a.detail}</p>
                </li>
              ))}
              {alerts.map((l) => (
                <li
                  key={l.id}
                  className="px-3 py-2 text-sm transition-colors hover:bg-muted/60 dark:hover:bg-white/5"
                >
                  <p className="leading-snug">{notificationText(l)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{relative(l.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="grid grid-cols-2 gap-2 border-t border-border p-2">
          <Button asChild size="sm" variant="secondary" className="w-full">
            <Link to="/alertes">Voir les alertes</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="w-full">
            <Link to="/audit">Journal d'audit</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  const unread = !notification.read_at;
  return (
    <li
      className={cn(
        "px-3 py-2 text-sm transition-colors hover:bg-muted/60 dark:hover:bg-white/5",
        unread && "border-l-2 border-l-primary bg-primary/5 dark:bg-primary/10",
      )}
    >
      <p className="flex items-start gap-2 leading-snug">
        <NotificationKindIcon
          kind={notification.kind}
          className="size-7"
          iconClassName="size-3.5"
        />
        <span className="font-medium">{notification.title}</span>
        {unread && <span className="mt-1.5 ml-1 size-1.5 shrink-0 rounded-full bg-primary" />}
      </p>
      {notification.body && (
        <p className="mt-0.5 pl-9 text-xs text-muted-foreground">{notification.body}</p>
      )}
      <p className="mt-0.5 pl-9 text-xs text-muted-foreground">
        {relative(notification.created_at)}
      </p>
    </li>
  );
}
