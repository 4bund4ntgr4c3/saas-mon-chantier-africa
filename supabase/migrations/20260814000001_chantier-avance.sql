-- Chantier avancé : réserves, plans annotables, messagerie projet, et géolocalisation.

DO $$ BEGIN
  CREATE TYPE public.reserve_status AS ENUM ('ouverte', 'en_cours', 'resolue', 'annulee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.reserve_priority AS ENUM ('basse', 'moyenne', 'haute', 'critique');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* ---------- Réserves ---------- */

CREATE TABLE public.reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  location text,
  photo_path text,
  status public.reserve_status NOT NULL DEFAULT 'ouverte',
  priority public.reserve_priority NOT NULL DEFAULT 'moyenne',
  assigned_to text,
  due_date date,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reserves_project_status_idx ON public.reserves (project_id, status, due_date);

/* ---------- Plans annotables ---------- */

CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  annotations jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX plans_project_idx ON public.plans (project_id, created_at DESC);

/* ---------- Messagerie projet ---------- */

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_project_idx ON public.messages (project_id, created_at);
CREATE INDEX messages_recipient_idx ON public.messages (recipient_id, is_read);

/* ---------- Géolocalisation ---------- */

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS lng double precision;

ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS lng double precision;

/* ---------- RLS ---------- */

ALTER TABLE public.reserves ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reserves TO authenticated;
GRANT ALL ON public.reserves TO service_role;

CREATE POLICY "reserves read own" ON public.reserves FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "reserves insert own" ON public.reserves FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reserves update own" ON public.reserves FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "reserves delete own" ON public.reserves FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;

CREATE POLICY "plans read own" ON public.plans FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "plans insert own" ON public.plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "plans update own" ON public.plans FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "plans delete own" ON public.plans FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

-- L'utilisateur peut lire un message s'il l'a envoyé, le reçoit, ou est propriétaire du projet.
CREATE POLICY "messages read participant" ON public.messages FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );
CREATE POLICY "messages insert own" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "messages update participant" ON public.messages FOR UPDATE TO authenticated
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );
CREATE POLICY "messages delete own" ON public.messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());
