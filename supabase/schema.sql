-- ============================================================
-- EL BOCATÓMETRO — Esquema SQL completo para Supabase
-- ============================================================
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: perfiles de usuario
-- Extiende la tabla auth.users de Supabase Auth
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  bocatas_reviewed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: bocatas
-- Representa cada bocadillo registrado en la plataforma
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bocatas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- URL amigable: "jamon-iberico-bar-pepe"
  name TEXT NOT NULL,                  -- "Bocata de Jamón Ibérico"
  place_name TEXT,                     -- "Bar Pepe"
  place_address TEXT,
  place_city TEXT DEFAULT 'Barcelona',
  description TEXT,                    -- Descripción general
  cover_image_url TEXT,                -- Imagen principal
  images TEXT[] DEFAULT '{}',          -- Array de URLs de imágenes
  tags TEXT[] DEFAULT '{}',            -- ["legendario", "criminal", "seca gargantas"]
  is_hall_of_fame BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Puntuaciones calculadas (se actualizan con triggers)
  avg_score DECIMAL(3,2) DEFAULT 0,
  avg_pan DECIMAL(3,2) DEFAULT 0,
  avg_relleno DECIMAL(3,2) DEFAULT 0,
  avg_calidad_precio DECIMAL(3,2) DEFAULT 0,
  avg_tamano DECIMAL(3,2) DEFAULT 0,
  avg_destruccion DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0
);

-- ============================================================
-- TABLA: reviews
-- Cada review es una puntuación detallada de un bocata
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bocata_id UUID REFERENCES public.bocatas(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,           -- Nombre para mostrar (snapshot)
  
  -- Puntuaciones individuales (1-10)
  score_pan DECIMAL(3,1) NOT NULL CHECK (score_pan >= 1 AND score_pan <= 10),
  score_relleno DECIMAL(3,1) NOT NULL CHECK (score_relleno >= 1 AND score_relleno <= 10),
  score_calidad_precio DECIMAL(3,1) NOT NULL CHECK (score_calidad_precio >= 1 AND score_calidad_precio <= 10),
  score_tamano DECIMAL(3,1) NOT NULL CHECK (score_tamano >= 1 AND score_tamano <= 10),
  score_destruccion DECIMAL(3,1) NOT NULL CHECK (score_destruccion >= 1 AND score_destruccion <= 10),
  
  -- Puntuación global (calculada automáticamente)
  score_total DECIMAL(3,2) GENERATED ALWAYS AS (
    (score_pan + score_relleno + score_calidad_precio + score_tamano + score_destruccion) / 5.0
  ) STORED,
  
  -- Contenido
  title TEXT,                          -- Título de la review: "Una obra maestra de la charcutería"
  body TEXT NOT NULL,                  -- Review completa
  
  -- Metadata
  eaten_at DATE,                       -- Cuándo se comió
  price_paid DECIMAL(5,2),             -- Precio pagado en euros
  would_repeat BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un usuario solo puede hacer una review por bocata
  UNIQUE(bocata_id, author_id)
);

-- ============================================================
-- TABLA: comentarios
-- Comentarios cortos en las reviews o en los bocatas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bocata_id UUID REFERENCES public.bocatas(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN: actualizar promedios del bocata
-- Se ejecuta cada vez que se crea/modifica/elimina una review
-- ============================================================
CREATE OR REPLACE FUNCTION update_bocata_scores()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.bocatas
  SET
    avg_score = (
      SELECT COALESCE(AVG(score_total), 0)
      FROM public.reviews
      WHERE bocata_id = COALESCE(NEW.bocata_id, OLD.bocata_id)
    ),
    avg_pan = (
      SELECT COALESCE(AVG(score_pan), 0)
      FROM public.reviews
      WHERE bocata_id = COALESCE(NEW.bocata_id, OLD.bocata_id)
    ),
    avg_relleno = (
      SELECT COALESCE(AVG(score_relleno), 0)
      FROM public.reviews
      WHERE bocata_id = COALESCE(NEW.bocata_id, OLD.bocata_id)
    ),
    avg_calidad_precio = (
      SELECT COALESCE(AVG(score_calidad_precio), 0)
      FROM public.reviews
      WHERE bocata_id = COALESCE(NEW.bocata_id, OLD.bocata_id)
    ),
    avg_tamano = (
      SELECT COALESCE(AVG(score_tamano), 0)
      FROM public.reviews
      WHERE bocata_id = COALESCE(NEW.bocata_id, OLD.bocata_id)
    ),
    avg_destruccion = (
      SELECT COALESCE(AVG(score_destruccion), 0)
      FROM public.reviews
      WHERE bocata_id = COALESCE(NEW.bocata_id, OLD.bocata_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE bocata_id = COALESCE(NEW.bocata_id, OLD.bocata_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.bocata_id, OLD.bocata_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para INSERT
CREATE TRIGGER on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_bocata_scores();

-- Trigger para UPDATE
CREATE TRIGGER on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_bocata_scores();

-- Trigger para DELETE
CREATE TRIGGER on_review_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_bocata_scores();

-- ============================================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bocatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- PROFILES: lectura pública, escritura solo propia
CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- BOCATAS: lectura pública, cualquier autenticado puede crear
CREATE POLICY "Bocatas are publicly readable" ON public.bocatas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert bocatas" ON public.bocatas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their bocatas" ON public.bocatas
  FOR UPDATE USING (auth.uid() = created_by);

-- REVIEWS: lectura pública, autenticados crean/editan las suyas
CREATE POLICY "Reviews are publicly readable" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = author_id);

-- COMMENTS: lectura pública, autenticados crean/borran los suyos
CREATE POLICY "Comments are publicly readable" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can delete their comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- STORAGE: bucket para imágenes de bocatas
-- ============================================================
-- Ejecuta esto también en el SQL Editor:

INSERT INTO storage.buckets (id, name, public)
VALUES ('bocata-images', 'bocata-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Bocata images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'bocata-images');

CREATE POLICY "Authenticated users can upload bocata images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bocata-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own bocata images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'bocata-images' AND
    auth.uid() IS NOT NULL
  );

-- ============================================================
-- DATOS DE EJEMPLO (opcional, para probar la web)
-- ============================================================

-- Descomenta y ejecuta si quieres datos de prueba:
/*
INSERT INTO public.bocatas (slug, name, place_name, place_city, description, tags, is_hall_of_fame)
VALUES
  ('jamon-iberico-bar-central', 'Jamón Ibérico de Bellota', 'Bar Central', 'Barcelona', 
   'El bocata que te cambia la vida. Jamón de pata negra auténtico, pan de cristal crujiente, tomate de temporada. Una experiencia mística.',
   ARRAY['legendario', 'hall-of-fame'], TRUE),
  
  ('calamares-fritos-el-marino', 'Calamares a la Romana', 'El Marino', 'Barcelona',
   'Los calamares más crujientes del barrio. Rebozado perfecto, limón justo, pan de bocadillo de toda la vida.',
   ARRAY['clásico', 'destructor'], FALSE),
   
  ('tortilla-patatas-cafe-moderno', 'Tortilla de Patatas Jugosa', 'Café Moderno', 'Barcelona',
   'La tortilla está a punto de llorar de lo jugosa que está. Cebolla caramelizada, patata bien confitada.',
   ARRAY['imprescindible'], FALSE);
*/
