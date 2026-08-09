-- Vague 2 — E-commerce avancé.
-- Historique des prix (product_prices) + mouvements de stock (product_inventory).
-- Lat/lng des boutiques (déjà présents dans stores) servent au comparateur "près de moi".

/* ---------- Historique des prix ---------- */

CREATE TABLE public.product_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price numeric(12,2) NOT NULL,
  compare_price numeric(12,2),
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE INDEX product_prices_product_idx ON public.product_prices (product_id, changed_at DESC);

/* ---------- Mouvements de stock ---------- */

CREATE TABLE public.product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_delta integer NOT NULL,
  reason text NOT NULL DEFAULT 'adjustment' CHECK (reason IN (
    'stock_init', 'sale', 'restock', 'adjustment', 'return', 'cancellation'
  )),
  note text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_inventory_product_idx ON public.product_inventory (product_id, created_at DESC);

/* ---------- RLS ---------- */

-- product_prices : lisible par tous les utilisateurs authentifiés (transparence
-- des prix), écriture réservée au propriétaire du produit ou à un admin.
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_prices TO authenticated;
GRANT ALL ON public.product_prices TO service_role;

CREATE POLICY "product_prices read all" ON public.product_prices FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "product_prices write owner" ON public.product_prices FOR INSERT TO authenticated
  WITH CHECK (changed_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "product_prices update owner" ON public.product_prices FOR UPDATE TO authenticated
  USING (changed_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "product_prices delete owner" ON public.product_prices FOR DELETE TO authenticated
  USING (changed_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));

-- product_inventory : mouvement de stock, réservé au propriétaire du produit / admin.
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_inventory TO authenticated;
GRANT ALL ON public.product_inventory TO service_role;

CREATE POLICY "product_inventory read owner" ON public.product_inventory FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "product_inventory write owner" ON public.product_inventory FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "product_inventory update owner" ON public.product_inventory FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "product_inventory delete owner" ON public.product_inventory FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));

/* ---------- Trigger : journalise le changement de prix sur products ---------- */

CREATE OR REPLACE FUNCTION public.track_product_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.price IS DISTINCT FROM OLD.price OR NEW.compare_price IS DISTINCT FROM OLD.compare_price THEN
    INSERT INTO public.product_prices (product_id, price, compare_price, changed_by, note)
    VALUES (NEW.id, NEW.price, NEW.compare_price, auth.uid(), 'mise à jour');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS product_prices_after_update ON public.products;
CREATE TRIGGER product_prices_after_update
  AFTER UPDATE OF price, compare_price ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.track_product_price_change();
