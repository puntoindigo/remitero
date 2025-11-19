-- migrations/add_password_reset_token_to_users.sql

-- Agregar campos para reset de contraseña con token
-- password_reset_token: Token único para resetear contraseña
-- password_reset_expires: Fecha de expiración del token (30 minutos)

DO $$
BEGIN
    -- Agregar columna password_reset_token si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_reset_token'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN password_reset_token VARCHAR(255) NULL;
        
        COMMENT ON COLUMN public.users.password_reset_token IS 'Token único para resetear contraseña. Se genera cuando se solicita reset.';
    END IF;

    -- Agregar columna password_reset_expires si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_reset_expires'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN password_reset_expires TIMESTAMP WITH TIME ZONE NULL;
        
        COMMENT ON COLUMN public.users.password_reset_expires IS 'Fecha y hora de expiración del token de reset. El token expira después de 30 minutos.';
    END IF;

    -- Crear índice para búsquedas rápidas por token
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND indexname = 'idx_users_password_reset_token'
    ) THEN
        CREATE INDEX idx_users_password_reset_token ON public.users(password_reset_token);
    END IF;
END
$$;

