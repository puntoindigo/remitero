-- ==========================================
-- MIGRACIÓN: Agregar campo 'is_unit' a la tabla remito_items
-- ==========================================
-- Fecha: 2025
-- Nota: Este campo indica si el producto se vende por unidad en lugar de por presentación
-- Esta migración es SEGURA: no elimina datos existentes, solo agrega columna con valor por defecto

-- ==========================================
-- FUNCIÓN HELPER: Agregar columna si no existe
-- ==========================================
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  p_schema_name TEXT,
  p_table_name TEXT,
  p_column_name TEXT,
  p_column_type TEXT,
  p_default_value TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = p_schema_name 
      AND table_name = p_table_name 
      AND column_name = p_column_name
  ) THEN
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %s %s', 
      p_schema_name, 
      p_table_name, 
      p_column_name, 
      p_column_type,
      COALESCE('DEFAULT ' || p_default_value, '')
    );
    RAISE NOTICE '✅ Columna %I.%I.%I agregada', p_schema_name, p_table_name, p_column_name;
  ELSE
    RAISE NOTICE 'ℹ️ Columna %I.%I.%I ya existe, omitiendo', p_schema_name, p_table_name, p_column_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- APLICAR MIGRACIÓN EN SCHEMA PUBLIC (PRODUCCIÓN)
-- ==========================================
SELECT add_column_if_not_exists('public', 'remito_items', 'is_unit', 'BOOLEAN', 'false');

-- Actualizar valores NULL a false (por si acaso)
UPDATE public.remito_items 
SET is_unit = false 
WHERE is_unit IS NULL;

-- Agregar comentario
COMMENT ON COLUMN public.remito_items.is_unit IS 'Indica si el producto se vende por unidad en lugar de por presentación';

-- ==========================================
-- APLICAR MIGRACIÓN EN SCHEMA DEV (DESARROLLO)
-- ==========================================
-- Solo si el schema dev existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dev') THEN
    PERFORM add_column_if_not_exists('dev', 'remito_items', 'is_unit', 'BOOLEAN', 'false');
    
    -- Actualizar valores NULL a false
    UPDATE dev.remito_items 
    SET is_unit = false 
    WHERE is_unit IS NULL;
    
    -- Agregar comentario
    COMMENT ON COLUMN dev.remito_items.is_unit IS 'Indica si el producto se vende por unidad en lugar de por presentación';
    
    RAISE NOTICE '✅ Migración aplicada también en schema dev';
  ELSE
    RAISE NOTICE 'ℹ️ Schema dev no existe, omitiendo migración en dev';
  END IF;
END
$$;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
DO $$
BEGIN
  -- Verificar que la columna existe en public
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'remito_items' 
      AND column_name = 'is_unit'
  ) THEN
    RAISE NOTICE '✅ Migración completada exitosamente en schema public';
  ELSE
    RAISE EXCEPTION '❌ Error: No se pudo agregar la columna is_unit en schema public';
  END IF;
END
$$;

-- Limpiar función helper (opcional, comentar si quieres mantenerla)
-- DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT, TEXT, TEXT);

