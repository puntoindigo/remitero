-- ==========================================
-- HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ==========================================
-- Este script habilita RLS en todas las tablas del schema public
-- IMPORTANTE: Después de habilitar RLS, necesitarás crear políticas para permitir acceso
-- 
-- ⚠️ ADVERTENCIA: Si habilitas RLS sin políticas, nadie podrá acceder a los datos
-- excepto el rol postgres y service_role
--
-- Este script también crea políticas básicas que permiten acceso a usuarios autenticados
-- usando el service_role (que es lo que usa tu aplicación con supabaseAdmin)

-- ==========================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ==========================================

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
-- NOTA IMPORTANTE SOBRE POLÍTICAS RLS
-- ==========================================
-- 
-- Después de habilitar RLS, necesitas crear políticas para permitir acceso.
-- 
-- IMPORTANTE: Tu aplicación usa `supabaseAdmin` que usa el `service_role` key,
-- que BYPASSEA RLS automáticamente. Por lo tanto, habilitar RLS NO debería
-- romper tu aplicación actual.
--
-- Sin embargo, si en el futuro quieres usar el cliente público de Supabase
-- (anon key), necesitarás crear políticas específicas.
--
-- Ejemplo de política básica (si necesitas acceso público):
-- CREATE POLICY "Allow authenticated users to read"
-- ON public.products FOR SELECT
-- TO authenticated
-- USING (true);
--
-- Ejemplo de política con aislamiento por empresa:
-- CREATE POLICY "Users can only see their company data"
-- ON public.products FOR SELECT
-- TO authenticated
-- USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()));
--
-- ==========================================
-- VERIFICAR ESTADO DE RLS
-- ==========================================
-- Ejecuta esta query para verificar qué tablas tienen RLS habilitado:
--
-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity as rls_enabled
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- ==========================================

