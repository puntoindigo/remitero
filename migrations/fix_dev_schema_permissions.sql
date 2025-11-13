-- ==========================================
-- CORREGIR PERMISOS DEL SCHEMA DEV
-- ==========================================
-- Este script corrige los permisos del schema 'dev' para que PostgREST pueda acceder
-- Ejecutar en Supabase SQL Editor

-- 1. Otorgar USAGE al schema dev a los roles necesarios
GRANT USAGE ON SCHEMA dev TO postgres;
GRANT USAGE ON SCHEMA dev TO authenticated;
GRANT USAGE ON SCHEMA dev TO anon;
GRANT USAGE ON SCHEMA dev TO service_role;

-- 2. Otorgar permisos en todas las tablas existentes del schema dev
GRANT ALL ON ALL TABLES IN SCHEMA dev TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA dev TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO service_role;

-- 3. Otorgar permisos en todas las secuencias existentes del schema dev
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA dev TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO service_role;

-- 4. Configurar permisos por defecto para futuras tablas en el schema dev
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON TABLES TO service_role;

-- 5. Configurar permisos por defecto para futuras secuencias en el schema dev
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON SEQUENCES TO service_role;

-- 6. Verificar permisos
DO $$
BEGIN
  -- Verificar que el schema existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dev') THEN
    RAISE EXCEPTION '❌ Error: El schema dev no existe. Ejecuta primero create_dev_schema.sql';
  END IF;
  
  -- Verificar permisos del schema
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.usage_privileges 
    WHERE object_schema = 'dev' 
    AND grantee IN ('postgres', 'authenticated', 'anon', 'service_role')
  ) THEN
    RAISE WARNING '⚠️ Advertencia: Algunos permisos pueden no haberse otorgado correctamente';
  ELSE
    RAISE NOTICE '✅ Permisos del schema dev configurados correctamente';
  END IF;
END
$$;

-- 7. Verificar que hay tablas en el schema dev
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'dev';
  
  IF table_count = 0 THEN
    RAISE WARNING '⚠️ Advertencia: No hay tablas en el schema dev. Ejecuta copy_structure_to_dev.sql';
  ELSE
    RAISE NOTICE '✅ Encontradas % tablas en el schema dev', table_count;
  END IF;
END
$$;

