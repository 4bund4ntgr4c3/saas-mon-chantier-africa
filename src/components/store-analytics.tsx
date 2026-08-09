import { TrendingUp, Package, PackageX, ReceiptText, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { fcfa } from "@/lib/format";
import {
  useAddInventoryMovement,
  useProductInventory,
  useProductPrices,
  useStoreAnalytics,
  type Product,
  type StoreAnalytics as StoreAnalyticsData,
} from "@/lib/data";
import { StatusBadge } from "@/routes/_authenticated/commandes";

export function StoreAnalytics({ storeId }: { storeId: string | null }) {
  const { data: analytics } = useStoreAnalytics(storeId);

  if (!analytics) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={<Wallet className="size-4 text-primary" />}
        label="Chiffre d'affaires"
        value={fcfa(analytics.revenue)}
        hint={`${analytics.orderCount} commande(s)`}
      />
      <KpiCard
        icon={<ReceiptText className="size-4 text-primary" />}
        label="Panier moyen"
        value={fcfa(Math.round(analytics.avgOrderValue))}
        hint="par commande"
      />
      <KpiCard
        icon={<Package className="size-4 text-primary" />}
        label="Produits au catalogue"
        value={String(analytics.productCount)}
        hint={`${analytics.outOfStockCount} en rupture`}
      />
      <KpiCard
        icon={<TrendingUp className="size-4 text-primary" />}
        label="Meilleure vente"
        value={analytics.topProducts[0]?.name ?? "—"}
        hint={
          analytics.topProducts[0]
            ? `${analytics.topProducts[0].quantity} vendu(s)`
            : "pas encore de vente"
        }
        valueClassName="truncate text-sm"
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={cn("num mt-2 truncate font-display text-xl font-semibold", valueClassName)}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TopProducts({ analytics }: { analytics: StoreAnalyticsData | null | undefined }) {
  if (!analytics || analytics.topProducts.length === 0) {
    return (
      <div className="panel p-4">
        <h3 className="font-display text-base font-semibold">Meilleures ventes</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Aucune vente enregistrée pour l'instant.
        </p>
      </div>
    );
  }
  const max = Math.max(...analytics.topProducts.map((t) => t.quantity));
  return (
    <div className="panel p-4">
      <h3 className="font-display text-base font-semibold">Meilleures ventes</h3>
      <ul className="mt-3 space-y-2">
        {analytics.topProducts.map((t) => (
          <li key={t.name} className="flex items-center gap-2">
            <span className="w-24 truncate text-sm">{t.name}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(t.quantity / max) * 100}%` }}
              />
            </div>
            <span className="num text-xs text-muted-foreground">
              {t.quantity} · {fcfa(t.revenue)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecentSales({ storeId }: { storeId: string | null }) {
  const { data: analytics } = useStoreAnalytics(storeId);
  if (!analytics || analytics.recentOrders.length === 0) {
    return (
      <div className="panel p-4">
        <h3 className="font-display text-base font-semibold">Dernières ventes</h3>
        <p className="mt-2 text-sm text-muted-foreground">Aucune commande reçue pour l'instant.</p>
      </div>
    );
  }
  return (
    <div className="panel p-4">
      <h3 className="font-display text-base font-semibold">Dernières ventes</h3>
      <ul className="mt-2 divide-y divide-border">
        {analytics.recentOrders.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{o.reference ?? o.id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.ordered_at).toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={o.status} />
              <span className="num text-sm font-semibold text-primary">{fcfa(o.total)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const REASON_LABELS: Record<string, string> = {
  stock_init: "Stock initial",
  sale: "Vente",
  restock: "Réassort",
  adjustment: "Ajustement",
  return: "Retour",
  cancellation: "Annulation",
};

export function ProductMovement({ product }: { product: Product }) {
  const addMovement = useAddInventoryMovement();
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("restock");
  const [note, setNote] = useState("");

  const { data: movements = [] } = useProductInventory(product.id);
  const { data: priceHistory = [] } = useProductPrices(product.id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="size-8 text-muted-foreground">
          <PackageX className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Stock actuel : <span className="num font-semibold">{Number(product.stock)}</span>. Suivi
            des mouvements et de l'historique des prix.
          </DialogDescription>
        </DialogHeader>

        <form
          className="rounded-lg border border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            const qty = Number(delta);
            if (!qty || Number.isNaN(qty)) return;
            addMovement.mutate({
              product_id: product.id,
              quantity_delta: qty,
              reason,
              note: note || null,
            });
            setDelta("");
            setNote("");
          }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ajouter un mouvement
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Quantité (±)</Label>
              <Input
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                placeholder="+50 / -10"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Motif</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REASON_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Note</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Réception fournisseur…"
              />
            </div>
          </div>
          <Button type="submit" size="sm" className="mt-2 w-full" disabled={!delta.trim()}>
            Enregistrer le mouvement
          </Button>
        </form>

        {movements.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mouvements de stock
            </p>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {movements.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <span
                    className={cn(
                      "num font-semibold",
                      Number(m.quantity_delta) >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {Number(m.quantity_delta) > 0 ? "+" : ""}
                    {Number(m.quantity_delta)}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {REASON_LABELS[m.reason] ?? m.reason}
                  </Badge>
                  <span className="flex-1 truncate text-xs text-muted-foreground">
                    {m.note ?? new Date(m.created_at).toLocaleString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {priceHistory.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Historique des prix
            </p>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {priceHistory.slice(0, 6).map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.changed_at).toLocaleString("fr-FR")}
                    {h.note ? ` · ${h.note}` : ""}
                  </span>
                  <span className="num font-semibold text-primary">{fcfa(h.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
