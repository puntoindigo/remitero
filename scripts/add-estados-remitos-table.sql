-- Script para agregar tabla estados_remitos y migrar datos existentes

-- 1. Crear tabla estados_remitos
CREATE TABLE estados_remitos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#6b7280', -- Color en formato hex
    icon VARCHAR(10) NOT NULL DEFAULT '📋', -- Emoji o icono
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false, -- Para identificar estados predefinidos
    sort_order INTEGER NOT NULL DEFAULT 0, -- Para ordenar los estados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- 2. Crear índice para mejorar performance
CREATE INDEX idx_estados_remitos_company_id ON estados_remitos(company_id);
CREATE INDEX idx_estados_remitos_active ON estados_remitos(is_active);

-- 3. Insertar estados predefinidos para cada empresa existente
INSERT INTO estados_remitos (company_id, name, description, color, icon, is_active, is_default, sort_order)
SELECT 
    c.id as company_id,
    'Pendiente' as name,
    'Remito creado, esperando procesamiento' as description,
    '#f59e0b' as color,
    '⏰' as icon,
    true as is_active,
    true as is_default,
    1 as sort_order
FROM companies c
UNION ALL
SELECT 
    c.id as company_id,
    'Preparado' as name,
    'Remito preparado para entrega' as description,
    '#10b981' as color,
    '✅' as icon,
    true as is_active,
    true as is_default,
    2 as sort_order
FROM companies c
UNION ALL
SELECT 
    c.id as company_id,
    'Entregado' as name,
    'Remito entregado al cliente' as description,
    '#3b82f6' as color,
    '🚚' as icon,
    true as is_active,
    true as is_default,
    3 as sort_order
FROM companies c
UNION ALL
SELECT 
    c.id as company_id,
    'Cancelado' as name,
    'Remito cancelado' as description,
    '#ef4444' as color,
    '❌' as icon,
    true as is_active,
    true as is_default,
    4 as sort_order
FROM companies c;

-- 4. Crear trigger para actualizar updated_at
CREATE TRIGGER update_estados_remitos_updated_at 
    BEFORE UPDATE ON estados_remitos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Agregar columna estado_id a la tabla remitos (opcional, para futuras mejoras)
-- ALTER TABLE remitos ADD COLUMN estado_id UUID REFERENCES estados_remitos(id) ON DELETE SET NULL;

-- 6. Crear función para obtener estados activos de una empresa
CREATE OR REPLACE FUNCTION get_estados_activos_empresa(empresa_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(10),
    is_active BOOLEAN,
    is_default BOOLEAN,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id,
        er.name,
        er.description,
        er.color,
        er.icon,
        er.is_active,
        er.is_default,
        er.sort_order
    FROM estados_remitos er
    WHERE er.company_id = empresa_id 
    AND er.is_active = true
    ORDER BY er.sort_order, er.name;
END;
$$ LANGUAGE plpgsql;
