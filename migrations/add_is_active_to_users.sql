-- migrations/add_is_active_to_users.sql

-- Agregar campo is_active a la tabla users si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
        
        -- Agregar comentario para documentación
        COMMENT ON COLUMN public.users.is_active IS 'Indica si el usuario está activo. Los usuarios inactivos no pueden iniciar sesión.';
        
        RAISE NOTICE 'Columna is_active agregada exitosamente a la tabla users';
    ELSE
        RAISE NOTICE 'La columna is_active ya existe en la tabla users';
    END IF;
END
$$;

