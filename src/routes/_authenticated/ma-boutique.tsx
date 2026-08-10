import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Badge as BadgeIcon,
  Boxes,
  Building2,
  Package,
  Pencil,
  Plus,
  Sparkles,
  Store as StoreIcon,
  Trash2,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { ProductMovement, StoreAnalytics, TopProducts } from "@/components/store-analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fcfa, labelOf, PRODUCT_UNITS } from "@/lib/format";
import {
  useDeleteRow,
  useOrders,
  useProductCategories,
  useProductsByStore,
  useSaveRow,
  useStoreAnalytics,
  useStores,
  suggestProductDescription,
  type Product,
  type Store,
} from "@/lib/data";
import { isGuestMode } from "@/lib/guest-mode";
import { StatusBadge } from "./commandes";

type StoreFormState = {
  name: string;
  city: string;
  address: string;
  phone: string;
  delivery_available: boolean;
  delivery_radius_km: string;
  delivery_zone: string;
  description: string;
};

export const Route = createFileRoute("/_authenticated/ma-boutique")({
  head: () => ({
    meta: [{ title: "Ma boutique — BâtiBénin" }],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <MaBoutiquePage />
    </FeatureGate>
  ),
});

function MaBoutiquePage() {
  const { data: stores = [] } = useStores();
  const { data: categories = [] } = useProductCategories();
  const saveStore = useSaveRow("stores", "Boutique enregistrée");
  const saveProduct = useSaveRow("products", "Produit enregistré");
  const deleteProduct = useDeleteRow("products");

  const [editing, setEditing] = useState<Store | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const myStores = isGuestMode() ? stores : stores; // la RLS filtre côté serveur : seule la boutique du user est visible
  const store = myStores[0] ?? null;
  const selectedStore = myStores.find((s) => s.id === selectedStoreId) ?? store ?? null;

  const { data: products = [] } = useProductsByStore(selectedStore?.id ?? null);
  const { data: analytics } = useStoreAnalytics(selectedStore?.id ?? null);

  const [form, setForm] = useState<StoreFormState>({
    name: "",
    city: "",
    address: "",
    phone: "",
    delivery_available: false,
    delivery_radius_km: "",
    delivery_zone: "",
    description: "",
  });
  const [prodForm, setProdForm] = useState({
    name: "",
    category_id: "",
    unit: "",
    price: "",
    compare_price: "",
    stock: "",
    min_order_quantity: "",
    description: "",
  });

  const openEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdForm({
      name: p.name,
      category_id: p.category_id ?? "",
      unit: p.unit ?? "",
      price: String(p.price),
      compare_price: p.compare_price != null ? String(p.compare_price) : "",
      stock: String(p.stock),
      min_order_quantity: String(p.min_order_quantity ?? 1),
      description: p.description ?? "",
    });
  };

  const openEdit = (s: Store) => {
    setEditing(s);
    setForm({
      name: s.name,
      city: s.city ?? "",
      address: s.address ?? "",
      phone: s.phone ?? "",
      delivery_available: s.delivery_available,
      delivery_radius_km: s.delivery_radius_km != null ? String(s.delivery_radius_km) : "",
      delivery_zone: s.delivery_zone ?? "",
      description: s.description ?? "",
    });
  };

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({
      name: "",
      city: "",
      address: "",
      phone: "",
      delivery_available: true,
      delivery_radius_km: "",
      delivery_zone: "",
      description: "",
    });
  };

  const submitStore = () => {
    if (!form.name.trim()) return;
    const radius = form.delivery_radius_km.trim()
      ? Math.max(0, Number(form.delivery_radius_km) || 0)
      : null;
    saveStore.mutate({
      id: editing?.id,
      values: { ...form, delivery_radius_km: radius },
    } as never);
    setCreating(false);
    setEditing(null);
  };

  const submitProduct = () => {
    if (!prodForm.name.trim() || !selectedStore) return;
    const values = {
      name: prodForm.name,
      store_id: selectedStore.id,
      category_id: prodForm.category_id || null,
      unit: prodForm.unit || null,
      price: Number(prodForm.price) || 0,
      compare_price: prodForm.compare_price ? Number(prodForm.compare_price) : null,
      stock: Number(prodForm.stock) || 0,
      min_order_quantity: Number(prodForm.min_order_quantity) || 1,
      description: prodForm.description || null,
      images: [],
      delivery_available: selectedStore.delivery_available,
      active: true,
    };
    saveProduct.mutate(editingProductId ? { id: editingProductId, values } : { values });
    setEditingProductId(null);
    setProdForm({
      name: "",
      category_id: "",
      unit: "",
      price: "",
      compare_price: "",
      stock: "",
      min_order_quantity: "",
      description: "",
    });
  };

  return (
    <>
      <PageHeader
        title="Ma boutique"
        subtitle="Gérez votre vitrine, vos produits et vos commandes reçues"
        action={
          store ? (
            <Button onClick={() => openEdit(store)} variant="secondary" size="sm">
              <Pencil className="size-4" /> Modifier la boutique
            </Button>
          ) : (
            <Button onClick={openCreate} size="sm">
              <Plus className="size-4" /> Créer ma boutique
            </Button>
          )
        }
      />

      {!store && !creating ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <StoreIcon className="mb-3 size-8 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">Aucune boutique</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ouvrez une boutique pour vendre vos matériaux sur la plateforme : ciment, fer, agrégats,
            quincaillerie…
          </p>
          <Button className="mt-5" onClick={openCreate}>
            <Plus className="size-4" /> Créer ma boutique
          </Button>
        </div>
      ) : creating || editing ? (
        <StoreForm
          form={form}
          setForm={setForm}
          editing={editing}
          onSubmit={submitStore}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : (
        <>
          {myStores.length > 1 && (
            <Select value={selectedStore?.id ?? ""} onValueChange={(v) => setSelectedStoreId(v)}>
              <SelectTrigger className="mb-4 w-full sm:w-72">
                <SelectValue placeholder="Choisir une boutique" />
              </SelectTrigger>
              <SelectContent>
                {myStores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {store && (
            <div className="panel mb-5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">{store.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {[store.city, store.commune].filter(Boolean).join(" · ") || "Bénin"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {store.delivery_available && (
                    <span className="flex items-center gap-1 text-success">
                      <Truck className="size-4" /> Livraison
                    </span>
                  )}
                  {store.verified && <Badge variant="secondary">Vérifiée</Badge>}
                  <span className="num">{store.rating} ★</span>
                </div>
              </div>
              {store.description && (
                <p className="mt-2 text-sm text-muted-foreground">{store.description}</p>
              )}
            </div>
          )}

          <div className="mb-5">
            <StoreAnalytics storeId={selectedStore?.id ?? null} />
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <TopProducts analytics={analytics} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                  <Package className="size-4 text-primary" /> Produits
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingProductId(null);
                    setProdForm({
                      name: "",
                      category_id: "",
                      unit: "",
                      price: "",
                      compare_price: "",
                      stock: "",
                      min_order_quantity: "",
                      description: "",
                    });
                  }}
                >
                  <Plus className="size-4" /> Ajouter
                </Button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitProduct();
                }}
                className="mb-4 rounded-md border border-border p-3"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {editingProductId ? "Modifier le produit" : "Nouveau produit"}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="Nom du produit"
                    className="sm:col-span-2"
                  />
                  <Select
                    value={prodForm.category_id}
                    onValueChange={(v) => setProdForm({ ...prodForm, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={prodForm.unit}
                    onValueChange={(v) => setProdForm({ ...prodForm, unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    placeholder="Prix (FCFA)"
                    inputMode="numeric"
                  />
                  <Input
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    placeholder="Stock"
                    inputMode="numeric"
                  />
                  <Input
                    value={prodForm.min_order_quantity}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, min_order_quantity: e.target.value })
                    }
                    placeholder="Qté min de commande"
                    inputMode="numeric"
                  />
                  <Input
                    value={prodForm.compare_price}
                    onChange={(e) => setProdForm({ ...prodForm, compare_price: e.target.value })}
                    placeholder="Ancien prix (option)"
                    inputMode="numeric"
                    className="sm:col-span-2"
                  />
                  <Textarea
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="sm:col-span-2"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-1.5 text-xs text-primary"
                    onClick={() => {
                      if (!prodForm.name.trim()) return;
                      const cat =
                        categories.find((c) => c.id === prodForm.category_id)?.name ?? null;
                      setProdForm({
                        ...prodForm,
                        description: suggestProductDescription(
                          {
                            name: prodForm.name,
                            brand: null,
                            unit: prodForm.unit || null,
                            features: null,
                            warranty: null,
                          },
                          cat,
                        ),
                      });
                    }}
                  >
                    <Sparkles className="size-3.5" /> Générer une description IA
                  </Button>
                </div>
                <Button type="submit" size="sm" className="mt-2 w-full">
                  {editingProductId ? (
                    <>
                      <Pencil className="size-4" /> Enregistrer les modifications
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" /> Publier le produit
                    </>
                  )}
                </Button>
              </form>

              {products.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun produit pour l'instant.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {products.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2.5">
                      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary/60">
                        <Boxes className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {fcfa(p.price)}
                          {p.unit ? ` / ${labelOf(PRODUCT_UNITS, p.unit)}` : ""} · stock{" "}
                          {Number(p.stock)}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          Number(p.stock) > 0
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                            : "border-destructive bg-destructive/10 text-destructive",
                        )}
                        variant="outline"
                      >
                        {Number(p.stock) > 0 ? "Disponible" : "Rupture"}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEditProduct(p)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ProductMovement product={p} />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteProduct.mutate(p.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ReceivedOrders storeId={selectedStore?.id ?? null} />
          </div>
        </>
      )}
    </>
  );
}

function StoreForm({
  form,
  setForm,
  editing,
  onSubmit,
  onCancel,
}: {
  form: StoreFormState;
  setForm: (f: StoreFormState) => void;
  editing: Store | null;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="panel max-w-2xl p-5"
    >
      <h2 className="font-display text-lg font-semibold">
        {editing ? "Modifier ma boutique" : "Créer ma boutique"}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Nom de la boutique *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Quincaillerie La Référence"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Ville</Label>
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Cotonou"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Téléphone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+229"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Adresse</Label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Quartier, rue…"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Présentez votre boutique et vos spécialités…"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Zone de livraison</Label>
          <Input
            value={form.delivery_zone}
            onChange={(e) => setForm({ ...form, delivery_zone: e.target.value })}
            placeholder="Cotonou, Calavi…"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Rayon de livraison (km)</Label>
          <Input
            value={form.delivery_radius_km}
            onChange={(e) => setForm({ ...form, delivery_radius_km: e.target.value })}
            placeholder="ex. 10"
            inputMode="numeric"
            type="number"
            min="0"
            step="0.5"
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Switch
            checked={form.delivery_available}
            onCheckedChange={(v) => setForm({ ...form, delivery_available: v })}
            id="delivery-available"
          />
          <Label htmlFor="delivery-available" className="text-sm">
            Proposer la livraison
          </Label>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{editing ? "Enregistrer" : "Créer la boutique"}</Button>
      </div>
    </form>
  );
}

function ReceivedOrders({ storeId }: { storeId: string | null }) {
  const { data: orders = [] } = useOrders();
  const ordersForStore = useMemo(
    () => orders.filter((o) => !storeId || o.store_id === storeId),
    [orders, storeId],
  );

  return (
    <div className="panel p-4">
      <h3 className="flex items-center gap-2 font-display text-base font-semibold">
        <Truck className="size-4 text-primary" /> Commandes reçues
      </h3>
      {ordersForStore.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Aucune commande reçue pour l'instant.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {ordersForStore.map((o) => (
            <li key={o.id} className="py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold">
                  {o.reference ?? o.id.slice(0, 8)}
                </span>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(o.ordered_at).toLocaleString("fr-FR")}</span>
                <span className="num font-semibold text-primary">{fcfa(o.total)}</span>
              </div>
              {o.delivery_address && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  → {o.delivery_address}
                  {o.city ? `, ${o.city}` : ""}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
