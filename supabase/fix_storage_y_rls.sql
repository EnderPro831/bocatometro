-- ============================================================
-- FIX COMPLETO: Storage + RLS
-- Pega esto en Supabase → SQL Editor → Run
-- ============================================================

-- 1. Crear bucket público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bocata-images', 'bocata-images', true, 5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- 2. Limpiar políticas de storage antiguas
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname LIKE '%bocata%'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
  END LOOP;
END $$;

-- 3. Políticas de storage: acceso público total
CREATE POLICY "bocata_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'bocata-images');

CREATE POLICY "bocata_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bocata-images');

CREATE POLICY "bocata_images_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'bocata-images');

CREATE POLICY "bocata_images_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'bocata-images');

-- 4. Limpiar políticas de tablas antiguas
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('bocatas','reviews','comments','profiles')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
  END LOOP;
END $$;

-- 5. RLS activado
ALTER TABLE public.bocatas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 6. Políticas permisivas (sin login requerido — app entre amigos)
CREATE POLICY "bocatas_all" ON public.bocatas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "reviews_all" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "comments_all" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- 7. Verificar resultado
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname IN ('public','storage')
  AND tablename IN ('bocatas','reviews','comments','objects')
ORDER BY tablename;
