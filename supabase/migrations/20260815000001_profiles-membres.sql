-- Vague 1 (complément) — noms des membres : jointure project_members -> profiles
-- (bouton « Membres », select "*, profiles(full_name)") + lecture des profils
-- par les collaborateurs du même chantier. Idempotent.

DO $$ BEGIN
  ALTER TABLE public.project_members
    ADD CONSTRAINT project_members_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP POLICY IF EXISTS "profiles read scope" ON public.profiles;
CREATE POLICY "profiles read scope" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
    OR EXISTS (SELECT 1 FROM public.project_members m
               JOIN public.projects p ON p.id = m.project_id
               WHERE p.user_id = profiles.id
                 AND (m.user_id = auth.uid() OR m.email = auth.jwt() ->> 'email')));
