-- ==========================================
-- AGREGAR PREFERENCIA DE PAGINACIÓN A USUARIOS
-- ==========================================
-- Este script agrega un campo para guardar la preferencia de paginación del usuario
-- Valores permitidos: 10, 25, 50, 100 (por defecto: 10)

-- Agregar columna para preferencia de paginación
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS pagination_items_per_page INTEGER DEFAULT 10;

-- Agregar constraint para validar valores permitidos
ALTER TABLE IF EXISTS public.users
DROP CONSTRAINT IF EXISTS check_pagination_items_per_page;

ALTER TABLE IF EXISTS public.users
ADD CONSTRAINT check_pagination_items_per_page 
CHECK (pagination_items_per_page IN (10, 25, 50, 100));

-- Actualizar usuarios existentes con valor por defecto si no tienen uno
UPDATE public.users 
SET pagination_items_per_page = 10 
WHERE pagination_items_per_page IS NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN public.users.pagination_items_per_page IS 'Preferencia de paginación del usuario (10, 25, 50, 100 registros por página). Solo para ADMIN y SUPERADMIN.';

