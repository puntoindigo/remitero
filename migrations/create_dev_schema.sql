-- ==========================================
-- CREAR SCHEMA DEV PARA DESARROLLO
-- ==========================================
-- Este script crea el schema 'dev' y configura permisos
-- Ejecutar en Supabase SQL Editor

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS dev;

-- Otorgar permisos al usuario postgres (superusuario)
GRANT ALL ON SCHEMA dev TO postgres;

-- Otorgar permisos a usuarios autenticados
GRANT USAGE ON SCHEMA dev TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO authenticated;

-- Configurar permisos por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev 
  GRANT ALL ON SEQUENCES TO authenticated;

-- Comentario para documentación
COMMENT ON SCHEMA dev IS 'Schema para desarrollo. Separado de producción (public) para permitir pruebas sin afectar datos reales.';

-- Verificar que se creó correctamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dev') THEN
    RAISE NOTICE '✅ Schema dev creado exitosamente';
  ELSE
    RAISE EXCEPTION '❌ Error: No se pudo crear el schema dev';
  END IF;
END
$$;

