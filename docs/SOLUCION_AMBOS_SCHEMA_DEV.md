# 🔧 Solución: Ambos Entornos Usando Schema "dev"

## 🚨 Problema Detectado

Ambos entornos (`remitero-dev.vercel.app` y `v0-remitero.vercel.app`) están usando el schema `dev`, cuando producción debería usar `public`.

**Causa**: `VERCEL_ENV` no está configurado o no está siendo detectado correctamente.

## ✅ Solución: Configurar Explícitamente en Vercel

### Paso 1: Configurar en Vercel Dashboard

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Configurar para Production

1. Haz clic en **Add New** (Agregar Nueva)
2. Configura:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `public`
   - **Environment**: ✅ **Production** (solo Production, NO Preview ni Development)
3. Haz clic en **Save**

### Paso 3: Verificar Preview/Development

1. Busca si existe `DATABASE_SCHEMA` para Preview/Development
2. Si existe y tiene valor `public` → **Cámbiala a `dev`**
3. Si existe y tiene valor `dev` → ✅ Está bien
4. Si no existe → **Créala**:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `dev`
   - **Environment**: ✅ **Preview**, ✅ **Development**

### Paso 4: Redeploy

1. Ve a **Deployments**
2. Para cada entorno (Production y Preview):
   - Haz clic en los **tres puntos** (⋯) del deployment más reciente
   - Selecciona **Redeploy**
   - Espera a que complete (1-3 minutos)

### Paso 5: Verificar

1. **Desarrollo**: `https://remitero-dev.vercel.app/api/debug/schema`
   - Debe mostrar: `"schema": "dev"`

2. **Producción**: `https://v0-remitero.vercel.app/api/debug/schema`
   - Debe mostrar: `"schema": "public"`

## 🔍 Verificación Adicional

### Ver Logs de Vercel

Después del redeploy, revisa los logs:

1. Ve a **Deployments** → Selecciona el deployment → **Logs**
2. Busca líneas que digan: `🗄️ [Supabase] Schema detectado:`

**En Producción deberías ver:**
```
🗄️ [Supabase] Schema detectado: public {
  vercelEnv: 'not-set',
  databaseSchemaEnv: 'public',
  finalSchema: 'public'
}
```

**En Desarrollo deberías ver:**
```
🗄️ [Supabase] Schema detectado: dev {
  vercelEnv: 'not-set',
  databaseSchemaEnv: 'dev',
  finalSchema: 'dev'
}
```

## ⚠️ Importante

El código ahora tiene una protección de seguridad:
- Si `DATABASE_SCHEMA=public` está configurado en Preview/Development, el código lo **ignora** y usa `dev` por seguridad.
- Esto previene errores de configuración que podrían causar que desarrollo modifique datos de producción.

## 📝 Resumen de Variables

### Production (en Vercel):
```env
DATABASE_SCHEMA=public
```

### Preview/Development (en Vercel):
```env
DATABASE_SCHEMA=dev
```

### Localhost (.env.local):
```env
DATABASE_SCHEMA=dev
```

## ✅ Checklist

- [ ] `DATABASE_SCHEMA=public` configurado en Vercel Production
- [ ] `DATABASE_SCHEMA=dev` configurado en Vercel Preview/Development
- [ ] Redeploy completado en ambos entornos
- [ ] Endpoint `/api/debug/schema` muestra schema correcto en cada entorno
- [ ] Logs de Vercel muestran el schema correcto
- [ ] Prueba de creación de datos funciona correctamente

