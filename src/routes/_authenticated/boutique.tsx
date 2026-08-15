import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LocateFixed, MapPin, Minus, Plus, Search, ShoppingCart, Truck, X } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { ProductDetailDialog } from "@/components/product-compare";
import { StoreMap } from "@/components/store-map";
import { TransportCostDialog } from "@/components/transport-cost-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fcfa, labelOf, PRODUCT_UNITS } from "@/lib/format";
import { formatDistance, haversineKm, useGeolocation } from "@/lib/geo";
import {
  useAddToCart,
  useProductCategories,
  useProductImageUrls,
  useProducts,
  useStores,
  type Product,
} from "@/lib/data";

const NEARBY_RADII = [2, 5, 10, 25] as const;

export const Route = createFileRoute("/_authenticated/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique de matériaux — BâtiBénin" },
      {
        name: "description",
        content:
          "Catalogue de matériaux de construction : ciment, fer à béton, sable. Comparez les prix des quincailleries près de chez vous.",
      },
      { property: "og:title", content: "Boutique de matériaux — BâtiBénin" },
      {
        property: "og:description",
        content: "Commandez vos matériaux et suivez la livraison jusqu'au chantier.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <BoutiquePage />
    </FeatureGate>
  ),
});

function BoutiquePage() {
  const { data: products = [] } = useProducts();
  const { data: stores = [] } = useStores();
  const { data: categories = [] } = useProductCategories();
  const addToCart = useAddToCart();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [selected, setSelected] = useState<Product | null>(null);
  const [locate, setLocate] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const { position } = useGeolocation(locate);

  const allImages = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.images ?? []))),
    [products],
  );
  const { data: urls = {} } = useProductImageUrls(allImages);

  const storeById = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const storeDistances = useMemo(() => {
    const map = new Map<string, number>();
    if (!position) return map;
    for (const s of stores) {
      if (s.lat == null || s.lng == null) continue;
      map.set(s.id, haversineKm(position.lat, position.lng, s.lat, s.lng));
    }
    return map;
  }, [position, stores]);

  const nearbyStores = useMemo(() => {
    if (!position) return new Set<string>();
    const set = new Set<string>();
    for (const [id, km] of storeDistances) {
      if (km <= radiusKm) set.add(id);
    }
    return set;
  }, [position, radiusKm, storeDistances]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "all" && p.category_id !== category) return false;
      if (locate && position && !nearbyStores.has(p.store_id)) return false;
      if (!needle) return true;
      return [p.name, p.brand, p.reference, storeById.get(p.store_id)?.name]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(needle));
    });
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return [...list].sort((a, b) => Number(b.price) - Number(a.price));
      case "stock":
        return [...list].sort((a, b) => Number(b.stock) - Number(a.stock));
      case "proximity":
        return [...list].sort(
          (a, b) =>
            (storeDistances.get(a.store_id) ?? Infinity) -
            (storeDistances.get(b.store_id) ?? Infinity),
        );
      default:
        return list;
    }
  }, [products, q, category, sort, storeById, locate, position, nearbyStores, storeDistances]);

  const lowStockCount = products.filter((p) => Number(p.stock) <= 0).length;

  return (
    <>
      <PageHeader
        title="Boutique de matériaux"
        subtitle={`${products.length} produit(s) · ${stores.length} boutique(s) · ${lowStockCount} en rupture`}
        action={<TransportCostDialog />}
      />

      <div className="panel mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ciment 50 kg, fer à béton, sable…"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Trier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Pertinence</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
            <SelectItem value="stock">Stock disponible</SelectItem>
            <SelectItem value="proximity" disabled={!position}>
              Près de moi
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={locate ? "default" : "outline"}
          onClick={() => setLocate((v) => !v)}
          className={cn(locate && !position && "opacity-70")}
        >
          <LocateFixed className="size-4" />
          {locate ? (position ? "Position activée" : "Localisation…") : "Près de moi"}
        </Button>
        {locate && position && (
          <Select value={String(radiusKm)} onValueChange={(v) => setRadiusKm(Number(v))}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Rayon" />
            </SelectTrigger>
            <SelectContent>
              {NEARBY_RADII.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  Rayon {r} km
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {locate && (
        <div className="mb-5">
          <StoreMap stores={stores} position={position} />
          {position && nearbyStores.size > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {nearbyStores.size} boutique(s) dans un rayon de {radiusKm} km
            </p>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          Aucun produit ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              storeName={storeById.get(p.store_id)?.name}
              city={storeById.get(p.store_id)?.city ?? undefined}
              distanceKm={position ? (storeDistances.get(p.store_id) ?? null) : null}
              deliveryAvailable={Boolean(storeById.get(p.store_id)?.delivery_available)}
              catName={catById.get(p.category_id ?? "")?.name}
              imageUrl={p.images?.[0] ? urls[p.images[0]] : undefined}
              onAdd={() => addToCart.mutate({ productId: p.id, unitPrice: Number(p.price) })}
              adding={addToCart.isPending}
              onOpen={() => setSelected(p)}
            />
          ))}
        </div>
      )}

      {selected && (
        <ProductDetailDialog
          product={selected}
          storeName={storeById.get(selected.store_id)?.name}
          city={storeById.get(selected.store_id)?.city ?? undefined}
          deliveryAvailable={Boolean(storeById.get(selected.store_id)?.delivery_available)}
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          onAdd={() =>
            addToCart.mutate({ productId: selected.id, unitPrice: Number(selected.price) })
          }
          adding={addToCart.isPending}
        />
      )}
    </>
  );
}

function ProductCard({
  product,
  storeName,
  city,
  distanceKm,
  deliveryAvailable,
  catName,
  imageUrl,
  onAdd,
  adding,
  onOpen,
}: {
  product: Product;
  storeName?: string | undefined;
  city?: string | undefined;
  distanceKm?: number | null;
  deliveryAvailable: boolean;
  catName?: string | undefined;
  imageUrl?: string | undefined;
  onAdd: () => void;
  adding: boolean;
  onOpen: () => void;
}) {
  const inStock = Number(product.stock) > 0;
  const hasDiscount =
    product.compare_price != null && Number(product.compare_price) > Number(product.price);

  return (
    <article className="panel flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`Voir ${product.name}`}
      >
        <div className="relative aspect-[16/9] bg-secondary/40">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-4xl">🛠</div>
          )}
          {hasDiscount && (
            <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
              -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}%
            </Badge>
          )}
          {!inStock && (
            <div className="absolute inset-0 grid place-items-center bg-background/60">
              <Badge variant="secondary" className="text-sm">
                Rupture de stock
              </Badge>
            </div>
          )}
        </div>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {catName && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {catName}
              </p>
            )}
            <h2 className="truncate font-display text-base font-semibold">{product.name}</h2>
          </div>
          {product.unit && (
            <Badge variant="outline" className="shrink-0">
              / {labelOf(PRODUCT_UNITS, product.unit)}
            </Badge>
          )}
        </div>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-primary">{fcfa(product.price)}</p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">
                {fcfa(product.compare_price)}
              </p>
            )}
          </div>
          <span
            className={cn("text-xs font-medium", inStock ? "text-success" : "text-destructive")}
          >
            {inStock ? `Stock : ${Number(product.stock)}` : "Indisponible"}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">
            {storeName ?? "Boutique"}
            {city ? ` · ${city}` : ""}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {distanceKm != null && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="size-3" /> à {formatDistance(distanceKm)}
              </span>
            )}
            {deliveryAvailable && (
              <span className="inline-flex items-center gap-1 text-success">
                <Truck className="size-3.5" /> Livraison
              </span>
            )}
          </span>
        </div>

        <Button className="mt-4 w-full" disabled={!inStock || adding} onClick={onAdd}>
          {adding ? (
            "Ajout…"
          ) : (
            <>
              <ShoppingCart className="size-4" /> Ajouter au panier
            </>
          )}
        </Button>
      </div>
    </article>
  );
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="outline"
        className="size-8"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="num w-10 text-center text-sm font-semibold">{value}</span>
      <Button size="icon" variant="outline" className="size-8" onClick={() => onChange(value + 1)}>
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid size-7 place-items-center rounded-full bg-secondary/70 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      aria-label="Fermer"
    >
      <X className="size-4" />
    </button>
  );
}
