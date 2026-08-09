-- Vague 1 — Socle collaboration & multi-tenant.
-- Permet à plusieurs comptes de collaborer sur des organisations et chantiers.

/* ---------- Organisations ---------- */

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX organization_members_org_idx ON public.organization_members (organization_id);
CREATE INDEX organization_members_user_idx ON public.organization_members (user_id);

/* ---------- Membres d'un chantier ---------- */

CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id),
  UNIQUE (project_id, email)
);

CREATE INDEX project_members_project_idx ON public.project_members (project_id);
CREATE INDEX project_members_user_idx ON public.project_members (user_id);
CREATE INDEX project_members_email_idx ON public.project_members (email);

/* ---------- RLS ---------- */

-- Organizations : visible par ses membres, modifiable par ses membres.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

CREATE POLICY "organizations read members" ON public.organizations FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = id AND m.user_id = auth.uid()
  ));
CREATE POLICY "organizations insert owner" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "organizations update members" ON public.organizations FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = id AND m.user_id = auth.uid()
  ));
CREATE POLICY "organizations delete owner" ON public.organizations FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- organization_members : lisible par les membres de l'organisation, gérable par
-- le propriétaire ou un administrateur.
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;

CREATE POLICY "org_members read members" ON public.organization_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organization_id AND m.user_id = auth.uid()
  ));
CREATE POLICY "org_members insert member" ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_id AND o.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "org_members update member" ON public.organization_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_id AND o.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "org_members delete member" ON public.organization_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_id AND o.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));

-- project_members : lisible par tous les participants, gérable par le
-- propriétaire du chantier (projets.user_id) ou un administrateur.
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;

CREATE POLICY "project_members read participants" ON public.project_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR email = auth.jwt() ->> 'email' OR EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "project_members insert owner" ON public.project_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "project_members update owner" ON public.project_members FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
CREATE POLICY "project_members delete owner" ON public.project_members FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ));
