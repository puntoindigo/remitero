-- Script para hacer daeiman@gmail.com SUPERADMIN
-- Ejecutar en Supabase SQL Editor

-- Primero, verificar si el usuario existe
SELECT id, email, name, role, company_id 
FROM users 
WHERE email = 'daeiman@gmail.com';

-- Si el usuario no existe, crearlo como SUPERADMIN
INSERT INTO users (
  id,
  email,
  name,
  password,
  role,
  company_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'daeiman@gmail.com',
  'Daeiman Admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
  'SUPERADMIN',
  NULL, -- SUPERADMIN no tiene company_id
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'SUPERADMIN',
  company_id = NULL,
  updated_at = NOW();

-- Verificar el resultado
SELECT id, email, name, role, company_id, created_at
FROM users 
WHERE email = 'daeiman@gmail.com';

-- Opcional: Crear una empresa de prueba si no existe
INSERT INTO companies (
  id,
  name,
  email,
  phone,
  address,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Empresa de Prueba',
  'test@empresa.com',
  '+54 11 1234-5678',
  'Dirección de prueba',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Verificar empresas existentes
SELECT id, name, email FROM companies;
