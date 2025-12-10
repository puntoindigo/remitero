-- ==========================================
-- AGREGAR PREFERENCIA DE PAGINACIÓN A USUARIOS
-- ==========================================
-- Este script agrega un campo para guardar la preferencia de paginación del usuario
-- Valores permitidos: 10, 25, 50, 100 (por defecto: 10)
-- Este script aplica los cambios tanto en el schema 'dev' como en 'public'

DO $$
DECLARE
    schema_name TEXT;
BEGIN
    -- Iterar sobre ambos schemas: 'dev' y 'public'
    FOR schema_name IN SELECT unnest(ARRAY['dev', 'public']) LOOP
        -- Agregar columna para preferencia de paginación si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = schema_name
            AND table_name = 'users' 
            AND column_name = 'pagination_items_per_page'
        ) THEN
            EXECUTE format('ALTER TABLE %I.users ADD COLUMN pagination_items_per_page INTEGER DEFAULT 10', schema_name);
            RAISE NOTICE 'Columna pagination_items_per_page agregada en schema %', schema_name;
        ELSE
            RAISE NOTICE 'Columna pagination_items_per_page ya existe en schema %', schema_name;
        END IF;

        -- Agregar constraint para validar valores permitidos
        EXECUTE format('ALTER TABLE %I.users DROP CONSTRAINT IF EXISTS check_pagination_items_per_page', schema_name);
        
        EXECUTE format('ALTER TABLE %I.users ADD CONSTRAINT check_pagination_items_per_page CHECK (pagination_items_per_page IN (10, 25, 50, 100))', schema_name);

        -- Actualizar usuarios existentes con valor por defecto si no tienen uno
        EXECUTE format('UPDATE %I.users SET pagination_items_per_page = 10 WHERE pagination_items_per_page IS NULL', schema_name);

        -- Agregar comentario a la columna
        EXECUTE format('COMMENT ON COLUMN %I.users.pagination_items_per_page IS ''Preferencia de paginación del usuario (10, 25, 50, 100 registros por página). Solo para ADMIN y SUPERADMIN.''', schema_name);
    END LOOP;

    RAISE NOTICE '✅ Migración completada para ambos schemas (dev y public)';
END $$;

