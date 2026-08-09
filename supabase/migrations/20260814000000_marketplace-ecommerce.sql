-- Marketplace e-commerce : boutiques vendeurs, catalogue produits, panier,
-- commandes, livraisons et transporteurs (boucle particulier → chantier).

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('creee', 'paiement_en_attente', 'payee', 'preparation', 'prete', 'en_livraison', 'livree', 'annulee', 'remboursee', 'litige');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_status AS ENUM ('planifiee', 'en_attente_transporteur', 'en_livraison', 'livree', 'annulee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* ---------- Boutiques vendeurs ---------- */

CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  logo_path text,
  phone text,
  whatsapp text,
  email text,
  city text,
  commune text,
  address text,
  lat double precision,
  lng double precision,
  opening_hours text,
  description text,
  delivery_zone text,
  delivery_available boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  rating numeric(3, 2) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stores_active_city_idx ON public.stores (active, city);

/* ---------- Catalogue produits ---------- */

CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  parent_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_categories_parent_idx ON public.product_categories (parent_id, sort_order);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  brand text,
  reference text,
  description text,
  unit text,
  price numeric NOT NULL DEFAULT 0,
  compare_price numeric,
  min_order_quantity numeric NOT NULL DEFAULT 1,
  stock numeric NOT NULL DEFAULT 0,
  images text[] NOT NULL DEFAULT '{}',
  delivery_available boolean NOT NULL DEFAULT false,
  warranty text,
  features text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_store_idx ON public.products (store_id, name);
CREATE INDEX products_category_idx ON public.products (category_id);
CREATE INDEX products_active_idx ON public.products (active, price);

/* ---------- Panier ---------- */

CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX carts_user_idx ON public.carts (user_id);

CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX cart_items_cart_product_idx ON public.cart_items (cart_id, product_id);

/* ---------- Commandes ---------- */

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  reference text,
  status public.order_status NOT NULL DEFAULT 'creee',
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method public.payment_method,
  notes text,
  delivery_address text,
  city text,
  phone text,
  lat double precision,
  lng double precision,
  ordered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_user_idx ON public.orders (user_id, ordered_at DESC);
CREATE INDEX orders_store_idx ON public.orders (store_id, status);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  unit text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_items_order_idx ON public.order_items (order_id);

/* ---------- Transporteurs & véhicules ---------- */

CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  whatsapp text,
  city text,
  zone text,
  vehicle_type text,
  capacity numeric,
  price_per_km numeric NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  verified boolean NOT NULL DEFAULT false,
  rating numeric(3, 2) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX drivers_city_available_idx ON public.drivers (city, available);

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.drivers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate text,
  type text,
  capacity numeric,
  photo_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX vehicles_driver_idx ON public.vehicles (driver_id);

/* ---------- Livraisons ---------- */

CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.delivery_status NOT NULL DEFAULT 'planifiee',
  scheduled_at timestamptz,
  from_address text,
  to_address text,
  lat double precision,
  lng double precision,
  phone text,
  weight numeric,
  fee numeric NOT NULL DEFAULT 0,
  proof_photo text,
  signature_path text,
  confirmation_code text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX deliveries_order_idx ON public.deliveries (order_id);
CREATE INDEX deliveries_driver_idx ON public.deliveries (driver_id, status);

/* ---------- RLS ---------- */

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;

CREATE POLICY "stores read all" ON public.stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "stores insert own" ON public.stores FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "stores update own" ON public.stores FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "stores delete own" ON public.stores FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO service_role;

CREATE POLICY "product_categories read all" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "product_categories insert admin" ON public.product_categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "product_categories update admin" ON public.product_categories FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "product_categories delete admin" ON public.product_categories FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

CREATE POLICY "products read all" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products insert store owner" ON public.products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()));
CREATE POLICY "products update store owner" ON public.products FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()));
CREATE POLICY "products delete store owner" ON public.products FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()));

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;

CREATE POLICY "carts owner" ON public.carts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "carts insert own" ON public.carts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "carts update own" ON public.carts FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "carts delete own" ON public.carts FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;

CREATE POLICY "cart_items read own cart" ON public.cart_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid()));
CREATE POLICY "cart_items insert own cart" ON public.cart_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid()));
CREATE POLICY "cart_items update own cart" ON public.cart_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid()));
CREATE POLICY "cart_items delete own cart" ON public.cart_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid()));

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

CREATE POLICY "orders read buyer or seller" ON public.orders FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid())
  );
CREATE POLICY "orders insert buyer" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders update buyer or seller" ON public.orders FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid())
  );
CREATE POLICY "orders delete buyer" ON public.orders FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

CREATE POLICY "order_items read order participant" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = o.store_id AND s.user_id = auth.uid()))));
CREATE POLICY "order_items insert own order" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;

CREATE POLICY "drivers read all" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "drivers insert own" ON public.drivers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "drivers update own" ON public.drivers FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "drivers delete own" ON public.drivers FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;

CREATE POLICY "vehicles read all" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicles insert own" ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "vehicles update own" ON public.vehicles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "vehicles delete own" ON public.vehicles FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;

CREATE POLICY "deliveries read participant" ON public.deliveries FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
      AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = o.store_id AND s.user_id = auth.uid())))
    OR EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND d.user_id = auth.uid())
  );
CREATE POLICY "deliveries insert own" ON public.deliveries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "deliveries update participant" ON public.deliveries FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
      AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = o.store_id AND s.user_id = auth.uid())))
    OR EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND d.user_id = auth.uid())
  );
CREATE POLICY "deliveries delete own" ON public.deliveries FOR DELETE TO authenticated
  USING (user_id = auth.uid());
