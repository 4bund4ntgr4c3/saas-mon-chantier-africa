-- Gestion documentaire : table documents + bucket de stockage.
-- Ajoute aussi une date d'échéance aux paiements (alertes de retard).

DO $$ BEGIN
  CREATE TYPE public.document_category AS ENUM (
    'plan', 'permis_construire', 'acte_vente', 'facture', 'contrat', 'garantie',
    'photo_chantier', 'autre'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category public.document_category NOT NULL DEFAULT 'autre',
  file_path text,
  size_bytes bigint,
  mime_type text,
  expiry_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_project_idx ON public.documents (project_id);
CREATE INDEX IF NOT EXISTS documents_user_idx ON public.documents (user_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;

CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "documents_update_own" ON public.documents
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "documents_delete_own" ON public.documents
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Bucket privé pour les pièces du chantier (plans, factures, contrats…).
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "documents_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "documents_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "documents_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Échéance des paiements pour détecter les retards.
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS due_date date;

-- Trace documentaire : suppression d'une pièce dans le journal d'audit.
CREATE TRIGGER audit_documents_delete
AFTER DELETE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('document');
