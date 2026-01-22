-- Criar bucket publico para thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
);

-- Policy: Leitura publica
CREATE POLICY "Thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Policy: Upload apenas para admins autenticados
CREATE POLICY "Only admins can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND auth.uid() IS NOT NULL
  AND public.is_admin()
);

-- Policy: Admins podem deletar thumbnails
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails' 
  AND auth.uid() IS NOT NULL
  AND public.is_admin()
);