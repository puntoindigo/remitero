-- migrations/add_password_reset_token_to_users.sql

-- Agregar campos para reset de contraseña con token
-- password_reset_token: Token único para resetear contraseña
-- password_reset_expires: Fecha de expiración del token (30 minutos)
-- Este script aplica los cambios tanto en el schema 'dev' como en 'public'

DO $$
DECLARE
    schema_name TEXT;
BEGIN
    -- Iterar sobre ambos schemas: 'dev' y 'public'
    FOR schema_name IN SELECT unnest(ARRAY['dev', 'public']) LOOP
        
        -- Agregar columna password_reset_token si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = schema_name
            AND table_name = 'users' 
            AND column_name = 'password_reset_token'
        ) THEN
            EXECUTE format('ALTER TABLE %I.users ADD COLUMN password_reset_token VARCHAR(255) NULL', schema_name);
            
            EXECUTE format('COMMENT ON COLUMN %I.users.password_reset_token IS %L', 
                schema_name, 
                'Token único para resetear contraseña. Se genera cuando se solicita reset.'
            );
            
            RAISE NOTICE 'Columna password_reset_token agregada en schema %', schema_name;
        ELSE
            RAISE NOTICE 'Columna password_reset_token ya existe en schema %', schema_name;
        END IF;

        -- Agregar columna password_reset_expires si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = schema_name
            AND table_name = 'users' 
            AND column_name = 'password_reset_expires'
        ) THEN
            EXECUTE format('ALTER TABLE %I.users ADD COLUMN password_reset_expires TIMESTAMP WITH TIME ZONE NULL', schema_name);
            
            EXECUTE format('COMMENT ON COLUMN %I.users.password_reset_expires IS %L', 
                schema_name, 
                'Fecha y hora de expiración del token de reset. El token expira después de 30 minutos.'
            );
            
            RAISE NOTICE 'Columna password_reset_expires agregada en schema %', schema_name;
        ELSE
            RAISE NOTICE 'Columna password_reset_expires ya existe en schema %', schema_name;
        END IF;

        -- Crear índice para búsquedas rápidas por token si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_indexes 
            WHERE schemaname = schema_name
            AND tablename = 'users' 
            AND indexname = 'idx_users_password_reset_token'
        ) THEN
            EXECUTE format('CREATE INDEX idx_users_password_reset_token ON %I.users(password_reset_token)', schema_name);
            
            RAISE NOTICE 'Índice idx_users_password_reset_token creado en schema %', schema_name;
        ELSE
            RAISE NOTICE 'Índice idx_users_password_reset_token ya existe en schema %', schema_name;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE 'Migración completada para ambos schemas (dev y public)';
END
$$;

