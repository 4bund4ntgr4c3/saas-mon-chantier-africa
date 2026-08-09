import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  ShoppingBag,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fcfa, labelOf, PAYMENT_METHODS, PRODUCT_UNITS } from "@/lib/format";
import {
  useAddToCart,
  useCreateOrder,
  useDrivers,
  useMyCart,
  useProducts,
  useRemoveCartItem,
  useStores,
  useUpdateCartItem,
} from "@/lib/data";
import { QtyStepper, CloseButton } from "./boutique";

export const Route = createFileRoute("/_authenticated/panier")({
  head: () => ({
    meta: [{ title: "Mon panier — BâtiBénin" }],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <PanierPage />
    </FeatureGate>
  ),
});

function PanierPage() {
  const { data: cart, isLoading } = useMyCart();
  const { data: products = [] } = useProducts();
  const { data: stores = [] } = useStores();
  const { data: drivers = [] } = useDrivers();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const createOrder = useCreateOrder();
  const { projects, project } = useCurrentProject();

  const [projectId, setLocalProjectId] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [wantDelivery, setWantDelivery] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const storeById = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);

  const rows = useMemo(() => {
    const items = (cart?.items ?? []).map((it) => {
      const p = productById.get(it.product_id);
      const s = p ? storeById.get(p.store_id) : undefined;
      const total = Number(it.quantity) * Number(it.unit_price);
      return { item: it, product: p, store: s, total };
    });
    const grouped = new Map<string, typeof items>();
    for (const r of items) {
      const key = r.store?.id ?? "autre";
      grouped.set(key, [...(grouped.get(key) ?? []), r]);
    }
    return Array.from(grouped.entries()).map(([storeId, its]) => ({
      storeId,
      storeName: its[0]!.store?.name ?? "Autre boutique",
      store: its[0]!.store ?? null,
      rows: its,
      subtotal: its.reduce((acc, r) => acc + r.total, 0),
    }));
  }, [cart, productById, storeById]);

  const subtotal = rows.reduce((acc, g) => acc + g.subtotal, 0);
  const effectiveProjectId = projectId ?? project?.id ?? null;

  const totalByGroup = useMemo(() => {
    return rows.map((g) => {
      const deliveryFee = wantDelivery && g.store?.delivery_available ? 2000 : 0;
      return { ...g, deliveryFee, total: g.subtotal + deliveryFee };
    });
  }, [rows, wantDelivery]);

  const grandTotal = totalByGroup.reduce((acc, g) => acc + g.total, 0);

  if (isLoading) {
    return <div className="panel p-10 text-center text-sm text-muted-foreground">Chargement…</div>;
  }

  const empty = (cart?.items?.length ?? 0) === 0;

  if (empty) {
    return (
      <>
        <PageHeader title="Mon panier" />
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <ShoppingBag className="mb-3 size-8 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">Votre panier est vide</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Parcourez la boutique de matériaux et ajoutez des produits pour lancer une commande.
          </p>
          <Button asChild className="mt-5">
            <Link to="/boutique">Voir la boutique</Link>
          </Button>
        </div>
      </>
    );
  }

  const placeOrder = async (storeGroup: (typeof totalByGroup)[number]) => {
    if (!paymentMethod) {
      toast.error("Choisissez un mode de paiement");
      return;
    }
    const items = storeGroup.rows.map((r) => ({
      productId: r.item.product_id,
      name: r.product?.name ?? "Produit",
      unit: r.product?.unit ?? null,
      quantity: Number(r.item.quantity),
      unitPrice: Number(r.item.unit_price),
    }));
    const store = storeById.get(storeGroup.storeId);
    await createOrder.mutateAsync({
      storeId: storeGroup.storeId,
      projectId: effectiveProjectId,
      items,
      subtotal: storeGroup.subtotal,
      deliveryFee: storeGroup.deliveryFee,
      total: storeGroup.total,
      paymentMethod,
      deliveryAddress: wantDelivery ? deliveryAddress || null : null,
      city: wantDelivery ? city || null : null,
      phone: phone || null,
      notes: notes || null,
      delivery:
        wantDelivery && store?.delivery_available
          ? {
              driverId,
              scheduledAt: scheduledAt || null,
              fee: storeGroup.deliveryFee,
            }
          : null,
    });
  };

  return (
    <>
      <PageHeader
        title="Mon panier"
        subtitle={`${cart?.items?.length ?? 0} article(s) · ${totalByGroup.length} boutique(s)`}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/boutique">
              <ArrowLeft className="size-4" /> Continuer mes achats
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {totalByGroup.map((g) => (
            <div key={g.storeId} className="panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">{g.storeName}</h2>
                <Badge variant="secondary">{fcfa(g.subtotal)}</Badge>
              </div>
              <ul className="divide-y divide-border">
                {g.rows.map((r) => {
                  const inStock = r.product && Number(r.product.stock) > 0;
                  return (
                    <li key={r.item.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {r.product?.name ?? "Produit"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fcfa(r.item.unit_price)} /{" "}
                          {r.product?.unit ? labelOf(PRODUCT_UNITS, r.product.unit) : "unité"} ·{" "}
                          {fcfa(r.total)}
                        </p>
                      </div>
                      <QtyStepper
                        value={Number(r.item.quantity)}
                        onChange={(v) => updateItem.mutate({ id: r.item.id, quantity: v })}
                      />
                      <CloseButton onClick={() => removeItem.mutate(r.item.id)} />
                      {!inStock && <Badge variant="destructive">Rupture</Badge>}
                    </li>
                  );
                })}
              </ul>
              {g.store?.delivery_available && (
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="size-3.5" /> Livraison estimée : {fcfa(g.deliveryFee)}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="panel h-fit p-4 lg:sticky lg:top-24">
          <h2 className="font-display text-base font-semibold">Livraison & paiement</h2>

          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="delivery"
                checked={wantDelivery}
                onCheckedChange={(v) => setWantDelivery(Boolean(v))}
              />
              <Label htmlFor="delivery" className="text-sm font-medium">
                Livraison sur le chantier
              </Label>
            </div>

            {wantDelivery && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs">
                    Adresse de livraison
                  </Label>
                  <Input
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Quartier, rue, repère…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs">
                      Ville
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cotonou"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs">
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+229"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="driver" className="text-xs">
                      Transporteur
                    </Label>
                    <Select value={driverId ?? ""} onValueChange={(v) => setDriverId(v)}>
                      <SelectTrigger id="driver" className="w-full">
                        <SelectValue placeholder="Automatique" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} · {fcfa(d.price_per_km)}/km
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="schedule" className="text-xs">
                      Livraison le
                    </Label>
                    <Input
                      id="schedule"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="project" className="text-xs">
                Chantier associé
              </Label>
              <Select value={effectiveProjectId ?? ""} onValueChange={(v) => setLocalProjectId(v)}>
                <SelectTrigger id="project" className="w-full">
                  <SelectValue placeholder="Aucun chantier" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Mode de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      paymentMethod === m.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-secondary/50",
                    )}
                  >
                    <PaymentIcon method={m.value} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">
                Remarques
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Précisions pour la livraison…"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Sous-total</dt>
              <dd className="num font-medium">{fcfa(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Livraison</dt>
              <dd className="num font-medium">
                {fcfa(totalByGroup.reduce((a, g) => a + g.deliveryFee, 0))}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="num font-semibold text-primary">{fcfa(grandTotal)}</dd>
            </div>
          </dl>

          <Button
            className="mt-4 w-full"
            disabled={createOrder.isPending}
            onClick={() => totalByGroup.forEach((g) => void placeOrder(g))}
          >
            {createOrder.isPending
              ? "Commande en cours…"
              : `Passer la commande · ${fcfa(grandTotal)}`}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {totalByGroup.length > 1
              ? "Une commande sera créée pour chaque boutique."
              : "Paiement à la livraison ou mobile money."}
          </p>
        </div>
      </div>
    </>
  );
}

function PaymentIcon({ method }: { method: string }) {
  switch (method) {
    case "especes":
      return <Wallet className="size-4 shrink-0" />;
    case "mtn_momo":
    case "moov_money":
      return <Smartphone className="size-4 shrink-0" />;
    case "virement":
      return <CreditCard className="size-4 shrink-0" />;
    case "cheque":
      return <MapPin className="size-4 shrink-0" />;
    default:
      return null;
  }
}
