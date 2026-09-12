-- Buckets privés manquants (photos de chantier, journal) — même motif que
-- `documents` (dossier racine = auth.uid()). Idempotent.

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false), ('journal-photos', 'journal-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "photos_storage_select" ON storage.objects;
CREATE POLICY "photos_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "photos_storage_insert" ON storage.objects;
CREATE POLICY "photos_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "photos_storage_delete" ON storage.objects;
CREATE POLICY "photos_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "journal_storage_select" ON storage.objects;
CREATE POLICY "journal_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "journal_storage_insert" ON storage.objects;
CREATE POLICY "journal_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "journal_storage_delete" ON storage.objects;
CREATE POLICY "journal_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
