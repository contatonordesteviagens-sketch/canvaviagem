-- Restrict Fabrica site asset writes to the authenticated user's own folder.
-- Published assets remain publicly readable through the existing public bucket
-- policy because agency websites embed these URLs directly.

DROP POLICY IF EXISTS "Authenticated users can upload Fabrica sites"
ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can update Fabrica sites"
ON storage.objects;

DROP POLICY IF EXISTS "Site asset owners can upload Fabrica assets"
ON storage.objects;

DROP POLICY IF EXISTS "Site asset owners can update Fabrica assets"
ON storage.objects;

DROP POLICY IF EXISTS "Site asset owners can delete Fabrica assets"
ON storage.objects;

CREATE POLICY "Site asset owners can upload Fabrica assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = 'sites'
  AND (storage.foldername(name))[3] = 'assets'
  AND array_length(storage.foldername(name), 1) = 3
  AND (
    (storage.foldername(name))[2] = auth.uid()::text
    OR public.is_admin()
  )
);

CREATE POLICY "Site asset owners can update Fabrica assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = 'sites'
  AND (storage.foldername(name))[3] = 'assets'
  AND array_length(storage.foldername(name), 1) = 3
  AND (
    (storage.foldername(name))[2] = auth.uid()::text
    OR public.is_admin()
  )
)
WITH CHECK (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = 'sites'
  AND (storage.foldername(name))[3] = 'assets'
  AND array_length(storage.foldername(name), 1) = 3
  AND (
    (storage.foldername(name))[2] = auth.uid()::text
    OR public.is_admin()
  )
);

CREATE POLICY "Site asset owners can delete Fabrica assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = 'sites'
  AND (storage.foldername(name))[3] = 'assets'
  AND array_length(storage.foldername(name), 1) = 3
  AND (
    (storage.foldername(name))[2] = auth.uid()::text
    OR public.is_admin()
  )
);
