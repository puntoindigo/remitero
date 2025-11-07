-- Migración para actualizar el enum user_role: cambiar USER a OPERADOR
-- Este script actualiza el enum y todos los registros existentes

-- Paso 1: Agregar OPERADOR al enum si no existe
DO $$ 
BEGIN
    -- Verificar si OPERADOR ya existe en el enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'OPERADOR' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        -- Agregar OPERADOR al enum
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'OPERADOR';
        RAISE NOTICE 'OPERADOR agregado al enum user_role';
    ELSE
        RAISE NOTICE 'OPERADOR ya existe en el enum user_role';
    END IF;
END $$;

-- Paso 2: Actualizar todos los registros que tienen USER a OPERADOR
UPDATE users 
SET role = 'OPERADOR' 
WHERE role = 'USER';

-- Paso 3: (Opcional) Remover USER del enum si ya no se usa
-- NOTA: PostgreSQL no permite eliminar valores de un enum directamente
-- Si necesitas eliminar USER, tendrías que recrear el enum completo
-- Por ahora, dejamos USER en el enum por si acaso hay datos históricos

-- Verificar el resultado
DO $$ 
DECLARE
    user_count INTEGER;
    operador_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE role = 'USER';
    SELECT COUNT(*) INTO operador_count FROM users WHERE role = 'OPERADOR';
    
    RAISE NOTICE 'Usuarios con rol USER: %', user_count;
    RAISE NOTICE 'Usuarios con rol OPERADOR: %', operador_count;
END $$;

