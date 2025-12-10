# 🔒 Habilitar Row Level Security (RLS) en Supabase

## ⚠️ Problema Detectado

Supabase ha detectado que algunas tablas en el schema `public` no tienen Row Level Security (RLS) habilitado. Esto significa que cualquier persona con acceso a la URL del proyecto podría realizar operaciones CRUD (CREATE/READ/UPDATE/DELETE) en esas tablas si no están protegidas.

## ✅ Solución

Se ha creado un script SQL que habilita RLS en todas las tablas principales del sistema.

## 📋 Script Creado

El archivo `migrations/enable_rls_all_tables.sql` contiene el script para habilitar RLS en todas las tablas.

## 🚀 Cómo Ejecutar

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `migrations/enable_rls_all_tables.sql`
4. Copia y pega el contenido completo
5. Haz clic en **Run** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### Opción 2: Desde la línea de comandos

Si tienes acceso directo a la base de datos:

```bash
psql -h [tu-host] -U postgres -d postgres -f migrations/enable_rls_all_tables.sql
```

## 📊 Tablas que se Protegen

El script habilita RLS en las siguientes tablas:

- ✅ `users`
- ✅ `companies`
- ✅ `products`
- ✅ `clients`
- ✅ `categories`
- ✅ `estados_remitos`
- ✅ `remitos`
- ✅ `remito_items`
- ✅ `user_activity_logs`
- ✅ `notification_preferences`

## ⚠️ Importante: Tu Aplicación NO se Romperá

**Tu aplicación actual NO se verá afectada** porque:

1. **Usas `supabaseAdmin`**: Tu aplicación usa el cliente de Supabase con el `service_role` key, que **bypasea RLS automáticamente**. Esto significa que todas las operaciones desde tu aplicación Next.js seguirán funcionando normalmente.

2. **RLS solo afecta al cliente público**: RLS solo restringe el acceso cuando se usa el cliente público de Supabase (con el `anon` key), que tu aplicación NO usa actualmente.

## 🔍 Verificar que RLS está Habilitado

Después de ejecutar el script, puedes verificar el estado ejecutando esta query en el SQL Editor:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE '_%'
ORDER BY tablename;
```

Deberías ver `t` (true) en la columna `rls_enabled` para todas las tablas.

## 🔐 Políticas RLS (Opcional - Para el Futuro)

Actualmente, **NO necesitas crear políticas RLS** porque tu aplicación usa `supabaseAdmin` que bypasea RLS.

Sin embargo, si en el futuro quieres usar el cliente público de Supabase (anon key), necesitarás crear políticas. Ejemplos:

### Política Básica (Permitir lectura a usuarios autenticados)

```sql
CREATE POLICY "Allow authenticated users to read"
ON public.products FOR SELECT
TO authenticated
USING (true);
```

### Política con Aislamiento por Empresa

```sql
CREATE POLICY "Users can only see their company data"
ON public.products FOR SELECT
TO authenticated
USING (
  company_id = (
    SELECT company_id 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);
```

## ✅ Checklist Post-Ejecución

- [ ] Script ejecutado en Supabase SQL Editor
- [ ] Verificado que RLS está habilitado en todas las tablas
- [ ] Probado que la aplicación sigue funcionando normalmente
- [ ] (Opcional) Verificado en Supabase Dashboard que no hay errores

## 📝 Notas Adicionales

- **No hay riesgo**: Habilitar RLS NO romperá tu aplicación actual
- **Mejora la seguridad**: Protege tus datos de accesos no autorizados
- **Reversible**: Si necesitas deshabilitar RLS en alguna tabla, puedes ejecutar:
  ```sql
  ALTER TABLE public.[tabla] DISABLE ROW LEVEL SECURITY;
  ```

## 🆘 Si Algo Sale Mal

Si después de ejecutar el script algo deja de funcionar (aunque no debería):

1. Verifica que estás usando `supabaseAdmin` en tu código (deberías estarlo)
2. Revisa los logs de Supabase para ver si hay errores
3. Si es necesario, puedes deshabilitar RLS temporalmente:
   ```sql
   ALTER TABLE public.[tabla] DISABLE ROW LEVEL SECURITY;
   ```

---

**Última actualización**: Enero 2025

