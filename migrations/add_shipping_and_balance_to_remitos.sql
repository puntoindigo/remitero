-- ==========================================
-- MIGRACIÓN: Agregar campos de envío y saldo anterior a la tabla remitos
-- ==========================================
-- Fecha: 2024
-- Nota: Si shipping_cost > 0, entonces el remito tiene envío
-- Esta migración es SEGURA: no elimina datos existentes, solo agrega columnas con valores por defecto

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
SELECT add_column_if_not_exists('public', 'remitos', 'shipping_cost', 'NUMERIC(10, 2)', '0');
SELECT add_column_if_not_exists('public', 'remitos', 'previous_balance', 'NUMERIC(10, 2)', '0');

-- Actualizar valores NULL a 0 (por si acaso)
UPDATE public.remitos 
SET shipping_cost = 0 
WHERE shipping_cost IS NULL;

UPDATE public.remitos 
SET previous_balance = 0 
WHERE previous_balance IS NULL;

-- Agregar comentarios
COMMENT ON COLUMN public.remitos.shipping_cost IS 'Costo de envío del remito. Si es mayor a 0, el remito incluye envío';
COMMENT ON COLUMN public.remitos.previous_balance IS 'Saldo anterior que se suma al total del remito';

-- ==========================================
-- APLICAR MIGRACIÓN EN SCHEMA DEV (DESARROLLO)
-- ==========================================
-- Solo si el schema dev existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dev') THEN
    PERFORM add_column_if_not_exists('dev', 'remitos', 'shipping_cost', 'NUMERIC(10, 2)', '0');
    PERFORM add_column_if_not_exists('dev', 'remitos', 'previous_balance', 'NUMERIC(10, 2)', '0');
    
    -- Actualizar valores NULL a 0
    UPDATE dev.remitos 
    SET shipping_cost = 0 
    WHERE shipping_cost IS NULL;
    
    UPDATE dev.remitos 
    SET previous_balance = 0 
    WHERE previous_balance IS NULL;
    
    -- Agregar comentarios
    COMMENT ON COLUMN dev.remitos.shipping_cost IS 'Costo de envío del remito. Si es mayor a 0, el remito incluye envío';
    COMMENT ON COLUMN dev.remitos.previous_balance IS 'Saldo anterior que se suma al total del remito';
    
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
  -- Verificar que las columnas existen en public
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'remitos' 
      AND column_name = 'shipping_cost'
  ) AND EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'remitos' 
      AND column_name = 'previous_balance'
  ) THEN
    RAISE NOTICE '✅ Migración completada exitosamente en schema public';
  ELSE
    RAISE EXCEPTION '❌ Error: No se pudieron agregar las columnas en schema public';
  END IF;
END
$$;

-- Limpiar función helper (opcional, comentar si quieres mantenerla)
-- DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT, TEXT, TEXT);

