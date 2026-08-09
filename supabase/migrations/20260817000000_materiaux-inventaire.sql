-- Vague 3 — Matériaux & inventaire chantier.
-- Besoins en matériaux (prévu / commandé / livré / consommé / restant)
-- et livraisons de matériaux liées au chantier.

/* ---------- Besoins en matériaux ---------- */

CREATE TABLE public.material_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  unit text,
  quantity_needed numeric(12,2) NOT NULL DEFAULT 0,
  quantity_ordered numeric(12,2) NOT NULL DEFAULT 0,
  quantity_delivered numeric(12,2) NOT NULL DEFAULT 0,
  quantity_consumed numeric(12,2) NOT NULL DEFAULT 0,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'besoin' CHECK (status IN ('besoin', 'commande', 'partiel', 'livre', 'termine')),
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX material_requirements_project_idx ON public.material_requirements (project_id, name);
CREATE INDEX material_requirements_supplier_idx ON public.material_requirements (supplier_id);

/* ---------- Livraisons de matériaux ---------- */

CREATE TABLE public.material_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES public.material_requirements(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 0,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  delivered_at date,
  status text NOT NULL DEFAULT 'planifiee' CHECK (status IN ('planifiee', 'en_route', 'livree', 'partielle', 'annulee')),
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX material_deliveries_project_idx ON public.material_deliveries (project_id, delivered_at DESC);
CREATE INDEX material_deliveries_requirement_idx ON public.material_deliveries (requirement_id);

/* ---------- RLS ---------- */

-- material_requirements : propriétaire uniquement (lecture/écriture).
ALTER TABLE public.material_requirements ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_requirements TO authenticated;
GRANT ALL ON public.material_requirements TO service_role;

CREATE POLICY "material_requirements read own" ON public.material_requirements FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "material_requirements insert own" ON public.material_requirements FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "material_requirements update own" ON public.material_requirements FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "material_requirements delete own" ON public.material_requirements FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));

-- material_deliveries : propriétaire uniquement (lecture/écriture).
ALTER TABLE public.material_deliveries ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_deliveries TO authenticated;
GRANT ALL ON public.material_deliveries TO service_role;

CREATE POLICY "material_deliveries read own" ON public.material_deliveries FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "material_deliveries insert own" ON public.material_deliveries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "material_deliveries update own" ON public.material_deliveries FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "material_deliveries delete own" ON public.material_deliveries FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
