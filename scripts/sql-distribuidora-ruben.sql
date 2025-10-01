-- =============================================
-- SCRIPT SQL PARA POBLAR DISTRIBUIDORA RUBEN
-- =============================================
-- Ejecutar estas sentencias manualmente en Supabase SQL Editor

-- 1. OBTENER ID DE LA EMPRESA DISTRIBUIDORA RUBEN
-- (Ejecutar primero para obtener el company_id)
SELECT id, name FROM companies WHERE name = 'Distribuidora Ruben';

-- 2. CREAR CATEGORÍAS
-- (Reemplazar 'TU_COMPANY_ID_AQUI' con el ID obtenido en el paso 1)

INSERT INTO categories (id, company_id, name, created_at, updated_at) VALUES
-- Cervezas
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Cervezas', NOW(), NOW()),
-- Gaseosas  
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Gaseosas', NOW(), NOW()),
-- Energizantes
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Energizantes', NOW(), NOW()),
-- Aguas
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Aguas', NOW(), NOW()),
-- Servicios
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Servicios', NOW(), NOW()),
-- Vinos
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Vinos', NOW(), NOW()),
-- Aperitivos
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Aperitivos', NOW(), NOW()),
-- Bebidas Especiales
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'Bebidas Especiales', NOW(), NOW());

-- 3. OBTENER IDs DE LAS CATEGORÍAS CREADAS
-- (Ejecutar para obtener los category_ids)
SELECT id, name FROM categories WHERE company_id = 'TU_COMPANY_ID_AQUI' ORDER BY name;

-- 4. CREAR PRODUCTOS
-- (Reemplazar los IDs de categorías con los obtenidos en el paso 3)

INSERT INTO products (id, company_id, category_id, name, description, price, stock, created_at, updated_at) VALUES

-- CERVEZAS (reemplazar CATEGORIA_CERVEZAS_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_CERVEZAS_ID', 'Brahma x12', 'Cerveza Brahma pack x12', 29500, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_CERVEZAS_ID', 'Quilmes x12', 'Cerveza Quilmes pack x12', 29500, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_CERVEZAS_ID', 'Stella x12', 'Cerveza Stella Artois pack x12', 44000, 100, NOW(), NOW()),

-- GASEOSAS (reemplazar CATEGORIA_GASEOSAS_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_GASEOSAS_ID', 'Coca x8 Retornable', 'Coca Cola x8 botellas retornables', 20800, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_GASEOSAS_ID', 'Coca x6', 'Coca Cola x6 botellas', 17300, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_GASEOSAS_ID', 'Coca x12', 'Coca Cola x12 botellas', 14800, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_GASEOSAS_ID', 'Coca x8', 'Coca Cola x8 botellas', 23000, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_GASEOSAS_ID', 'Coca Lata x6', 'Coca Cola x6 latas', 5800, 100, NOW(), NOW()),

-- ENERGIZANTES (reemplazar CATEGORIA_ENERGIZANTES_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_ENERGIZANTES_ID', 'Monster x6', 'Monster Energy x6 latas', 13600, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_ENERGIZANTES_ID', 'Power x6', 'Power Energy x6 latas', 9950, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_ENERGIZANTES_ID', 'Cunnington x6', 'Cunnington Energy x6 latas', 8800, 100, NOW(), NOW()),

-- AGUAS (reemplazar CATEGORIA_AGUAS_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_AGUAS_ID', 'Saborizada x6', 'Agua saborizada x6 botellas', 7850, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_AGUAS_ID', 'Saborizada x12', 'Agua saborizada x12 botellas', 9000, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_AGUAS_ID', 'Agua x6', 'Agua mineral x6 botellas', 5800, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_AGUAS_ID', 'Agua x1L', 'Agua mineral 1 litro', 8500, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_AGUAS_ID', 'Agua x12 Gas', 'Agua con gas x12 botellas', 8950, 100, NOW(), NOW()),

-- SERVICIOS (reemplazar CATEGORIA_SERVICIOS_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_SERVICIOS_ID', 'Envío', 'Servicio de envío a domicilio', 4000, 100, NOW(), NOW()),

-- VINOS (reemplazar CATEGORIA_VINOS_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_VINOS_ID', 'Toro Caja x12', 'Vino Toro caja x12 botellas', 18000, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_VINOS_ID', 'Toro Litro x12', 'Vino Toro litro x12 botellas', 22000, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_VINOS_ID', 'SiCom x6', 'Vino SiCom x6 botellas', 6900, 100, NOW(), NOW()),

-- APERITIVOS (reemplazar CATEGORIA_APERITIVOS_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_APERITIVOS_ID', 'Fernet Litro', 'Fernet Branca 1 litro', 18900, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_APERITIVOS_ID', 'Gancia Litro', 'Gancia 1 litro', 5990, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_APERITIVOS_ID', 'Cinzano Litro', 'Cinzano 1 litro', 6950, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_APERITIVOS_ID', 'Obrero Litro', 'Obrero 1 litro', 4450, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_APERITIVOS_ID', 'Cynar Litro', 'Cynar 1 litro', 8680, 100, NOW(), NOW()),

-- BEBIDAS ESPECIALES (reemplazar CATEGORIA_BEBIDAS_ESPECIALES_ID)
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_BEBIDAS_ESPECIALES_ID', 'Speed x12', 'Speed Energy x12 latas', 26700, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_BEBIDAS_ESPECIALES_ID', 'Sidra x6', 'Sidra x6 botellas', 14900, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_BEBIDAS_ESPECIALES_ID', 'Smirnoff', 'Smirnoff Vodka', 7400, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_BEBIDAS_ESPECIALES_ID', 'Otro Loco x6', 'Otro Loco x6 botellas', 21500, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_BEBIDAS_ESPECIALES_ID', 'Valentin x6', 'Valentin x6 botellas', 18900, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_BEBIDAS_ESPECIALES_ID', 'Estancia MZA x6', 'Estancia Mendoza x6 botellas', 16900, 100, NOW(), NOW()),
(gen_random_uuid(), 'TU_COMPANY_ID_AQUI', 'CATEGORIA_BEBIDAS_ESPECIALES_ID', 'M. Torino x6', 'Martini Torino x6 botellas', 8500, 100, NOW(), NOW());

-- 5. VERIFICAR RESULTADOS
-- (Ejecutar para confirmar que todo se creó correctamente)

-- Ver categorías creadas
SELECT c.name as categoria, COUNT(p.id) as cantidad_productos
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
WHERE c.company_id = 'TU_COMPANY_ID_AQUI'
GROUP BY c.id, c.name
ORDER BY c.name;

-- Ver todos los productos creados
SELECT p.name as producto, c.name as categoria, p.price as precio
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.company_id = 'TU_COMPANY_ID_AQUI'
ORDER BY c.name, p.name;

-- =============================================
-- INSTRUCCIONES DE USO:
-- =============================================
-- 1. Ejecutar paso 1 para obtener el company_id
-- 2. Reemplazar 'TU_COMPANY_ID_AQUI' con el ID real
-- 3. Ejecutar paso 2 para crear categorías
-- 4. Ejecutar paso 3 para obtener los category_ids
-- 5. Reemplazar los CATEGORIA_*_ID con los IDs reales
-- 6. Ejecutar paso 4 para crear productos
-- 7. Ejecutar paso 5 para verificar resultados
