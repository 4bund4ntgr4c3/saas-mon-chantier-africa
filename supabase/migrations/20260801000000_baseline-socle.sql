-- ============================================================================
-- BASELINE socle historique — tables créées hors migrations sur le projet
-- d'origine. Reconstitué depuis les types générés (src/integrations/supabase/
-- types.ts) et les usages applicatifs, pour un déploiement sur projet vierge.
--
-- Idempotent : CREATE IF NOT EXISTS / OR REPLACE partout. Les migrations
-- ultérieures (ADD COLUMN IF NOT EXISTS, CREATE TYPE sous garde DO $$,
-- CREATE OR REPLACE FUNCTION) deviennent des no-op sur ce qu'elle couvre.
--
-- Choix documentés (originaux inconnus) :
--   * FK projet -> ON DELETE CASCADE ; FK annexes (fournisseur, entreprise,
--     catégorie, dépense) -> ON DELETE SET NULL (pas de blocage de suppression).
--   * RLS "propriétaire + admin" partout (motif du repo), lecture globale des
--     catégories standards, profils lisibles par soi / admin / collaborateurs.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* ---------------- Enums socles (gardés, comme le reste du repo) ---------------- */

DO $$ BEGIN
  CREATE TYPE public.account_type AS ENUM ('particulier', 'maitre_oeuvre', 'entreprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('planifie', 'en_cours', 'suspendu', 'termine');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('especes', 'mtn_momo', 'moov_money', 'virement', 'cheque');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_type AS ENUM ('comptant', 'acompte', 'partiel', 'solde');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

DO $$ BEGIN
  CREATE TYPE public.quote_status AS ENUM ('en_attente', 'accepte', 'rejete', 'converti');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Valeurs d'origine ('nouveau' renommé en 'nouvelle', 'refusee' ajouté,
-- 'planifie'/'archive' retirés par 20260809000000).
DO $$ BEGIN
  CREATE TYPE public.demo_request_status AS ENUM (
    'nouveau', 'contacte', 'traite', 'planifie', 'archive'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* ---------------- Tables ---------------- */

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type public.account_type NOT NULL DEFAULT 'particulier',
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  phase text NOT NULL DEFAULT 'Divers',
  sort_order integer NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS categories_global_slug_uidx
  ON public.categories (slug) WHERE user_id IS NULL;

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  arrondissement text,
  quartier text,
  commune text,
  city text,
  lat double precision,
  lng double precision,
  land_area numeric,
  built_area numeric,
  levels integer,
  house_type text,
  budget numeric(14,2) NOT NULL DEFAULT 0,
  status public.project_status NOT NULL DEFAULT 'en_cours',
  start_date date,
  end_date date,
  share_token uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  trade text,
  manager text,
  phone text,
  email text,
  contract_ref text,
  contract_amount numeric(14,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  activity text,
  phone text,
  whatsapp text,
  email text,
  commune text,
  city text,
  products text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  label text NOT NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  quantity numeric,
  unit_price numeric(14,2),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  method public.payment_method NOT NULL DEFAULT 'especes',
  reference text,
  city text,
  commune text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  expense_id uuid REFERENCES public.expenses(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  kind public.payment_type NOT NULL DEFAULT 'comptant',
  method public.payment_method NOT NULL DEFAULT 'especes',
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  phone text,
  provider public.payment_provider,
  transaction_id text,
  status public.payment_transaction_status NOT NULL DEFAULT 'confirmee',
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  label text NOT NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  status public.quote_status NOT NULL DEFAULT 'en_attente',
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  progress integer NOT NULL DEFAULT 0,
  workers integer,
  weather text,
  comment text,
  difficulties text,
  photos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budget_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  planned_amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  company text,
  message text,
  status public.demo_request_status NOT NULL DEFAULT 'nouvelle',
  admin_notes text,
  follow_up_date date,
  attachment_name text,
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

/* ---------------- Index ---------------- */

CREATE INDEX IF NOT EXISTS profiles_account_type_idx ON public.profiles (account_type);
CREATE INDEX IF NOT EXISTS user_roles_user_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS projects_user_idx ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS expenses_project_idx ON public.expenses (project_id);
CREATE INDEX IF NOT EXISTS expenses_user_idx ON public.expenses (user_id);
CREATE INDEX IF NOT EXISTS payments_project_idx ON public.payments (project_id);
CREATE INDEX IF NOT EXISTS payments_user_idx ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS quotes_project_idx ON public.quotes (project_id);
CREATE INDEX IF NOT EXISTS site_logs_project_idx ON public.site_logs (project_id, log_date DESC);
CREATE INDEX IF NOT EXISTS budget_lines_project_idx ON public.budget_lines (project_id);
CREATE INDEX IF NOT EXISTS companies_user_idx ON public.companies (user_id);
CREATE INDEX IF NOT EXISTS suppliers_user_idx ON public.suppliers (user_id);

/* ---------------- Droits + RLS ---------------- */

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_requests TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.projects TO service_role;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.suppliers TO service_role;
GRANT ALL ON public.expenses TO service_role;
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.quotes TO service_role;
GRANT ALL ON public.site_logs TO service_role;
GRANT ALL ON public.budget_lines TO service_role;
GRANT ALL ON public.demo_requests TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

/* Profils : soi-même + admin. Élargi aux collaborateurs par
   20260815000001 (project_members n'existe pas encore ici). */
CREATE POLICY "profiles read scope" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles delete admin" ON public.profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

/* Rôles : lecture soi + admin (back-office), écriture admin (le trigger contourne la RLS). */
CREATE POLICY "user_roles read scope" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "user_roles write admin" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "user_roles update admin" ON public.user_roles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "user_roles delete admin" ON public.user_roles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

/* Catégories : référentiel global lisible, écriture propriétaire + admin. */
CREATE POLICY "categories read all" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories insert own" ON public.categories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "categories update own" ON public.categories FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "categories delete own" ON public.categories FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

/* Données chantier : propriétaire + admin (motif du repo). */
CREATE POLICY "projects crud own" ON public.projects FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "projects insert own" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "projects update own" ON public.projects FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "projects delete own" ON public.projects FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "companies crud own" ON public.companies FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "companies insert own" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "companies update own" ON public.companies FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "companies delete own" ON public.companies FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "suppliers crud own" ON public.suppliers FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "suppliers insert own" ON public.suppliers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "suppliers update own" ON public.suppliers FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "suppliers delete own" ON public.suppliers FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "expenses crud own" ON public.expenses FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "expenses insert own" ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "expenses update own" ON public.expenses FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "expenses delete own" ON public.expenses FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "payments crud own" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "payments insert own" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "payments update own" ON public.payments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "payments delete own" ON public.payments FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "quotes crud own" ON public.quotes FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "quotes insert own" ON public.quotes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "quotes update own" ON public.quotes FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "quotes delete own" ON public.quotes FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "site_logs crud own" ON public.site_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "site_logs insert own" ON public.site_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "site_logs update own" ON public.site_logs FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "site_logs delete own" ON public.site_logs FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "budget_lines crud own" ON public.budget_lines FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "budget_lines insert own" ON public.budget_lines FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "budget_lines update own" ON public.budget_lines FOR UPDATE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "budget_lines delete own" ON public.budget_lines FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

/* Demandes de démo : back-office admin (la soumission passe par la server function). */
CREATE POLICY "demo_requests read admin" ON public.demo_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "demo_requests insert admin" ON public.demo_requests FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "demo_requests update admin" ON public.demo_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "demo_requests delete admin" ON public.demo_requests FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

/* ---------------- Seed démo à l'inscription ---------------- */

CREATE OR REPLACE FUNCTION public.seed_demo_data(_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project uuid;
BEGIN
  -- Référentiel global des postes de dépenses (Bénin), une seule fois.
  INSERT INTO public.categories (name, slug, phase, sort_order, user_id) VALUES
    ('Terrassement', 'terrassement', 'Gros œuvre', 0, NULL),
    ('Fondation', 'fondation', 'Gros œuvre', 1, NULL),
    ('Élévation des murs', 'elevation-murs', 'Gros œuvre', 2, NULL),
    ('Dalle / Plancher', 'dalle-plancher', 'Gros œuvre', 3, NULL),
    ('Charpente & toiture', 'charpente-toiture', 'Gros œuvre', 4, NULL),
    ('Électricité', 'electricite', 'Second œuvre', 5, NULL),
    ('Plomberie', 'plomberie', 'Second œuvre', 6, NULL),
    ('Carrelage', 'carrelage', 'Finitions', 7, NULL),
    ('Peinture', 'peinture', 'Finitions', 8, NULL),
    ('Main d''œuvre', 'main-doeuvre', 'Divers', 9, NULL)
  ON CONFLICT (slug) WHERE user_id IS NULL DO NOTHING;

  -- Un chantier témoin par compte (jamais de doublon).
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE user_id = _user) THEN
    INSERT INTO public.projects (user_id, name, city, commune, status, budget)
    VALUES (_user, 'Villa témoin (démo)', 'Abomey-Calavi', 'Abomey-Calavi', 'en_cours', 0)
    RETURNING id INTO _project;

    INSERT INTO public.budget_lines (user_id, project_id, category_id, planned_amount)
    SELECT _user, _project, c.id, 0
    FROM public.categories c
    WHERE c.user_id IS NULL;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_demo_data(uuid) FROM PUBLIC, anon, authenticated;

/* ---------------- Profil + admin + seed à l'inscription ---------------- */

-- Même corps que 20260807213051 (qui le remplace à l'identique ensuite).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _type public.account_type;
BEGIN
  BEGIN
    _type := COALESCE((new.raw_user_meta_data->>'account_type')::public.account_type, 'particulier');
  EXCEPTION WHEN others THEN
    _type := 'particulier';
  END;

  INSERT INTO public.profiles (id, full_name, phone, account_type)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', _type);

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin');
  END IF;

  PERFORM public.seed_demo_data(new.id);

  RETURN new;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
