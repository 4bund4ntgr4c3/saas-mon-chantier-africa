-- Nouvelles fonctionnalités : facturation client, stock/matériaux, photos de chantier,
-- tâches & planning, et partage lecture seule d'un chantier.

DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM ('emise', 'partielle', 'payee', 'annulee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('a_faire', 'en_cours', 'terminee', 'annulee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.task_priority AS ENUM ('basse', 'moyenne', 'haute');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* ---------- Facturation client ---------- */

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reference text,
  title text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status public.invoice_status NOT NULL DEFAULT 'emise',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invoices_project_idx ON public.invoices (project_id, invoice_date DESC);

CREATE TABLE public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  method public.payment_method NOT NULL DEFAULT 'especes',
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invoice_payments_invoice_idx ON public.invoice_payments (invoice_id, payment_date DESC);

/* ---------- Stock / matériaux ---------- */

CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  quantity numeric NOT NULL DEFAULT 0,
  unit text,
  unit_price numeric NOT NULL DEFAULT 0,
  reorder_level numeric NOT NULL DEFAULT 0,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX materials_project_idx ON public.materials (project_id, name);

/* ---------- Photos de chantier ---------- */

CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  phase text,
  file_path text NOT NULL,
  caption text,
  taken_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX photos_project_phase_idx ON public.photos (project_id, phase, created_at DESC);

/* ---------- Tâches & planning ---------- */

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status public.task_status NOT NULL DEFAULT 'a_faire',
  priority public.task_priority NOT NULL DEFAULT 'moyenne',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_project_status_idx ON public.tasks (project_id, status, due_date);

/* ---------- Partage lecture seule ---------- */

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS share_token uuid;
CREATE UNIQUE INDEX IF NOT EXISTS projects_share_token_idx ON public.projects (share_token) WHERE share_token IS NOT NULL;

/* ---------- RLS ---------- */

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;

CREATE POLICY "invoices read own" ON public.invoices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "invoices insert own" ON public.invoices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "invoices update own" ON public.invoices FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "invoices delete own" ON public.invoices FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_payments TO authenticated;
GRANT ALL ON public.invoice_payments TO service_role;

CREATE POLICY "invoice_payments read own" ON public.invoice_payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "invoice_payments insert own" ON public.invoice_payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "invoice_payments update own" ON public.invoice_payments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "invoice_payments delete own" ON public.invoice_payments FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;

CREATE POLICY "materials read own" ON public.materials FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "materials insert own" ON public.materials FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "materials update own" ON public.materials FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "materials delete own" ON public.materials FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT ALL ON public.photos TO service_role;

CREATE POLICY "photos read own" ON public.photos FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "photos insert own" ON public.photos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "photos update own" ON public.photos FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "photos delete own" ON public.photos FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;

CREATE POLICY "tasks read own" ON public.tasks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tasks insert own" ON public.tasks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "tasks update own" ON public.tasks FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tasks delete own" ON public.tasks FOR DELETE TO authenticated USING (user_id = auth.uid());

/* ---------- Lecture publique d'un chantier partagé (token) ---------- */

CREATE OR REPLACE FUNCTION public.get_shared_project(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _project jsonb;
  _pid uuid;
BEGIN
  SELECT p.id INTO _pid FROM public.projects p WHERE p.share_token = p_token;
  IF _pid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'project', to_jsonb(p),
    'categories', COALESCE((SELECT jsonb_agg(to_jsonb(c)) FROM public.categories c), '[]'::jsonb),
    'budget_lines', COALESCE((SELECT jsonb_agg(to_jsonb(bl)) FROM public.budget_lines bl WHERE bl.project_id = _pid), '[]'::jsonb),
    'expenses', COALESCE((SELECT jsonb_agg(jsonb_build_object('category_id', e.category_id, 'expense_date', e.expense_date, 'label', e.label, 'amount', e.amount, 'created_at', e.created_at) ORDER BY e.expense_date DESC) FROM public.expenses e WHERE e.project_id = _pid LIMIT 200), '[]'::jsonb),
    'site_logs', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', s.id, 'title', s.title, 'log_date', s.log_date, 'progress', s.progress, 'weather', s.weather, 'comment', s.comment, 'difficulties', s.difficulties, 'category_id', s.category_id, 'created_at', s.created_at) ORDER BY s.log_date DESC) FROM public.site_logs s WHERE s.project_id = _pid), '[]'::jsonb),
    'photos', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', ph.id, 'file_path', ph.file_path, 'caption', ph.caption, 'phase', ph.phase, 'category_id', ph.category_id, 'created_at', ph.created_at) ORDER BY ph.created_at DESC) FROM public.photos ph WHERE ph.project_id = _pid), '[]'::jsonb)
  )
  INTO _project
  FROM public.projects p
  WHERE p.id = _pid;

  RETURN _project;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_shared_project(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_project(uuid) TO anon, authenticated;