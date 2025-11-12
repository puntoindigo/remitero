-- ==========================================
-- OBTENER ESTRUCTURA DE TABLAS PARA DUPLICAR
-- ==========================================
-- Este script genera el SQL necesario para crear todas las tablas
-- Útil para crear la estructura en el schema dev
-- Ejecutar en Supabase SQL Editor

-- ==========================================
-- GENERAR CREATE TABLE PARA CADA TABLA
-- ==========================================
DO $$
DECLARE
  table_record RECORD;
  create_sql TEXT;
BEGIN
  FOR table_record IN 
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE '_%'
    ORDER BY table_name
  LOOP
    -- Generar CREATE TABLE LIKE para cada tabla
    create_sql := 'CREATE TABLE IF NOT EXISTS dev.' || table_record.table_name || 
                  ' (LIKE public.' || table_record.table_name || ' INCLUDING ALL);';
    
    RAISE NOTICE '%', create_sql;
  END LOOP;
END
$$;

-- ==========================================
-- LISTAR TODAS LAS TABLAS
-- ==========================================
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE '_%'
ORDER BY table_name;

