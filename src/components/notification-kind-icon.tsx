import {
  Bell,
  BellRing,
  ClipboardList,
  FileText,
  Handshake,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AppNotificationKind } from "@/lib/data";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<AppNotificationKind, LucideIcon> = {
  alerte: BellRing,
  commande: Package,
  livraison: Truck,
  paiement: Wallet,
  devis: FileText,
  rapport: ClipboardList,
  litige: Handshake,
  verification: ShieldCheck,
  assistant: Sparkles,
};

/** Pastille teintée par type de notification, lisible en clair comme en sombre. */
const KIND_CHIPS: Record<AppNotificationKind, string> = {
  alerte: "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-300",
  commande: "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  livraison: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300",
  paiement: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  devis: "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  rapport: "bg-slate-500/10 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  litige: "bg-orange-500/10 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  verification: "bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  assistant: "bg-fuchsia-500/10 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
};

export function NotificationKindIcon({
  kind,
  className,
  iconClassName,
}: {
  kind: AppNotificationKind;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = KIND_ICONS[kind] ?? Bell;
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border border-transparent",
        KIND_CHIPS[kind],
        className,
      )}
    >
      <Icon className={cn("size-4", iconClassName)} />
    </span>
  );
}
