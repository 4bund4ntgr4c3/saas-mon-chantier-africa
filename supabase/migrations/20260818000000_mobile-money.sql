-- Vague 4 — Paiement mobile money (sandbox).
-- Transactions de paiement par mobile money (MTN MoMo / Moov Money / autres passerelles),
-- enrichissement de payments (provider, transaction_id, statut) et des commandes.

/* ---------- Enums ---------- */

DO $$ BEGIN
  CREATE TYPE public.payment_provider AS ENUM (
    'mtn_momo', 'moov_money', 'paydunya', 'bankly', 'cmi', 'paystack'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_transaction_status AS ENUM (
    'initiee', 'en_attente', 'confirmee', 'echouee', 'annulee'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* ---------- Table des transactions ---------- */

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  provider public.payment_provider NOT NULL DEFAULT 'mtn_momo',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XOF',
  phone text,
  status public.payment_transaction_status NOT NULL DEFAULT 'initiee',
  reference text,
  transaction_id text,
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_transactions_user_idx
  ON public.payment_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_transactions_project_idx
  ON public.payment_transactions (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_transactions_order_idx
  ON public.payment_transactions (order_id);
CREATE INDEX IF NOT EXISTS payment_transactions_status_idx
  ON public.payment_transactions (status);

/* ---------- Enrichissement des paiements chantier ---------- */

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider public.payment_provider;
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS status public.payment_transaction_status NOT NULL DEFAULT 'confirmee';

/* ---------- Enrichissement des commandes marketplace ---------- */

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'en_attente';

/* ---------- RLS ---------- */

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;

CREATE POLICY "payment_transactions read own" ON public.payment_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "payment_transactions insert own" ON public.payment_transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "payment_transactions update own" ON public.payment_transactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "payment_transactions delete own" ON public.payment_transactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

/* ---------- Trigger : updated_at ---------- */

CREATE OR REPLACE FUNCTION public.touch_payment_transaction()
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

DROP TRIGGER IF EXISTS payment_transactions_touch ON public.payment_transactions;
CREATE TRIGGER payment_transactions_touch
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_payment_transaction();

/* ---------- Lien de paiement public (partage WhatsApp) ---------- */

CREATE OR REPLACE FUNCTION public.get_payment_link_order(p_reference text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'order', to_jsonb(o),
    'items', COALESCE((SELECT jsonb_agg(to_jsonb(oit)) FROM public.order_items oit WHERE oit.order_id = o.id), '[]'::jsonb),
    'store', COALESCE((SELECT jsonb_build_object('id', s.id, 'name', s.name) FROM public.stores s WHERE s.id = o.store_id), '{}'::jsonb)
  )
  INTO _result
  FROM public.orders o
  WHERE o.reference = p_reference;
  RETURN _result;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_payment_link_order(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_link_order(text) TO anon, authenticated;
