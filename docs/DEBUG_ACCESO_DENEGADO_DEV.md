# 🔍 Debug: Acceso Denegado en Dev (remitero-dev.vercel.app)

## 🚨 Problema

Al intentar loguearse con Google OAuth en `remitero-dev.vercel.app`, se muestra el error "Acceso Denegado" (`AccessDenied`).

## 🔍 Análisis

El error `AccessDenied` se produce cuando el callback `signIn` de NextAuth retorna `false`. Esto puede suceder por:

1. **Usuario no existe en el schema `dev`**: El schema está vacío o no tiene usuarios
2. **Usuario tiene `is_active = false`**: El usuario existe pero está desactivado
3. **Error en la consulta a Supabase**: Problema con permisos, schema incorrecto, etc.
4. **`is_active` es `null` o `undefined`**: Debería tratarse como activo por defecto

## 📋 Pasos para Diagnosticar

### 1. Verificar Logs en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`v0-remitero`)
3. Ve a **Deployments** → Selecciona el deployment más reciente de `develop`
4. Haz clic en **"Logs"** o **"Function Logs"**
5. Busca los siguientes prefijos:
   - `🔐 [NextAuth signIn]`
   - `✅ [NextAuth signIn] Usuario existente encontrado:`
   - `❌ [NextAuth signIn] Usuario desactivado`
   - `🗄️ [Supabase] Schema detectado:`

### 2. Verificar Schema Detectado

En los logs, busca:
```
🗄️ [Supabase] Schema detectado: dev {
  vercelEnv: 'preview',
  databaseSchemaEnv: 'dev',
  vercelUrl: 'remitero-dev.vercel.app',
  finalSchema: 'dev'
}
```

**Si el schema es `public` en lugar de `dev`**, ese es el problema.

### 3. Verificar Usuario en BD

En los logs, busca:
```
✅ [NextAuth signIn] Usuario existente encontrado: {
  id: '...',
  email: '...',
  is_active: true/false/null/undefined,
  is_active_type: 'boolean'/'object',
  schema: 'dev'
}
```

**Qué buscar:**
- Si `is_active` es `false` → Usuario está desactivado
- Si `is_active` es `null` o `undefined` → Debería tratarse como activo (comportamiento por defecto)
- Si no aparece este log → Usuario no existe en el schema `dev`

### 4. Verificar si el Schema `dev` está Vacío

Si el schema `dev` está vacío, necesitas copiar datos de producción:

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el script: `migrations/copy_data_prod_to_dev.sql`
3. Esto copiará todos los datos de `public` a `dev`

## ✅ Soluciones

### Solución 1: Schema `dev` Vacío

Si el schema `dev` no tiene usuarios:

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta: `migrations/copy_data_prod_to_dev.sql`
3. Esto copiará todos los usuarios de `public` a `dev`
4. Intenta loguearte nuevamente

### Solución 2: Usuario con `is_active = false`

Si el usuario existe pero está desactivado:

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta:
```sql
-- Activar usuario en schema dev
UPDATE dev.users 
SET is_active = true 
WHERE email = 'tu-email@gmail.com';
```

### Solución 3: Schema Incorrecto

Si los logs muestran que se está usando `public` en lugar de `dev`:

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica que `DATABASE_SCHEMA=dev` esté configurado para **Preview/Development**
3. Verifica que `VERCEL_ENV` no esté configurado como `production` en desarrollo

### Solución 4: `is_active` es `null` o `undefined`

El código ahora trata `null` o `undefined` como activo por defecto. Si aún así falla:

1. Verifica los logs para ver el valor exacto de `is_active`
2. Si es `null` o `undefined`, debería funcionar con el código actualizado
3. Si no funciona, actualiza manualmente en Supabase:
```sql
UPDATE dev.users 
SET is_active = true 
WHERE is_active IS NULL;
```

## 📝 Logs Esperados

### Login Exitoso:
```
🔐 [NextAuth signIn] Email encontrado: tu-email@gmail.com
🔐 [NextAuth signIn] Buscando usuario en BD... { email: '...', schema: 'dev' }
✅ [NextAuth signIn] Usuario existente encontrado: { id: '...', is_active: true, ... }
✅ [NextAuth signIn] Usuario está activo (o null/undefined = activo por defecto)
✅ [NextAuth signIn] Login con Google exitoso, retornando true
```

### Usuario Desactivado:
```
✅ [NextAuth signIn] Usuario existente encontrado: { id: '...', is_active: false, ... }
❌ [NextAuth signIn] Usuario desactivado, denegando acceso
```

### Usuario No Existe:
```
🔐 [NextAuth signIn] Buscando usuario en BD... { email: '...', schema: 'dev' }
ℹ️ [NextAuth signIn] Usuario no existe (PGRST116), se creará uno nuevo
✅ [NextAuth signIn] Nuevo usuario creado: ...
```

### Error en Consulta:
```
❌ [NextAuth signIn] Error buscando usuario: {
  error: '...',
  code: '...',
  schema: 'dev'
}
```

## 🎯 Próximos Pasos

1. **Revisa los logs en Vercel** después de intentar loguearte
2. **Comparte los logs relevantes** (especialmente los que empiezan con `🔐 [NextAuth signIn]`)
3. **Verifica el schema detectado** en los logs
4. **Verifica si el usuario existe** en el schema `dev`

---

**Última actualización**: Noviembre 2024

