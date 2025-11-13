# 🔍 Verificar Separación de Schemas Dev/Prod

## 🚨 Problema Detectado

Si eliminas registros en `dev` y desaparecen en `prod` (o viceversa), significa que **ambos entornos están usando el mismo schema**.

## ✅ Solución: Verificar y Corregir

### Paso 1: Verificar qué Schema está usando cada entorno

#### En Desarrollo (remitero-dev.vercel.app)
1. Abre: `https://remitero-dev.vercel.app/api/debug/schema`
2. Deberías ver:
   ```json
   {
     "schema": "dev",
     "warning": "✅ Estás usando el schema DEV (desarrollo)..."
   }
   ```

#### En Producción (v0-remitero.vercel.app)
1. Abre: `https://v0-remitero.vercel.app/api/debug/schema`
2. Deberías ver:
   ```json
   {
     "schema": "public",
     "warning": "⚠️ Estás usando el schema PUBLIC (producción)..."
   }
   ```

### Paso 2: Si ambos están usando el mismo schema

#### Opción A: Verificar Variables de Entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

#### Para Production:
- **Key**: `DATABASE_SCHEMA`
- **Value**: `public` (o déjalo vacío - el código detectará automáticamente)
- **Environment**: ✅ Production (solo)

#### Para Preview/Development:
- **Key**: `DATABASE_SCHEMA`
- **Value**: `dev`
- **Environment**: ✅ Preview, ✅ Development

#### Opción B: Verificar VERCEL_ENV

El código detecta automáticamente el entorno usando `VERCEL_ENV`:
- `VERCEL_ENV=production` → usa `public`
- `VERCEL_ENV=preview` o `development` → usa `dev`
- Si no está configurado → usa `dev` por defecto

**Verifica que `VERCEL_ENV` esté configurado correctamente en Vercel** (esto debería estar automático, pero verifica).

### Paso 3: Verificar en Supabase

Ejecuta en Supabase SQL Editor:

```sql
-- Verificar que existen ambos schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name IN ('public', 'dev');

-- Verificar datos en cada schema
SELECT 'public' as schema, COUNT(*) as users FROM public.users
UNION ALL
SELECT 'dev' as schema, COUNT(*) as users FROM dev.users;
```

### Paso 4: Probar Separación

1. **En desarrollo** (`remitero-dev.vercel.app`):
   - Crea un registro de prueba (ej: un cliente)
   - Verifica en Supabase: `SELECT * FROM dev.clients WHERE name = 'Test Dev';`
   - Debería aparecer SOLO en `dev`, NO en `public`

2. **En producción** (`v0-remitero.vercel.app`):
   - Crea un registro de prueba diferente
   - Verifica en Supabase: `SELECT * FROM public.clients WHERE name = 'Test Prod';`
   - Debería aparecer SOLO en `public`, NO en `dev`

## 🔧 Si el Problema Persiste

### Verificar Logs del Servidor

El código ahora loggea el schema usado en cada request. Revisa los logs de Vercel:

1. Ve a Vercel Dashboard → Tu proyecto → **Deployments**
2. Selecciona el deployment → **Logs**
3. Busca líneas que digan: `🗄️ [Supabase] Schema detectado:`

Deberías ver:
- En producción: `Schema detectado: public`
- En desarrollo: `Schema detectado: dev`

### Forzar Schema Explícito

Si la detección automática no funciona, configura explícitamente:

**En Vercel Production:**
```env
DATABASE_SCHEMA=public
VERCEL_ENV=production
```

**En Vercel Preview/Development:**
```env
DATABASE_SCHEMA=dev
VERCEL_ENV=preview  # o development
```

## ⚠️ Advertencia de Seguridad

El código ahora incluye una validación de seguridad:
- Si `DATABASE_SCHEMA=public` está configurado en un entorno NO-producción, el código **ignorará** esa configuración y usará `dev` por seguridad.

Esto previene errores de configuración que podrían causar que desarrollo modifique datos de producción.

## 📝 Checklist de Verificación

- [ ] Endpoint `/api/debug/schema` muestra `schema: "dev"` en desarrollo
- [ ] Endpoint `/api/debug/schema` muestra `schema: "public"` en producción
- [ ] Variables de entorno configuradas correctamente en Vercel
- [ ] Logs de Vercel muestran el schema correcto
- [ ] Prueba de creación de datos funciona correctamente en cada entorno
- [ ] Datos en `dev` NO aparecen en `public` y viceversa

