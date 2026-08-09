-- Vague 5 — Demande de devis (quote_requests) et offres des prestataires (quote_bids).
-- Un particulier décrit un besoin (budget, localisation, catégorie) ;
-- les prestataires répondent avec une offre chiffrée, puis le demandeur compare et attribue.

/* ---------- Demandes de devis ---------- */

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  city text,
  commune text,
  deadline date,
  status text NOT NULL DEFAULT 'ouverte',
  winner_bid_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_requests_user_idx
  ON public.quote_requests (user_id);
CREATE INDEX IF NOT EXISTS quote_requests_status_idx
  ON public.quote_requests (status);

/* ---------- Offres des prestataires ---------- */

CREATE TABLE IF NOT EXISTS public.quote_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  message text,
  status text NOT NULL DEFAULT 'soumise',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_bids_request_idx
  ON public.quote_bids (request_id);
CREATE INDEX IF NOT EXISTS quote_bids_user_idx
  ON public.quote_bids (user_id);

-- Le devis gagnant référencé sur la demande.
ALTER TABLE public.quote_requests
  ADD CONSTRAINT quote_requests_winner_bid_fkey
  FOREIGN KEY (winner_bid_id) REFERENCES public.quote_bids(id) ON DELETE SET NULL;

/* ---------- RLS ---------- */

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_bids ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_bids TO authenticated;
GRANT ALL ON public.quote_bids TO service_role;

-- Demandes : lisibles par tous les connectés (les prestataires doivent pouvoir répondre),
-- modifiables uniquement par leur propriétaire.
CREATE POLICY "quote_requests read all" ON public.quote_requests FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "quote_requests insert own" ON public.quote_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "quote_requests update own" ON public.quote_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "quote_requests delete own" ON public.quote_requests FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Offres : lisibles par le propriétaire de la demande et par leur auteur ;
-- écriture réservée à l'auteur.
CREATE POLICY "quote_bids read owner or author" ON public.quote_bids FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.quote_requests qr
      WHERE qr.id = quote_bids.request_id AND qr.user_id = auth.uid()
    )
  );
CREATE POLICY "quote_bids insert own" ON public.quote_bids FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "quote_bids update own" ON public.quote_bids FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "quote_bids delete own" ON public.quote_bids FOR DELETE TO authenticated
  USING (user_id = auth.uid());

/* ---------- Trigger : updated_at ---------- */

CREATE OR REPLACE FUNCTION public.touch_quote_request()
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

DROP TRIGGER IF EXISTS quote_requests_touch ON public.quote_requests;
CREATE TRIGGER quote_requests_touch
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_quote_request();

CREATE OR REPLACE FUNCTION public.touch_quote_bid()
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

DROP TRIGGER IF EXISTS quote_bids_touch ON public.quote_bids;
CREATE TRIGGER quote_bids_touch
  BEFORE UPDATE ON public.quote_bids
  FOR EACH ROW EXECUTE FUNCTION public.touch_quote_bid();
