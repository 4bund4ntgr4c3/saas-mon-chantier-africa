import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  MessageSquareText,
  Package,
  Receipt,
  RefreshCw,
  Smartphone,
  Share2,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { MobileMoneyDialog } from "@/components/mobile-money-dialog";
import { PointsMap, type MapPoint } from "@/components/points-map";
import { WhatsAppShareDialog } from "@/components/whatsapp-share-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fcfa, labelOf, ORDER_STATUSES } from "@/lib/format";
import {
  useDeliveries,
  useOrderItems,
  useOrders,
  useProducts,
  useStores,
  useUpdateDeliveryPosition,
  useUpdateDeliveryStatus,
  useUpdateOrderStatus,
  type Order,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/commandes")({
  head: () => ({
    meta: [{ title: "Mes commandes — BâtiBénin" }],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <CommandesPage />
    </FeatureGate>
  ),
});

function CommandesPage() {
  const { data: orders = [] } = useOrders();
  const { data: stores = [] } = useStores();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const storeById = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  return (
    <>
      <PageHeader
        title="Mes commandes"
        subtitle={`${orders.length} commande(s) au total`}
        action={<WhatsAppShareDialog projectName="Commande Quincaillerie" />}
      />

      {orders.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <Receipt className="mb-3 size-8 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">Aucune commande</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Les commandes passées depuis le panier apparaîtront ici, avec leur statut en temps réel.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(o.id)}
                  className={cn(
                    "panel w-full p-3 text-left transition-colors",
                    selectedId === o.id && "border-primary ring-1 ring-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold">
                      {o.reference ?? `CMD #${o.id.slice(0, 6).toUpperCase()}`}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 truncate text-sm">
                    {storeById.get(o.store_id)?.name ?? "Boutique"}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(o.ordered_at).toLocaleDateString("fr-FR")}</span>
                    <span className="num font-semibold text-primary">{fcfa(o.total)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div>{selected ? <OrderDetail order={selected} /> : <EmptyDetail />}</div>
        </div>
      )}
    </>
  );
}

function EmptyDetail() {
  return (
    <div className="panel grid min-h-64 place-items-center p-6 text-center text-sm text-muted-foreground">
      Sélectionnez une commande pour voir son détail.
    </div>
  );
}

const SELLER_STEPS = [
  "creee",
  "paiement_en_attente",
  "payee",
  "preparation",
  "prete",
  "en_livraison",
  "livree",
] as const;

function OrderDetail({ order }: { order: Order }) {
  const { data: items = [] } = useOrderItems(order.id);
  const { data: deliveries = [] } = useDeliveries();
  const { data: products = [] } = useProducts();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateDelivery = useUpdateDeliveryStatus();
  const [mmOpen, setMmOpen] = useState(false);

  const delivery = deliveries.find((d) => d.order_id === order.id) ?? null;
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const currentStep = SELLER_STEPS.indexOf(order.status as (typeof SELLER_STEPS)[number]);
  const cancelled = ["annulee", "remboursee", "litige"].includes(order.status);
  const awaitingPayment = order.status === "paiement_en_attente" || order.status === "creee";

  const advance = () => {
    const idx = SELLER_STEPS.indexOf(order.status as (typeof SELLER_STEPS)[number]);
    const next = SELLER_STEPS[idx + 1];
    if (!next) return;
    updateOrderStatus.mutate({ id: order.id, status: next });
    if (next === "en_livraison" && delivery) {
      updateDelivery.mutate({ id: delivery.id, status: "en_livraison" });
    }
    if (next === "livree" && delivery) {
      updateDelivery.mutate({ id: delivery.id, status: "livree" });
    }
  };

  const shareLink = () => {
    const ref = order.reference ?? order.id;
    const url = `${window.location.origin}/paiement/${ref}`;
    const text = `Paiement de votre commande chez BâtiBénin (${ref}) : ${fcfa(order.total)}. Règlement par mobile money ici : ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    navigator.clipboard?.writeText(url).catch(() => {});
    toast.success("Lien de paiement partagé (WhatsApp) et copié");
  };

  const shareSms = () => {
    const ref = order.reference ?? order.id;
    const url = `${window.location.origin}/paiement/${ref}`;
    const text = `Paiement de votre commande chez BâtiBénin (${ref}) : ${fcfa(order.total)}. Réglez par mobile money ici : ${url}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, "_blank", "noopener");
    navigator.clipboard?.writeText(url).catch(() => {});
    toast.success("Lien de paiement prêt à envoyer par SMS");
  };

  const completed = order.status === "livree";

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm font-semibold">
            {order.reference ?? `Commande #${order.id.slice(0, 8)}`}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Passée le {new Date(order.ordered_at).toLocaleString("fr-FR")}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={shareLink}>
          <Share2 className="size-4" /> Partager le lien de paiement
        </Button>
        <Button size="sm" variant="ghost" onClick={shareSms}>
          <MessageSquareText className="size-4" /> Envoyer par SMS
        </Button>
      </div>

      {!cancelled && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            {SELLER_STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-1.5 text-center">
                <div
                  className={cn(
                    "grid size-7 place-items-center rounded-full border text-[10px] font-semibold",
                    i < currentStep || completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : i === currentStep
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {i < currentStep || completed ? <CheckCircle2 className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-tight",
                    i <= currentStep || completed ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {labelOf(ORDER_STATUSES, s)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 rounded bg-border">
            <div
              className="h-1 rounded bg-primary transition-all"
              style={{
                width: `${((currentStep + (completed ? 1 : 0)) / SELLER_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {currentStep < SELLER_STEPS.length - 1 && (
            <div className="mt-4 flex gap-2">
              {awaitingPayment && (
                <Button variant="outline" onClick={() => setMmOpen(true)} className="flex-1">
                  <Smartphone className="size-4" /> Payer par mobile money
                </Button>
              )}
              <Button
                className={awaitingPayment ? "flex-1" : "w-full"}
                onClick={advance}
                disabled={updateOrderStatus.isPending}
              >
                <RefreshCw className="size-4" /> Marquer «{" "}
                {labelOf(ORDER_STATUSES, SELLER_STEPS[currentStep + 1])} »
              </Button>
            </div>
          )}
          {completed && (
            <p className="mt-3 flex items-center gap-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="size-4" /> Commande livrée avec succès.
            </p>
          )}
        </div>
      )}

      {cancelled && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Cette commande est {labelOf(ORDER_STATUSES, order.status).toLowerCase()}.
        </p>
      )}

      <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
        <DetailRow label="Sous-total" value={fcfa(order.subtotal)} />
        <DetailRow label="Livraison" value={fcfa(order.delivery_fee)} />
        <DetailRow label="Total" value={fcfa(order.total)} highlight />
        <DetailRow label="Paiement" value={labelOf(PAYMENT, order.payment_method)} />
        {order.city && <DetailRow label="Ville" value={order.city} />}
        {order.phone && <DetailRow label="Téléphone" value={order.phone} />}
        {order.delivery_address && <DetailRow label="Adresse" value={order.delivery_address} />}
        {order.notes && <DetailRow label="Remarques" value={order.notes} />}
      </dl>

      {delivery && (
        <div className="mt-5 rounded-md border border-border p-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="size-4" /> Livraison
          </p>
          <div className="mt-2 grid gap-1 text-sm">
            {delivery.scheduled_at && (
              <span className="text-muted-foreground">
                Prévue le {new Date(delivery.scheduled_at).toLocaleString("fr-FR")}
              </span>
            )}
            <span className="text-muted-foreground">Frais : {fcfa(delivery.fee)}</span>
            <span className="mt-1">
              Statut : <Badge variant="outline">{labelOf(DELIVERY, delivery.status)}</Badge>
            </span>
            {delivery.position_updated_at && (
              <span className="text-xs text-muted-foreground">
                <MapPin className="mr-1 inline-block size-3" />
                Dernière position :{" "}
                {new Date(delivery.position_updated_at).toLocaleTimeString("fr-FR")}
              </span>
            )}
          </div>

          {(delivery.lat != null && delivery.lng != null) ||
          (delivery.current_lat != null && delivery.current_lng != null) ? (
            <div className="mt-3">
              <DeliveryMap delivery={delivery} order={order} />
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Package className="size-4" /> Articles ({items.length})
        </p>
        <ul className="mt-2 divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{it.name}</p>
                <p className="text-xs text-muted-foreground">
                  {it.quantity} × {fcfa(it.unit_price)}
                  {it.unit ? ` / ${it.unit}` : ""}
                </p>
              </div>
              <span className="num font-semibold">
                {fcfa(Number(it.quantity) * Number(it.unit_price))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <MobileMoneyDialog
        projectId={null}
        orderId={order.id}
        amount={order.total}
        open={mmOpen}
        onOpenChange={setMmOpen}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn("num text-right", highlight ? "font-semibold text-primary" : "font-medium")}
      >
        {value}
      </dd>
    </div>
  );
}

const PAYMENT = [
  { value: "especes", label: "Espèces" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "moov_money", label: "Moov Money" },
  { value: "virement", label: "Virement" },
  { value: "cheque", label: "Chèque" },
  { value: "a_la_livraison", label: "À la livraison" },
] as const;

const DELIVERY = [
  { value: "planifiee", label: "Planifiée" },
  { value: "en_attente_transporteur", label: "En attente transporteur" },
  { value: "en_livraison", label: "En livraison" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
] as const;

function DeliveryMap({ delivery, order }: { delivery: Record<string, unknown>; order: Order }) {
  const d = delivery as {
    id: string;
    lat: number | null;
    lng: number | null;
    current_lat: number | null;
    current_lng: number | null;
    status: string;
    to_address: string | null;
  };
  const updatePosition = useUpdateDeliveryPosition();

  const points: MapPoint[] = [];
  const path: [number, number][] = [];

  // Origine (boutique / point de départ)
  if (d.lat != null && d.lng != null) {
    points.push({
      id: "origin",
      lat: d.lat,
      lng: d.lng,
      title: "Point de départ",
      kind: "pin",
    });
  }

  // Position actuelle du transporteur
  if (d.current_lat != null && d.current_lng != null) {
    points.push({
      id: "truck",
      lat: d.current_lat,
      lng: d.current_lng,
      title: "Transporteur",
      subtitle: d.status === "en_livraison" ? "En route" : null,
      kind: "truck",
      badges: [labelOf(DELIVERY, d.status)],
    });
    // Tracé itinéraire : position → destination
    if (order.lat != null && order.lng != null) {
      path.push([d.current_lat, d.current_lng], [order.lat, order.lng]);
    }
  }

  // Destination (adresse de livraison)
  if (order.lat != null && order.lng != null) {
    points.push({
      id: "destination",
      lat: order.lat,
      lng: order.lng,
      title: "Destination",
      subtitle: order.delivery_address ?? null,
      kind: "target",
    });
  }

  if (points.length === 0) return null;

  const simPosition = () => {
    if (d.current_lat == null || d.current_lng == null || order.lat == null || order.lng == null)
      return;
    // Simuler un pas vers la destination (20 %)
    const newLat = d.current_lat + (order.lat - d.current_lat) * 0.2;
    const newLng = d.current_lng + (order.lng - d.current_lng) * 0.2;
    updatePosition.mutate({ id: d.id, lat: newLat, lng: newLng });
    toast.success("Position du transporteur mise à jour");
  };

  return (
    <div className="space-y-2">
      <PointsMap points={points} path={path} title="Suivi de livraison" height="h-[300px]" />
      {d.status === "en_livraison" && (
        <Button size="sm" variant="outline" onClick={simPosition}>
          <Truck className="size-4" /> Simuler déplacement
        </Button>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    creee: "border-border text-muted-foreground",
    paiement_en_attente:
      "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    payee: "border-border bg-secondary text-secondary-foreground",
    prete: "border-border bg-secondary text-secondary-foreground",
    preparation: "border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    en_livraison: "border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    livree:
      "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    annulee: "border-destructive bg-destructive/10 text-destructive",
    remboursee: "border-destructive bg-destructive/10 text-destructive",
    litige: "border-destructive bg-destructive/10 text-destructive",
  };
  return (
    <Badge variant="outline" className={cn("border", tone[status])}>
      {labelOf(ORDER_STATUSES, status)}
    </Badge>
  );
}
