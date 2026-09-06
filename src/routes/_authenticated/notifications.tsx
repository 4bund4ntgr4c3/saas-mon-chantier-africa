import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, BellOff, BellRing, CheckCheck, Trash2 } from "lucide-react";
import { FeatureGate } from "@/components/feature-gate";
import { PageHeader } from "@/components/app-shell";
import { NotificationKindIcon } from "@/components/notification-kind-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useDeleteNotification,
  useMarkNotificationRead,
  useMarkNotificationsRead,
  useNotifications,
  NOTIFICATION_KIND_LABELS,
  type AppNotification,
  type AppNotificationKind,
} from "@/lib/data";
import { frDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Mes notifications — BâtiBénin" },
      {
        name: "description",
        content:
          "Historique de vos notifications : commandes, paiements, livraisons, devis, rapports et alertes.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="alertes">
      <NotificationsPage />
    </FeatureGate>
  ),
});

const KIND_FILTERS: (AppNotificationKind | "all")[] = [
  "all",
  "commande",
  "paiement",
  "livraison",
  "devis",
  "verification",
  "rapport",
  "litige",
  "alerte",
  "assistant",
];

function NotificationsPage() {
  const { data: notifications = [] } = useNotifications(200);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkNotificationsRead();
  const remove = useDeleteNotification();
  const [kind, setKind] = useState<AppNotificationKind | "all">("all");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (kind !== "all" && n.kind !== kind) return false;
      if (onlyUnread && n.read_at) return false;
      return true;
    });
  }, [notifications, kind, onlyUnread]);

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div>
      <PageHeader
        title="Mes notifications"
        subtitle={`${notifications.length} notification(s) au total — ${unread} non lue(s)`}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={unread === 0 || markAllRead.isPending}
          >
            <CheckCheck className="mr-1.5 size-4" /> Tout marquer lu
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {KIND_FILTERS.map((k) => (
          <Button
            key={k}
            size="sm"
            variant={kind === k ? "secondary" : "ghost"}
            onClick={() => setKind(k)}
          >
            {k === "all" ? "Tout" : NOTIFICATION_KIND_LABELS[k]}
          </Button>
        ))}
        <Button
          size="sm"
          variant={onlyUnread ? "secondary" : "ghost"}
          onClick={() => setOnlyUnread((v) => !v)}
          title="Afficher uniquement les notifications non lues"
        >
          {onlyUnread ? <BellRing className="size-4" /> : <BellOff className="size-4" />} Non lues
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <Bell className="mb-3 size-8 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune notification</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Vos notifications de commandes, paiements, livraisons et alertes apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {filtered.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onToggleRead={(read) => markRead.mutate({ id: n.id, read })}
              onDelete={() => remove.mutate(n.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationRow({
  notification: n,
  onToggleRead,
  onDelete,
}: {
  notification: AppNotification;
  onToggleRead: (read: boolean) => void;
  onDelete: () => void;
}) {
  const unread = !n.read_at;
  const body = (
    <div className={cn("flex flex-1 items-start gap-3", unread && "font-medium")}>
      <NotificationKindIcon kind={n.kind} className="mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm leading-snug">{n.title}</p>
        {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          <Badge variant="outline" className="mr-2">
            {NOTIFICATION_KIND_LABELS[n.kind]}
          </Badge>
          {frDateTime(n.created_at)}
        </p>
      </div>
    </div>
  );

  return (
    <li
      className={cn(
        "flex items-start gap-2 px-4 py-3 transition-colors hover:bg-muted/60 dark:hover:bg-white/5",
        unread && "border-l-2 border-l-primary bg-primary/5 dark:bg-primary/10",
      )}
    >
      {n.link ? (
        <a href={n.link} className="flex flex-1 items-start gap-3 hover:underline">
          {body}
        </a>
      ) : (
        body
      )}
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          title={unread ? "Marquer comme lue" : "Marquer comme non lue"}
          onClick={() => onToggleRead(!unread)}
        >
          <CheckCheck className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-destructive"
          title="Supprimer"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}
