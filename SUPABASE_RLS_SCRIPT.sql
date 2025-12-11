-- ==========================================
-- HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ==========================================
-- Ejecuta este script en Supabase SQL Editor
-- 
-- ⚠️ IMPORTANTE: Tu aplicación NO se romperá porque usa supabaseAdmin
-- que bypasea RLS automáticamente con el service_role key

-- Users
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Companies
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;

-- Products
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Clients
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;

-- Categories
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

-- Estados Remitos
ALTER TABLE IF EXISTS public.estados_remitos ENABLE ROW LEVEL SECURITY;

-- Remitos
ALTER TABLE IF EXISTS public.remitos ENABLE ROW LEVEL SECURITY;

-- Remito Items
ALTER TABLE IF EXISTS public.remito_items ENABLE ROW LEVEL SECURITY;

-- User Activity Logs
ALTER TABLE IF EXISTS public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Notification Preferences
ALTER TABLE IF EXISTS public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- VERIFICAR QUE RLS ESTÁ HABILITADO
-- ==========================================
-- Ejecuta esta query después para verificar:
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE '_%'
ORDER BY tablename;

