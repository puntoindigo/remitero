-- ==========================================
-- COPIAR DATOS DE PRODUCCIÓN A DESARROLLO
-- ==========================================
-- Este script copia datos del schema public (producción) al schema dev (desarrollo)
-- ⚠️ ADVERTENCIA: Esto SOBRESCRIBE los datos existentes en dev
-- Ejecutar solo cuando necesites sincronizar datos reales en desarrollo

-- ==========================================
-- FUNCIÓN HELPER: Copiar datos de tabla
-- ==========================================
CREATE OR REPLACE FUNCTION copy_table_data_to_dev(
  table_name TEXT
) RETURNS VOID AS $$
DECLARE
  row_count INTEGER;
BEGIN
  -- Truncar tabla destino primero (eliminar datos existentes)
  EXECUTE 'TRUNCATE TABLE dev.' || table_name || ' CASCADE';
  
  -- Copiar datos
  EXECUTE 'INSERT INTO dev.' || table_name || ' SELECT * FROM public.' || table_name;
  
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✅ Copiados % registros de public.% a dev.%', row_count, table_name, table_name;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COPIAR DATOS (en orden de dependencias)
-- ==========================================

-- 1. Tablas base (sin dependencias)
SELECT copy_table_data_to_dev('companies');
SELECT copy_table_data_to_dev('estados_remitos');
SELECT copy_table_data_to_dev('categories');

-- 2. Usuarios (depende de companies)
SELECT copy_table_data_to_dev('users');

-- 3. Clientes y Productos (dependen de companies)
SELECT copy_table_data_to_dev('clients');
SELECT copy_table_data_to_dev('products');

-- 4. Remitos (depende de clients, estados_remitos, companies)
SELECT copy_table_data_to_dev('remitos');

-- 5. Remito Items (depende de remitos, products)
SELECT copy_table_data_to_dev('remito_items');

-- 6. Logs y preferencias (dependen de users)
SELECT copy_table_data_to_dev('user_activity_logs');
SELECT copy_table_data_to_dev('notification_preferences');

-- ==========================================
-- RESETEAR SECUENCIAS
-- ==========================================
-- Asegurar que las secuencias empiecen después del último ID usado
DO $$
DECLARE
  seq_record RECORD;
  max_id BIGINT;
  reset_sql TEXT;
BEGIN
  FOR seq_record IN 
    SELECT sequence_name 
    FROM information_schema.sequences 
    WHERE sequence_schema = 'dev'
  LOOP
    -- Obtener el nombre de la tabla asociada (asumiendo naming convention: tablename_id_seq)
    DECLARE
      table_name TEXT;
      id_column TEXT;
    BEGIN
      -- Extraer nombre de tabla del nombre de secuencia
      table_name := REPLACE(seq_record.sequence_name, '_id_seq', '');
      id_column := 'id';
      
      -- Obtener máximo ID actual
      EXECUTE 'SELECT COALESCE(MAX(' || id_column || '), 0) FROM dev.' || table_name INTO max_id;
      
      -- Resetear secuencia
      reset_sql := 'SELECT setval(''dev.' || seq_record.sequence_name || ''', ' || (max_id + 1) || ')';
      EXECUTE reset_sql;
      
      RAISE NOTICE '✅ Secuencia dev.% reseteada a %', seq_record.sequence_name, max_id + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️ No se pudo resetear secuencia dev.%: %', seq_record.sequence_name, SQLERRM;
    END;
  END LOOP;
END
$$;

-- ==========================================
-- LIMPIAR FUNCIÓN HELPER
-- ==========================================
DROP FUNCTION IF EXISTS copy_table_data_to_dev(TEXT);

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
DO $$
DECLARE
  total_rows INTEGER;
BEGIN
  SELECT SUM(n_live_tup) INTO total_rows
  FROM pg_stat_user_tables
  WHERE schemaname = 'dev';
  
  RAISE NOTICE '✅ Total de registros copiados a schema dev: %', total_rows;
END
$$;

