-- Migration: Agregar campo enable_botonera a la tabla users
-- Fecha: 2025-01-XX
-- Descripción: Campo opcional para habilitar la botonera de navegación en desarrollo

-- Agregar la columna enable_botonera si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'enable_botonera'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN enable_botonera BOOLEAN NOT NULL DEFAULT false;
        
        -- Comentario en la columna para documentación
        COMMENT ON COLUMN users.enable_botonera IS 'Habilita la botonera de navegación inferior (solo desarrollo). Por defecto false.';
        
        RAISE NOTICE 'Columna enable_botonera agregada exitosamente a la tabla users';
    ELSE
        RAISE NOTICE 'La columna enable_botonera ya existe en la tabla users';
    END IF;
END $$;

