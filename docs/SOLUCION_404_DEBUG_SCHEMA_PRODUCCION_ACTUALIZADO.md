# 🔍 Solución: 404 en `/api/debug/schema` en Producción (Actualizado)

## 🚨 Problema

El endpoint `/api/debug/schema` funciona correctamente en desarrollo (`remitero-dev.vercel.app`) pero da **404** en producción (`v0-remitero.vercel.app`), **aunque el archivo existe en `main`**.

## 🔍 Verificación

El endpoint **SÍ existe en `main`**:
- Commit: `313814b fix: Usar host del request para detectar entorno en endpoint de debug`
- Archivo: `src/app/api/debug/schema/route.ts`
- Función: `export async function GET(request: NextRequest)`

## 🔍 Posibles Causas

### 1. Build de Vercel no incluye el endpoint

El `outputFileTracingRoot` en `next.config.js` puede estar causando que Next.js no incluya el endpoint en el build de producción.

### 2. Caché de Vercel

Vercel puede estar sirviendo una versión antigua del build que no incluye el endpoint.

### 3. Middleware bloqueando (YA CORREGIDO)

El middleware ahora permite `/api/debug` explícitamente.

## ✅ Soluciones

### Solución 1: Forzar Rebuild en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Deployments**
4. Busca el deployment de Production más reciente
5. Haz clic en los tres puntos (⋯) → **"Redeploy"**
6. Marca **"Use existing Build Cache"** como **deshabilitado**
7. Haz clic en **"Redeploy"**

Esto forzará un rebuild completo que debería incluir el endpoint.

### Solución 2: Verificar Build Localmente

```bash
# Hacer build local para verificar que el endpoint se incluye
npm run build

# Verificar que el endpoint está en .next/server/app/api/debug/schema/route.js
ls -la .next/server/app/api/debug/schema/
```

Si el archivo no existe en el build local, hay un problema con la configuración de Next.js.

### Solución 3: Verificar Logs de Build en Vercel

1. Ve a Vercel Dashboard → **Deployments**
2. Selecciona el deployment de Production más reciente
3. Haz clic en **"Build Logs"**
4. Busca errores relacionados con:
   - `api/debug/schema`
   - `outputFileTracing`
   - `route.ts`

### Solución 4: Hacer Deploy Manual Forzando Rebuild

```bash
# Desde la raíz del proyecto
vercel --prod --force
```

El flag `--force` fuerza un rebuild completo sin usar caché.

### Solución 5: Verificar `next.config.js`

El `outputFileTracingRoot` puede estar causando problemas. Prueba comentarlo temporalmente:

```javascript
// next.config.js
const nextConfig = {
  // ... otras configuraciones
  // outputFileTracingRoot: __dirname, // Comentar temporalmente
}
```

Luego hacer rebuild y verificar si el endpoint funciona.

## 🔍 Debugging Adicional

### Verificar que el endpoint está en el código de producción

1. Ve a Vercel Dashboard → **Deployments** → Production más reciente
2. Haz clic en **"Source"** o **"View Source"**
3. Busca `src/app/api/debug/schema/route.ts`
4. Verifica que el archivo está presente

### Verificar logs en tiempo real

1. Ve a Vercel Dashboard → **Deployments** → Production más reciente
2. Haz clic en **"Functions"** o **"Serverless Functions"**
3. Busca `/api/debug/schema`
4. Si no aparece, el endpoint no se está incluyendo en el build

### Verificar respuesta del servidor

Intenta acceder directamente:
```bash
curl -v https://v0-remitero.vercel.app/api/debug/schema
```

Si obtienes un 404, el endpoint no existe en producción.
Si obtienes un 500, el endpoint existe pero hay un error en el código.

## 🎯 Recomendación Inmediata

1. **Hacer Redeploy sin caché** (Solución 1)
2. Si sigue sin funcionar, **verificar build local** (Solución 2)
3. Si el build local funciona, **hacer deploy manual con `--force`** (Solución 4)

## 📝 Nota sobre el Error 500 en Localhost

El error 500 en localhost es por un conflicto con `favicon.ico`:
- Había un `favicon.ico` en `src/app/` y otro en `public/`
- Next.js no permite archivos públicos y páginas con el mismo nombre
- **Solución**: Eliminé `src/app/favicon.ico` (ya está en `public/`)

---

**Última actualización**: Noviembre 2024

