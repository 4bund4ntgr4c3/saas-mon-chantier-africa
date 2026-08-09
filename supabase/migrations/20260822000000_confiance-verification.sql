-- Vague 6 — Confiance & vérification.
-- 1. Soumission de documents + validation admin (complète profile_verifications).
-- 2. Avis étendus : vendeurs (stores), produits (products), transporteurs (drivers).
-- 3. Avis vérifiés (achat réel) + lutte anti-faux avis (1 avis max/user/cible).
-- L'agrégation des notes moyennes reste gérée en couche applicative (lib/data.ts),
-- cohérent avec le flux existant des avis prestataires.

/* ---------- Workflow de soumission de documents ---------- */

DO $$ BEGIN
  CREATE TYPE public.verification_doc_type AS ENUM ('identite', 'rccm', 'patente', 'cnps', 'quittance', 'permis', 'diplome');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('en_attente', 'approuve', 'rejete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type public.verification_doc_type NOT NULL DEFAULT 'identite',
  file_path text,
  note text,
  status public.verification_status NOT NULL DEFAULT 'en_attente',
  admin_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX verification_documents_user_idx ON public.verification_documents (user_id, created_at DESC);
CREATE INDEX verification_documents_status_idx ON public.verification_documents (status, created_at);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_documents TO authenticated;
GRANT ALL ON public.verification_documents TO service_role;

-- Profil visible par tous (badge de confiance) ; documents visibles par leur
-- propriétaire et les admins, modifiables par leur propriétaire ou un admin.
CREATE POLICY "verification_documents read own or admin" ON public.verification_documents FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "verification_documents insert own" ON public.verification_documents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "verification_documents update own or admin" ON public.verification_documents FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "verification_documents delete own or admin" ON public.verification_documents FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

/* ---------- Avis étendus : vendeurs · produits · transporteurs ---------- */

DO $$ BEGIN
  CREATE TYPE public.review_target AS ENUM ('store', 'product', 'driver');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- target_id pointe vers public.stores / public.products / public.drivers selon target_type.
-- La contrainte UNIQUE (user_id, target_type, target_id) empêche les doublons : 1 avis max
-- par utilisateur et par cible (lutte anti-faux avis).
CREATE TABLE public.market_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type public.review_target NOT NULL,
  target_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX market_reviews_target_idx ON public.market_reviews (target_type, target_id, created_at DESC);

ALTER TABLE public.market_reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_reviews TO authenticated;
GRANT ALL ON public.market_reviews TO service_role;

CREATE POLICY "market_reviews read all" ON public.market_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "market_reviews insert own" ON public.market_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "market_reviews update own" ON public.market_reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "market_reviews delete own" ON public.market_reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid());

/* ---------- Avis prestataires : flag "avis vérifié" + anti-doublon ---------- */

ALTER TABLE public.provider_reviews ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TABLE public.provider_reviews ADD CONSTRAINT provider_reviews_user_provider_key UNIQUE (user_id, provider_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* ---------- Produits : colonnes de notation pour les avis ---------- */

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric(3, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count int NOT NULL DEFAULT 0;