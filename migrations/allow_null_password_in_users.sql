-- migrations/allow_null_password_in_users.sql

-- Permitir NULL en la columna password de la tabla users
-- Esto permite que usuarios de Gmail (que usan OAuth) no tengan contraseña

DO $$
BEGIN
    -- Verificar si la columna existe y si tiene restricción NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password'
        AND is_nullable = 'NO'
    ) THEN
        -- Cambiar la columna para permitir NULL
        ALTER TABLE public.users
        ALTER COLUMN password DROP NOT NULL;
        
        -- Agregar comentario para documentación
        COMMENT ON COLUMN public.users.password IS 'Contraseña del usuario (hasheada). NULL para usuarios de Gmail que usan OAuth.';
    END IF;
END
$$;

