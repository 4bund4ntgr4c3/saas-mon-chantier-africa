-- Demandes de démo : pipeline de suivi (nouvelle → contactée → convertie / refusée),
-- relance, et pièce jointe (plan/brief) sur chaque demande.
-- Ajoute aussi un bucket public d'accueil pour les pièces jointes.

-- 1) Aligner les statuts sur le pipeline métier.
DO $$ BEGIN
  ALTER TYPE public.demo_request_status RENAME VALUE 'nouveau' TO 'nouvelle';
EXCEPTION WHEN duplicate_object OR undefined_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.demo_request_status RENAME VALUE 'contacte' TO 'contactee';
EXCEPTION WHEN duplicate_object OR undefined_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.demo_request_status RENAME VALUE 'traite' TO 'convertie';
EXCEPTION WHEN duplicate_object OR undefined_object THEN NULL; END $$;

UPDATE public.demo_requests SET status = 'contactee' WHERE status = 'planifie';
UPDATE public.demo_requests SET status = 'nouvelle' WHERE status = 'archive';

ALTER TYPE public.demo_request_status ADD VALUE IF NOT EXISTS 'refusee';
DO $$ BEGIN
  ALTER TYPE public.demo_request_status DROP VALUE IF EXISTS 'planifie';
  ALTER TYPE public.demo_request_status DROP VALUE IF EXISTS 'archive';
EXCEPTION WHEN dependent_objects_are_not_allowed THEN NULL; END $$;

-- 2) Suivi commercial + pièce jointe.
ALTER TABLE public.demo_requests
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS attachment_name text,
  ADD COLUMN IF NOT EXISTS attachment_path text;

-- 3) Bucket d'accueil (public) pour les pièces jointes des demandes de démo.
INSERT INTO storage.buckets (id, name, public)
VALUES ('demo-attachments', 'demo-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "demo_attachments_public_insert" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'demo-attachments');
CREATE POLICY "demo_attachments_public_select" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'demo-attachments');
CREATE POLICY "demo_attachments_public_delete" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'demo-attachments');
