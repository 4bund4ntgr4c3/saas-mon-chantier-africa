-- Extension des types de compte : artisans, quincailleries, transporteurs,
-- promoteurs immobiliers (POSITIONNEMENT écosystème complet du prompt).

-- L'ALTER TYPE doit être exécuté hors transaction bloquante sur PostgreSQL ;
-- chaque valeur est ajoutée indépendamment pour être idempotent.

ALTER TYPE public.account_type ADD VALUE IF NOT EXISTS 'artisan';
ALTER TYPE public.account_type ADD VALUE IF NOT EXISTS 'quincaillerie';
ALTER TYPE public.account_type ADD VALUE IF NOT EXISTS 'transporteur';
ALTER TYPE public.account_type ADD VALUE IF NOT EXISTS 'promoteur';

/* ---------- Vérification des profils professionnels ---------- */

CREATE TABLE public.profile_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'non_verifie',
  verified_identity boolean NOT NULL DEFAULT false,
  verified_business boolean NOT NULL DEFAULT false,
  verified_documents boolean NOT NULL DEFAULT false,
  premium boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX profile_verifications_user_idx ON public.profile_verifications (user_id);

ALTER TABLE public.profile_verifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_verifications TO authenticated;
GRANT ALL ON public.profile_verifications TO service_role;

-- Visible par tous les utilisateurs connectés (badge de confiance sur le marketplace) ;
-- modifiable uniquement par son propriétaire ou un administrateur.
CREATE POLICY "profile_verifications read all" ON public.profile_verifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "profile_verifications insert own" ON public.profile_verifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "profile_verifications update own" ON public.profile_verifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "profile_verifications delete own" ON public.profile_verifications FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
