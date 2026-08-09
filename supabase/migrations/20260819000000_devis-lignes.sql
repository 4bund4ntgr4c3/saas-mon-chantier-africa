-- Vague 5 — Lignes de devis (quote_items) et de factures (invoice_items).
-- Permet de détailler un devis en lignes (désignation, quantité, prix unitaire)
-- et une facture en postes, pour un suivi plus précis des offres.

/* ---------- Lignes de devis ---------- */

CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  designation text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit text,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_items_quote_idx
  ON public.quote_items (quote_id);
CREATE INDEX IF NOT EXISTS quote_items_user_idx
  ON public.quote_items (user_id);

/* ---------- Lignes de facture ---------- */

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  designation text NOT NULL,
  quantity text NOT NULL DEFAULT '1',
  unit text,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoice_items_invoice_idx
  ON public.invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS invoice_items_user_idx
  ON public.invoice_items (user_id);

/* ---------- RLS ---------- */

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_items TO authenticated;
GRANT ALL ON public.quote_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;

CREATE POLICY "quote_items read own" ON public.quote_items FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "quote_items insert own" ON public.quote_items FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "quote_items update own" ON public.quote_items FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "quote_items delete own" ON public.quote_items FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "invoice_items read own" ON public.invoice_items FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "invoice_items insert own" ON public.invoice_items FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "invoice_items update own" ON public.invoice_items FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "invoice_items delete own" ON public.invoice_items FOR DELETE TO authenticated
  USING (user_id = auth.uid());

/* ---------- Trigger : updated_at ---------- */

CREATE OR REPLACE FUNCTION public.touch_quote_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quote_items_touch ON public.quote_items;
CREATE TRIGGER quote_items_touch
  BEFORE UPDATE ON public.quote_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_quote_item();

CREATE OR REPLACE FUNCTION public.touch_invoice_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoice_items_touch ON public.invoice_items;
CREATE TRIGGER invoice_items_touch
  BEFORE UPDATE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_invoice_item();