import { useMemo, useState } from "react";
import { BadgeCheck, LocateFixed, MapPin, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fcfa, labelOf, PRODUCT_UNITS } from "@/lib/format";
import {
  useAddToCart,
  useCompareOffers,
  useProductImageUrls,
  type CompareOffer,
  type Product,
} from "@/lib/data";
import { useGeolocation } from "@/lib/geo";

export function ProductDetailDialog({
  product,
  storeName,
  city,
  deliveryAvailable,
  open,
  onOpenChange,
  onAdd,
  adding,
}: {
  product: Product;
  storeName?: string | undefined;
  city?: string | undefined;
  deliveryAvailable: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  adding: boolean;
}) {
  const inStock = Number(product.stock) > 0;
  const hasDiscount =
    product.compare_price != null && Number(product.compare_price) > Number(product.price);

  const allImages = useMemo(
    () => Array.from(new Set(product.images?.filter(Boolean) ?? [])),
    [product.images],
  );
  const { data: urls = {} } = useProductImageUrls(allImages);
  const [imgIdx, setImgIdx] = useState(0);

  const [locate, setLocate] = useState(false);
  const { position } = useGeolocation(locate);
  const { data: offers = [] } = useCompareOffers(product.id, position ?? undefined);

  const sortedOffers = useMemo(() => {
    const list = [...offers];
    if (locate && position) {
      list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }
    return list;
  }, [offers, locate, position]);

  const features = (product.features ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-8">{product.name}</DialogTitle>
          <DialogDescription>
            {storeName}
            {city ? ` · ${city}` : ""}
            {product.brand ? ` · ${product.brand}` : ""}
            {product.reference ? ` · Réf. ${product.reference}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Galerie d'images */}
          {allImages.length > 0 ? (
            <div className="space-y-2">
              <div className="aspect-[16/9] overflow-hidden rounded-lg bg-secondary/40">
                <img
                  src={urls[allImages[imgIdx]!] ?? urls[allImages[0]!]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      className={cn(
                        "size-16 overflow-hidden rounded-md border bg-secondary/40",
                        i === imgIdx ? "border-primary" : "border-border",
                      )}
                    >
                      <img
                        src={urls[img]}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid aspect-[16/9] place-items-center rounded-lg bg-secondary/40 text-4xl">
              🛠
            </div>
          )}

          {/* Prix & stock */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold text-primary">{fcfa(product.price)}</p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                {fcfa(product.compare_price)}
              </p>
            )}
            {hasDiscount && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}%
              </Badge>
            )}
            {product.unit && (
              <Badge variant="outline">/ {labelOf(PRODUCT_UNITS, product.unit)}</Badge>
            )}
            <span
              className={cn("text-sm font-medium", inStock ? "text-success" : "text-destructive")}
            >
              {inStock ? `Stock : ${Number(product.stock)}` : "Rupture de stock"}
            </span>
            {product.min_order_quantity > 1 && (
              <span className="text-xs text-muted-foreground">
                Commande min. : {Number(product.min_order_quantity)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}

          {/* Caractéristiques & garantie */}
          {(features.length > 0 || product.warranty) && (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="size-3.5" /> Caractéristiques
              </p>
              <ul className="grid gap-1 text-sm sm:grid-cols-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
                {product.warranty && (
                  <li className="flex items-center gap-1.5 text-muted-foreground">
                    <BadgeCheck className="size-4 text-primary" /> Garantie : {product.warranty}
                  </li>
                )}
              </ul>
            </div>
          )}

          {deliveryAvailable && (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <Truck className="size-3.5" /> Livraison disponible depuis cette boutique
            </p>
          )}

          <div className="flex gap-2">
            <Button className="flex-1" disabled={!inStock || adding} onClick={onAdd}>
              <ShoppingCart className="size-4" />
              {adding ? "Ajout…" : "Ajouter au panier"}
            </Button>
            {offers.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setLocate((v) => !v)}
                className={cn(locate && "border-primary text-primary")}
                disabled={locate && !position}
              >
                <LocateFixed className="size-4" />
                {locate ? (position ? "Près de moi" : "Localisation…") : "Comparer les prix"}
              </Button>
            )}
          </div>

          {/* Comparateur de prix */}
          {sortedOffers.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <BadgeCheck className="size-3.5" /> {sortedOffers.length} autre(s) boutique(s) qui
                vendent ce produit
              </p>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {sortedOffers.map((o) => (
                  <OfferRow key={o.product.id} offer={o} locate={locate} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OfferRow({ offer, locate }: { offer: CompareOffer; locate: boolean }) {
  const addToCart = useAddToCart();
  const inStock = Number(offer.product.stock) > 0;
  const cheaper = offer.savings > 0;

  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-base">
        🛠
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {offer.store?.name ?? "Boutique"}
          {offer.store?.verified && (
            <BadgeCheck className="ml-1 inline size-3.5 text-primary" aria-label="Vérifiée" />
          )}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>
            {fcfa(offer.product.price)}
            {offer.product.unit ? ` / ${labelOf(PRODUCT_UNITS, offer.product.unit)}` : ""}
          </span>
          {offer.store?.city && <span>· {offer.store.city}</span>}
          {locate && offer.distanceKm != null && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3" /> à {offer.distanceKm} km
            </span>
          )}
          {cheaper && (
            <Badge className="bg-success text-success-foreground">
              Économie {fcfa(offer.savings)}
            </Badge>
          )}
        </p>
      </div>
      <Button
        size="sm"
        variant={cheaper ? "default" : "outline"}
        disabled={!inStock}
        onClick={() =>
          addToCart.mutate({ productId: offer.product.id, unitPrice: Number(offer.product.price) })
        }
      >
        <ShoppingCart className="size-3.5" />
        {inStock ? "Panier" : "Rupture"}
      </Button>
    </li>
  );
}
