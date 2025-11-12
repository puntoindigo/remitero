-- ==========================================
-- COPIAR ESTRUCTURA DE TABLAS A SCHEMA DEV
-- ==========================================
-- Este script duplica la estructura de todas las tablas del schema public al schema dev
-- Ejecutar DESPUÉS de create_dev_schema.sql
-- IMPORTANTE: Este script solo crea la estructura, NO copia datos

-- ==========================================
-- FUNCIÓN HELPER: Copiar estructura de tabla
-- ==========================================
CREATE OR REPLACE FUNCTION copy_table_structure_to_dev(
  source_table_name TEXT,
  target_table_name TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  target_name TEXT;
  create_stmt TEXT;
BEGIN
  -- Si no se especifica nombre target, usar el mismo que source
  target_name := COALESCE(target_table_name, source_table_name);
  
  -- Generar CREATE TABLE basado en la estructura de public
  SELECT 'CREATE TABLE IF NOT EXISTS dev.' || target_name || ' (LIKE public.' || source_table_name || ' INCLUDING ALL)' 
  INTO create_stmt;
  
  EXECUTE create_stmt;
  
  RAISE NOTICE '✅ Tabla dev.% creada desde public.%', target_name, source_table_name;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COPIAR ESTRUCTURA DE TODAS LAS TABLAS
-- ==========================================

-- Users
SELECT copy_table_structure_to_dev('users');

-- Companies
SELECT copy_table_structure_to_dev('companies');

-- Products
SELECT copy_table_structure_to_dev('products');

-- Clients
SELECT copy_table_structure_to_dev('clients');

-- Categories
SELECT copy_table_structure_to_dev('categories');

-- Estados Remitos
SELECT copy_table_structure_to_dev('estados_remitos');

-- Remitos
SELECT copy_table_structure_to_dev('remitos');

-- Remito Items
SELECT copy_table_structure_to_dev('remito_items');

-- User Activity Logs
SELECT copy_table_structure_to_dev('user_activity_logs');

-- Notification Preferences
SELECT copy_table_structure_to_dev('notification_preferences');

-- ==========================================
-- COPIAR SECUENCIAS (para IDs auto-incrementales)
-- ==========================================
-- Las secuencias se copian automáticamente con INCLUDING ALL
-- Pero necesitamos resetearlas para que empiecen desde 1

-- ==========================================
-- COPIAR ÍNDICES
-- ==========================================
-- Los índices se copian automáticamente con INCLUDING ALL

-- ==========================================
-- COPIAR CONSTRAINTS Y FOREIGN KEYS
-- ==========================================
-- Las foreign keys se copian automáticamente con INCLUDING ALL

-- ==========================================
-- LIMPIAR FUNCIÓN HELPER
-- ==========================================
DROP FUNCTION IF EXISTS copy_table_structure_to_dev(TEXT, TEXT);

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'dev';
  
  RAISE NOTICE '✅ Total de tablas creadas en schema dev: %', table_count;
  
  IF table_count = 0 THEN
    RAISE WARNING '⚠️ No se encontraron tablas en schema dev. Verifica que el script se ejecutó correctamente.';
  END IF;
END
$$;

