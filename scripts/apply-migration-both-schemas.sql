-- ==========================================
-- APLICAR MIGRACIÓN EN AMBOS SCHEMAS
-- ==========================================
-- Este es un template para aplicar migraciones en ambos schemas (public y dev)
-- 
-- USO:
-- 1. Reemplaza [TU_MIGRACION_AQUI] con el SQL de tu migración
-- 2. Ejecuta este script en Supabase SQL Editor
-- 3. La migración se aplicará automáticamente a ambos schemas

-- ==========================================
-- EJEMPLO: Agregar columna a tabla users
-- ==========================================

-- Aplicar en schema public (producción)
DO $$
BEGIN
  -- [TU_MIGRACION_AQUI]
  -- Ejemplo:
  -- IF NOT EXISTS (
  --   SELECT 1 FROM information_schema.columns 
  --   WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'nueva_columna'
  -- ) THEN
  --   ALTER TABLE public.users ADD COLUMN nueva_columna TEXT;
  -- END IF;
  
  RAISE NOTICE '✅ Migración aplicada en schema public';
END
$$;

-- Aplicar en schema dev (desarrollo)
DO $$
BEGIN
  -- [TU_MIGRACION_AQUI] - Mismo código pero para schema dev
  -- Ejemplo:
  -- IF NOT EXISTS (
  --   SELECT 1 FROM information_schema.columns 
  --   WHERE table_schema = 'dev' AND table_name = 'users' AND column_name = 'nueva_columna'
  -- ) THEN
  --   ALTER TABLE dev.users ADD COLUMN nueva_columna TEXT;
  -- END IF;
  
  RAISE NOTICE '✅ Migración aplicada en schema dev';
END
$$;

-- ==========================================
-- NOTAS
-- ==========================================
-- - Siempre usar IF NOT EXISTS para hacer migraciones idempotentes
-- - Verificar que la migración se aplicó correctamente en ambos schemas
-- - Si la migración falla en un schema, el otro no se afecta
-- - Considerar hacer backup antes de aplicar migraciones en producción

