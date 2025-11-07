# 📍 Ubicación Exacta de la Configuración de Redirección

## Flujo de Redirección después del Login con Google

### 1️⃣ **Lugar donde se INICIA la redirección (Login Page)**

**Archivo:** `src/app/auth/login/page.tsx`  
**Línea:** 390-393

```typescript
const result = await signIn("google", {
  redirect: true,
  callbackUrl: "/dashboard"  // ← AQUÍ se pasa el callbackUrl inicial
});
```

**Qué hace:** Pasa `callbackUrl: "/dashboard"` a NextAuth cuando el usuario hace click en "Acceder con Gmail".

---

### 2️⃣ **Lugar donde se PROCESA la redirección (NextAuth Callback)**

**Archivo:** `src/lib/auth.ts`  
**Línea:** 342-456  
**Función:** `async redirect({ url, baseUrl, token })`

Este es el callback que NextAuth ejecuta **después** de que Google redirige de vuelta a tu aplicación.

**Parámetros que recibe:**
- `url`: La URL que NextAuth quiere usar para redirigir (puede ser el `callbackUrl` original o una URL construida)
- `baseUrl`: La URL base de tu aplicación (ej: `https://remitero-dev.vercel.app`)
- `token`: El token JWT con la información del usuario (incluye `role`)

**Líneas clave:**

**Línea 404:** Determina el destino según el rol
```typescript
const destination = token?.role === 'SUPERADMIN' ? '/empresas' : '/dashboard';
```

**Líneas 407-419:** Detecta si viene de OAuth callback y construye la URL final
```typescript
if (normalizedUrl === cleanBaseUrl || 
    normalizedUrl === correctBaseUrl || 
    normalizedUrl.includes('/api/auth/callback') ||
    ...) {
  const finalUrl = correctBaseUrl + destination;  // ← AQUÍ se construye la URL final
  return normalizeUrl(finalUrl);  // ← AQUÍ se retorna la URL de redirección
}
```

**Líneas 422-426:** Si la URL es relativa, construye la URL completa
```typescript
if (normalizedUrl.startsWith("/")) {
  const finalUrl = correctBaseUrl + normalizedUrl;  // ← AQUÍ se construye
  return normalizeUrl(finalUrl);  // ← AQUÍ se retorna
}
```

---

## 🔍 El Problema

El problema está en que el parámetro `url` que llega al callback `redirect` (línea 342) **ya viene mal formado** desde NextAuth.

NextAuth está construyendo una URL como:
- `https://remitero-dev.vercel.app/remitero-dev.vercel.app/dashboard`

Y esto sucede **ANTES** de que tu código en el callback `redirect` lo procese.

---

## 🎯 Dónde se Genera el Problema

El problema se genera en **NextAuth internamente** cuando construye la URL de redirección. NextAuth toma:
1. El `callbackUrl` que pasaste: `"/dashboard"`
2. El `baseUrl` que detecta: `"https://remitero-dev.vercel.app"`
3. Y los combina incorrectamente

**Posibles causas:**
- `NEXTAUTH_URL` tiene un valor incorrecto o duplicado
- `baseUrl` que NextAuth detecta automáticamente está mal formado
- NextAuth está usando una URL absoluta en lugar de relativa para el `callbackUrl`

---

## ✅ Solución Recomendada

El callback `redirect` (línea 342) **ya está limpiando** la URL, pero el problema es que el `url` que llega ya está mal formado.

**Para debuggear:**
1. Agrega un `console.log` en la línea 343 para ver qué `url` está llegando exactamente
2. Verifica qué valor tiene `NEXTAUTH_URL` en Vercel
3. Verifica qué `baseUrl` está detectando NextAuth automáticamente

**El callback `redirect` es el ÚNICO lugar donde puedes interceptar y corregir la URL antes de que NextAuth redirija al usuario.**

