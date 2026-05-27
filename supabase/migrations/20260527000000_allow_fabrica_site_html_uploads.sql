-- Allow Fabrica generated websites to be stored as HTML in the existing public bucket.
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'text/html']::text[],
  file_size_limit = GREATEST(COALESCE(file_size_limit, 0), 20971520)
WHERE id = 'thumbnails';

DROP POLICY IF EXISTS "Authenticated users can upload Fabrica sites" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update Fabrica sites" ON storage.objects;

CREATE POLICY "Authenticated users can upload Fabrica sites"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'sites'
);

CREATE POLICY "Authenticated users can update Fabrica sites"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'thumbnails'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'sites'
)
WITH CHECK (
  bucket_id = 'thumbnails'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'sites'
);
