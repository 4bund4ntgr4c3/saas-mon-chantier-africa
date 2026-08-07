CREATE POLICY "journal photos read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "journal photos insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "journal photos update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "journal photos delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'journal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);