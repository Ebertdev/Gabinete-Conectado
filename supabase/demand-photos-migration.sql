-- Execute no SQL Editor do Supabase para habilitar fotos em demandas.

ALTER TABLE IF EXISTS public.demandas
ADD COLUMN IF NOT EXISTS anexos JSONB NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demand-photos',
  'demand-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "demand_photos_public_read" ON storage.objects;
CREATE POLICY "demand_photos_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'demand-photos');

DROP POLICY IF EXISTS "demand_photos_public_insert" ON storage.objects;
CREATE POLICY "demand_photos_public_insert"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'demand-photos');
