# 🔍 Solución: 404 en `/api/debug/schema` en Producción

## 🚨 Problema

El endpoint `/api/debug/schema` funciona correctamente en desarrollo (`remitero-dev.vercel.app`) pero da **404** en producción (`v0-remitero.vercel.app`).

## 🔍 Causa

El endpoint `/api/debug/schema` está implementado en el branch `develop` pero **no está en `main`**. Por lo tanto, cuando Vercel despliega desde `main` (producción), el endpoint no existe.

## ✅ Solución

### Opción 1: Hacer Merge a `main` (Recomendado)

Si quieres que el endpoint esté disponible en producción:

1. **Verificar que todo esté listo en `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Hacer merge a `main`**:
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

3. **Esperar el deploy automático de Vercel** (o hacer deploy manual con `vercel --prod`)

4. **Verificar que funciona**:
   - Abre: `https://v0-remitero.vercel.app/api/debug/schema`
   - Deberías ver un JSON con información del schema

### Opción 2: Verificar Schema sin el Endpoint

Si no quieres hacer merge todavía, puedes verificar el schema de otras formas:

#### A. Ver Logs de Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Deployments** → Selecciona el deployment de Production más reciente
4. Haz clic en **"Logs"**
5. Busca líneas que digan: `🗄️ [Supabase] Schema detectado:`
6. Deberías ver:
   ```
   🗄️ [Supabase] Schema detectado: public {
     databaseSchemaEnv: 'public',
     finalSchema: 'public'
   }
   ```

#### B. Verificar Variables de Entorno en Vercel

1. Ve a **Settings** → **Environment Variables**
2. Verifica que `DATABASE_SCHEMA=public` esté configurado para **Production**
3. Verifica que `DATABASE_SCHEMA=dev` esté configurado para **Preview/Development**

#### C. Verificar en Código

El código en `src/lib/supabase.ts` detecta automáticamente el schema según:
- `VERCEL_ENV === 'production'` → usa `public`
- `VERCEL_ENV === 'preview'` o `development` → usa `dev`
- `DATABASE_SCHEMA` explícito (si está configurado)

## 📝 Nota sobre el Middleware

El middleware (`src/middleware.ts`) **NO bloquea** las rutas `/api/*` porque el `matcher` solo incluye páginas:

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/remitos/:path*",
    // ... otras páginas, pero NO /api/*
  ]
}
```

Por lo tanto, el 404 **NO es causado por el middleware**, sino porque el archivo simplemente no existe en `main`.

## 🎯 Recomendación

**Hacer merge a `main`** para que el endpoint esté disponible en producción. Es útil para debugging y verificación de schemas.

---

**Última actualización**: Noviembre 2024

