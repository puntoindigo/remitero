# ✅ Verificar URLs por Entorno

## 📧 Emails de Invitación

### Código Actual

Los emails de invitación usan `process.env.NEXTAUTH_URL` para construir el link de login:

**En `src/app/api/users/route.ts`:**
```typescript
const loginUrl = process.env.NEXTAUTH_URL 
  ? `${process.env.NEXTAUTH_URL.replace(/\/$/, '')}/auth/login`
  : 'https://remitero-dev.vercel.app/auth/login';
```

**En `src/app/api/users/[id]/resend-invitation/route.ts`:**
```typescript
const loginUrl = process.env.NEXTAUTH_URL 
  ? `${process.env.NEXTAUTH_URL.trim()}/auth/login`
  : 'https://remitero-dev.vercel.app/auth/login';
```

### ✅ Estado: CORRECTO

- ✅ Usa `process.env.NEXTAUTH_URL` (variable de entorno)
- ✅ Fallback solo para desarrollo local
- ✅ Se construye dinámicamente según el entorno

## 🌐 Navegación

### Código Actual

La navegación usa rutas relativas que Next.js maneja automáticamente:

- ✅ `router.push('/dashboard')` - Ruta relativa
- ✅ `router.replace('/remitos')` - Ruta relativa
- ✅ `window.location.href = '/auth/login'` - Ruta relativa

### ✅ Estado: CORRECTO

- ✅ No hay URLs hardcodeadas de producción o desarrollo
- ✅ Todas las rutas son relativas
- ✅ Next.js maneja automáticamente según la URL actual

## 🔧 Verificación en Vercel

### Paso 1: Verificar Variables de Entorno en Preview

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto → **Settings** → **Environment Variables**
3. Filtra por **Preview** environment
4. Verifica que `NEXTAUTH_URL` esté configurado como:
   ```
   https://remitero-dev.vercel.app
   ```

### Paso 2: Verificar Variables de Entorno en Production

1. En la misma página, filtra por **Production** environment
2. Verifica que `NEXTAUTH_URL` esté configurado como:
   ```
   https://v0-remitero.vercel.app
   ```
   O
   ```
   https://remitero-prod.vercel.app
   ```
   (según cuál sea tu URL de producción)

### Paso 3: Probar Email desde Preview

1. En `remitero-dev.vercel.app`, crea un nuevo usuario
2. Verifica que el email recibido tenga el link:
   ```
   https://remitero-dev.vercel.app/auth/login
   ```

### Paso 4: Probar Email desde Production

1. En `v0-remitero.vercel.app`, crea un nuevo usuario
2. Verifica que el email recibido tenga el link:
   ```
   https://v0-remitero.vercel.app/auth/login
   ```
   (o la URL de producción correspondiente)

## 🎯 Resumen

### ✅ Emails de Invitación
- **Preview**: Usa `NEXTAUTH_URL` de Preview → `https://remitero-dev.vercel.app/auth/login`
- **Production**: Usa `NEXTAUTH_URL` de Production → `https://v0-remitero.vercel.app/auth/login`
- **Estado**: ✅ CORRECTO (siempre que `NEXTAUTH_URL` esté bien configurado en Vercel)

### ✅ Navegación
- **Todas las rutas son relativas** (`/dashboard`, `/remitos`, etc.)
- **Next.js maneja automáticamente** según la URL actual
- **Estado**: ✅ CORRECTO (no hay URLs hardcodeadas)

## ⚠️ Importante

**La única cosa que debes verificar es que `NEXTAUTH_URL` esté configurado correctamente en cada entorno de Vercel:**

- **Preview**: `NEXTAUTH_URL=https://remitero-dev.vercel.app`
- **Production**: `NEXTAUTH_URL=https://v0-remitero.vercel.app` (o tu URL de producción)

Si estas variables están bien configuradas, todo funcionará correctamente.

---

**Última actualización**: Noviembre 2024

