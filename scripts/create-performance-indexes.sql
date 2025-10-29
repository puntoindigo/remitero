-- Script SQL para crear índices que mejoran el rendimiento de las queries
-- Ejecutar este script en Supabase SQL Editor para mejorar significativamente el rendimiento

-- ==========================================
-- ÍNDICES PARA TABLA products
-- ==========================================
-- Índice para búsquedas por company_id (muy usado en filtros)
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);

-- Índice para búsquedas por category_id (usado en JOINs y filtros)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Índice compuesto para búsquedas por empresa y nombre (verificación de duplicados)
CREATE INDEX IF NOT EXISTS idx_products_company_name ON products(company_id, name);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ==========================================
-- ÍNDICES PARA TABLA categories
-- ==========================================
-- Índice para búsquedas por company_id (muy usado)
CREATE INDEX IF NOT EXISTS idx_categories_company_id ON categories(company_id);

-- Índice compuesto para verificación de nombres duplicados por empresa
CREATE INDEX IF NOT EXISTS idx_categories_company_name ON categories(company_id, name);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at DESC);

-- ==========================================
-- ÍNDICES PARA TABLA clients
-- ==========================================
-- Índice para búsquedas por company_id (muy usado)
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);

-- Índice compuesto para verificación de nombres duplicados por empresa
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_id, name);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- ==========================================
-- ÍNDICES PARA TABLA remitos
-- ==========================================
-- Índice para búsquedas por company_id (muy usado)
CREATE INDEX IF NOT EXISTS idx_remitos_company_id ON remitos(company_id);

-- Índice para búsquedas por client_id (usado en JOINs)
CREATE INDEX IF NOT EXISTS idx_remitos_client_id ON remitos(client_id);

-- Índice para búsquedas por status (usado en filtros y JOINs)
CREATE INDEX IF NOT EXISTS idx_remitos_status ON remitos(status);

-- Índice para búsquedas por created_by_id
CREATE INDEX IF NOT EXISTS idx_remitos_created_by_id ON remitos(created_by_id);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_remitos_created_at ON remitos(created_at DESC);

-- Índice para ordenamiento por fecha de actualización de estado
CREATE INDEX IF NOT EXISTS idx_remitos_status_at ON remitos(status_at DESC);

-- ==========================================
-- ÍNDICES PARA TABLA remito_items
-- ==========================================
-- Índice para búsquedas por remito_id (muy usado en JOINs)
CREATE INDEX IF NOT EXISTS idx_remito_items_remito_id ON remito_items(remito_id);

-- Índice para búsquedas por product_id
CREATE INDEX IF NOT EXISTS idx_remito_items_product_id ON remito_items(product_id);

-- ==========================================
-- ÍNDICES PARA TABLA users
-- ==========================================
-- Índice para búsquedas por company_id
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Índice para búsquedas por email (login y búsquedas)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ==========================================
-- ÍNDICES PARA TABLA estados_remitos
-- ==========================================
-- Índice para búsquedas por company_id (muy usado)
CREATE INDEX IF NOT EXISTS idx_estados_remitos_company_id ON estados_remitos(company_id);

-- Índice compuesto para búsquedas activas por empresa
CREATE INDEX IF NOT EXISTS idx_estados_remitos_company_active ON estados_remitos(company_id, is_active) WHERE is_active = true;

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_estados_remitos_created_at ON estados_remitos(created_at DESC);

-- ==========================================
-- ÍNDICES PARA TABLA companies
-- ==========================================
-- Índice para búsquedas por nombre (verificación de duplicados)
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- ==========================================
-- NOTAS DE OPTIMIZACIÓN
-- ==========================================
-- Estos índices mejoran significativamente:
-- 1. Queries con WHERE company_id = ...
-- 2. JOINs entre tablas relacionadas
-- 3. Verificaciones de duplicados (company_id + name)
-- 4. Ordenamientos por fecha de creación
-- 5. Filtros por status en remitos
-- 
-- Los índices compuestos (company_id, name) son especialmente útiles
-- para las verificaciones de nombres duplicados que se hacen frecuentemente
-- durante CREATE y UPDATE operations.
--
-- Los índices parciales (WHERE is_active = true) mejoran queries que
-- solo buscan registros activos sin necesidad de filtrar en memoria.


