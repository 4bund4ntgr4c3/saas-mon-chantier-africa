-- Marketplace : annuaire de prestataires de services certifiés.
-- Chaque prestataire est visible par tous les utilisateurs connectés ;
-- son propriétaire peut le modifier ou le supprimer.

CREATE TABLE public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_name text,
  category text,
  services text,
  certifications text,
  years_experience int,
  phone text,
  whatsapp text,
  email text,
  website text,
  city text,
  commune text,
  rating numeric(3, 2) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX providers_category_idx ON public.providers (category);
CREATE INDEX providers_verified_rating_idx ON public.providers (verified DESC, rating DESC);

CREATE TABLE public.provider_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX provider_reviews_provider_idx ON public.provider_reviews (provider_id, created_at DESC);

/* ---------- RLS ---------- */

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.providers TO authenticated;
GRANT ALL ON public.providers TO service_role;

CREATE POLICY "providers read all" ON public.providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "providers insert own" ON public.providers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "providers update own" ON public.providers FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "providers delete own" ON public.providers FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_reviews TO authenticated;
GRANT ALL ON public.provider_reviews TO service_role;

CREATE POLICY "provider_reviews read all" ON public.provider_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "provider_reviews insert own" ON public.provider_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "provider_reviews delete own" ON public.provider_reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid());
