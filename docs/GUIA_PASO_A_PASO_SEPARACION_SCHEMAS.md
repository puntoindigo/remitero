# 📋 Guía Paso a Paso: Verificar y Configurar Separación de Schemas

## 🎯 Objetivo

Asegurarnos de que **desarrollo** y **producción** usen schemas diferentes:
- **Desarrollo** (`remitero-dev.vercel.app`) → Schema `dev`
- **Producción** (`v0-remitero.vercel.app`) → Schema `public`

---

## 📍 Paso 1: Verificar el Estado Actual

### 1.1. Verificar Schema en Desarrollo

1. Abre tu navegador
2. Ve a: `https://remitero-dev.vercel.app/api/debug/schema`
3. Deberías ver un JSON como este:

```json
{
  "schema": "dev",
  "environment": {
    "vercelEnv": "preview",
    "vercelUrl": "remitero-dev-xxx.vercel.app",
    "databaseSchemaEnv": "dev",
    "nodeEnv": "production"
  },
  "detection": {
    "isProduction": false,
    "isPreview": true,
    "isDevelopment": false,
    "usingExplicitSchema": true
  },
  "message": "Este entorno está usando el schema: dev",
  "warning": "✅ Estás usando el schema DEV (desarrollo). Los cambios no afectarán producción."
}
```

**✅ Si ves `"schema": "dev"`** → Desarrollo está correcto  
**❌ Si ves `"schema": "public"`** → Necesitas configurar (ver Paso 2)

### 1.2. Verificar Schema en Producción

1. Abre tu navegador (o una ventana de incógnito)
2. Ve a: `https://v0-remitero.vercel.app/api/debug/schema`
3. Deberías ver un JSON como este:

```json
{
  "schema": "public",
  "environment": {
    "vercelEnv": "production",
    "vercelUrl": "v0-remitero.vercel.app",
    "databaseSchemaEnv": "not-set",
    "nodeEnv": "production"
  },
  "detection": {
    "isProduction": true,
    "isPreview": false,
    "isDevelopment": false,
    "usingExplicitSchema": false
  },
  "message": "Este entorno está usando el schema: public",
  "warning": "⚠️ Estás usando el schema PUBLIC (producción). Cualquier cambio afectará datos de producción."
}
```

**✅ Si ves `"schema": "public"`** → Producción está correcto  
**❌ Si ves `"schema": "dev"`** → Necesitas configurar (ver Paso 2)

---

## 🔧 Paso 2: Configurar Variables de Entorno en Vercel

### 2.1. Acceder a Vercel Dashboard

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Inicia sesión con tu cuenta
3. Busca y selecciona tu proyecto **remitero** (o el nombre que tenga)

### 2.2. Ir a Configuración de Variables de Entorno

1. En el menú lateral, haz clic en **Settings** (Configuración)
2. En el submenú, haz clic en **Environment Variables** (Variables de Entorno)

### 2.3. Configurar para Production

1. Busca si ya existe una variable llamada `DATABASE_SCHEMA`
   - Si existe y tiene valor `public` → ✅ Está bien, no toques nada
   - Si existe y tiene valor `dev` → ❌ **Bórrala** (el código detecta automáticamente producción)
   - Si no existe → ✅ No necesitas crearla (el código detecta automáticamente)

2. **Recomendación**: Si quieres ser explícito, agrega:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `public`
   - **Environment**: Marca SOLO ✅ **Production**
   - Haz clic en **Save**

### 2.4. Configurar para Preview/Development

1. Busca si ya existe una variable llamada `DATABASE_SCHEMA` para Preview/Development
   - Si existe y tiene valor `dev` → ✅ Está bien
   - Si existe y tiene valor `public` → ❌ **Cámbiala a `dev`**

2. Si no existe o necesitas crearla:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `dev`
   - **Environment**: Marca ✅ **Preview** y ✅ **Development**
   - Haz clic en **Save**

### 2.5. Verificar VERCEL_ENV (Automático)

**Nota importante**: `VERCEL_ENV` es una variable que Vercel configura automáticamente. No necesitas crearla manualmente. El código la detecta automáticamente:
- En producción: `VERCEL_ENV=production`
- En preview: `VERCEL_ENV=preview`
- En development: `VERCEL_ENV=development`

Si quieres verificar que existe:
1. En la misma página de Environment Variables
2. Busca `VERCEL_ENV`
3. Si no aparece, es normal - Vercel la inyecta automáticamente en runtime

---

## 🔄 Paso 3: Redeployar para Aplicar Cambios

### 3.1. Si Modificaste Variables de Entorno

1. Ve a la pestaña **Deployments** (Despliegues)
2. Encuentra el deployment más reciente
3. Haz clic en los **tres puntos** (⋯) a la derecha
4. Selecciona **Redeploy** (Redesplegar)
5. Marca la casilla **Use existing Build Cache** (opcional, más rápido)
6. Haz clic en **Redeploy**

### 3.2. Esperar a que Complete

1. El redeploy puede tardar 1-3 minutos
2. Verás el progreso en tiempo real
3. Cuando termine, deberías ver un ✅ verde

---

## ✅ Paso 4: Verificar que Funcionó

### 4.1. Verificar Desarrollo (Después del Redeploy)

1. Espera 1-2 minutos después del redeploy
2. Ve a: `https://remitero-dev.vercel.app/api/debug/schema`
3. Verifica que muestre:
   - `"schema": "dev"`
   - `"warning": "✅ Estás usando el schema DEV..."`

### 4.2. Verificar Producción (Después del Redeploy)

1. Espera 1-2 minutos después del redeploy
2. Ve a: `https://v0-remitero.vercel.app/api/debug/schema`
3. Verifica que muestre:
   - `"schema": "public"`
   - `"warning": "⚠️ Estás usando el schema PUBLIC..."`

### 4.3. Probar Separación con Datos Reales

#### En Desarrollo:
1. Inicia sesión en `https://remitero-dev.vercel.app`
2. Crea un cliente de prueba con nombre: `TEST-DEV-123`
3. Verifica en Supabase SQL Editor:
   ```sql
   -- Debe aparecer en dev
   SELECT * FROM dev.clients WHERE name LIKE '%TEST-DEV%';
   
   -- NO debe aparecer en public
   SELECT * FROM public.clients WHERE name LIKE '%TEST-DEV%';
   ```

#### En Producción:
1. Inicia sesión en `https://v0-remitero.vercel.app`
2. Crea un cliente de prueba con nombre: `TEST-PROD-123`
3. Verifica en Supabase SQL Editor:
   ```sql
   -- Debe aparecer en public
   SELECT * FROM public.clients WHERE name LIKE '%TEST-PROD%';
   
   -- NO debe aparecer en dev
   SELECT * FROM dev.clients WHERE name LIKE '%TEST-PROD%';
   ```

---

## 🔍 Paso 5: Verificar en Logs de Vercel

### 5.1. Ver Logs de Desarrollo

1. Ve a Vercel Dashboard → Tu proyecto → **Deployments**
2. Selecciona el deployment más reciente de **Preview/Development**
3. Haz clic en **Logs**
4. Busca líneas que digan: `🗄️ [Supabase] Schema detectado:`
5. Deberías ver: `Schema detectado: dev`

### 5.2. Ver Logs de Producción

1. Ve a Vercel Dashboard → Tu proyecto → **Deployments**
2. Selecciona el deployment más reciente de **Production**
3. Haz clic en **Logs**
4. Busca líneas que digan: `🗄️ [Supabase] Schema detectado:`
5. Deberías ver: `Schema detectado: public`

---

## ⚠️ Solución de Problemas

### Problema: Ambos entornos muestran el mismo schema

**Causa posible**: Variables de entorno no configuradas correctamente

**Solución**:
1. Ve a Vercel → Settings → Environment Variables
2. Elimina TODAS las variables `DATABASE_SCHEMA` existentes
3. Crea una nueva:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `dev`
   - **Environment**: ✅ Preview, ✅ Development (NO Production)
4. Para Production, NO agregues la variable (el código detecta automáticamente)
5. Redeploy ambos entornos

### Problema: Desarrollo muestra "public"

**Causa posible**: `DATABASE_SCHEMA=public` configurado en Preview/Development

**Solución**:
1. Ve a Vercel → Settings → Environment Variables
2. Busca `DATABASE_SCHEMA` en Preview/Development
3. Si tiene valor `public`, cámbialo a `dev`
4. Si no existe, créala con valor `dev`
5. Redeploy el entorno de desarrollo

### Problema: Producción muestra "dev"

**Causa posible**: `VERCEL_ENV` no está configurado o `DATABASE_SCHEMA=dev` en Production

**Solución**:
1. Ve a Vercel → Settings → Environment Variables
2. Busca `DATABASE_SCHEMA` en Production
3. Si existe, elimínala (el código detecta automáticamente producción)
4. Verifica que `VERCEL_ENV` esté siendo inyectado por Vercel (debería ser automático)
5. Redeploy producción

### Problema: No puedo acceder a `/api/debug/schema`

**Causa posible**: El endpoint aún no está desplegado

**Solución**:
1. Espera a que el deployment termine
2. Verifica que el código esté en el branch correcto
3. Si es necesario, haz un nuevo push a `develop` o `main`

---

## 📝 Checklist Final

Antes de considerar que todo está correcto, verifica:

- [ ] `/api/debug/schema` en desarrollo muestra `"schema": "dev"`
- [ ] `/api/debug/schema` en producción muestra `"schema": "public"`
- [ ] Variables de entorno configuradas correctamente en Vercel
- [ ] Logs de Vercel muestran el schema correcto
- [ ] Prueba de creación de datos funciona en cada entorno
- [ ] Datos en `dev` NO aparecen en `public` y viceversa
- [ ] No hay advertencias críticas en los logs

---

## 🎉 ¡Listo!

Si todos los checks están ✅, entonces desarrollo y producción están completamente separados y puedes trabajar con tranquilidad sabiendo que los cambios en desarrollo no afectarán producción.

