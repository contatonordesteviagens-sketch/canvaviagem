CREATE POLICY "Users upload own site assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'thumbnails' AND name LIKE 'sites/' || auth.uid()::text || '/assets/%');

CREATE POLICY "Users update own site assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'thumbnails' AND name LIKE 'sites/' || auth.uid()::text || '/assets/%')
WITH CHECK (bucket_id = 'thumbnails' AND name LIKE 'sites/' || auth.uid()::text || '/assets/%');