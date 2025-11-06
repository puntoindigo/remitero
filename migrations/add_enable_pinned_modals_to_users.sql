-- Agregar columna enable_pinned_modals a la tabla users
-- Esta columna controla si el usuario puede usar la funcionalidad de modales anclados

-- Verificar si la columna ya existe antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'enable_pinned_modals'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN enable_pinned_modals BOOLEAN NOT NULL DEFAULT false;
        
        -- Crear un comentario en la columna para documentación
        COMMENT ON COLUMN users.enable_pinned_modals IS 'Habilita la funcionalidad de modales anclados para el usuario';
    END IF;
END $$;

