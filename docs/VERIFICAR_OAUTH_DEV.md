# 🔍 Verificar OAuth en Dev (Vercel Preview)

Guía para verificar y solucionar problemas de OAuth en el entorno de desarrollo/preview de Vercel.

## 📋 Checklist de Verificación

### 1. Verificar Variables de Entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Verifica que estas variables estén configuradas para **Preview** y **Development**:
   - `GOOGLE_CLIENT_ID` ✅
   - `GOOGLE_CLIENT_SECRET` ✅
   - `NEXTAUTH_URL` = `https://remitero-dev.vercel.app` ✅
   - `NEXTAUTH_SECRET` ✅

**⚠️ IMPORTANTE**: Asegúrate de que las variables estén marcadas para **Preview** y **Development**, no solo para Production.

### 2. Verificar en Google Cloud Console

1. Ve a [Google Cloud Console - Credenciales](https://console.cloud.google.com/apis/credentials)
2. Haz clic en tu cliente OAuth 2.0
3. Verifica que esté **Habilitado** (no "Deshabilitado")
4. Verifica que estas URIs estén en **"URIs de redireccionamiento autorizados"**:
   - `https://remitero-dev.vercel.app/api/auth/callback/google`
   - `http://localhost:8000/api/auth/callback/google` (para localhost)
   - `https://v0-remitero.vercel.app/api/auth/callback/google` (para producción)
5. Verifica que estos orígenes estén en **"Orígenes autorizados de JavaScript"**:
   - `https://remitero-dev.vercel.app`
   - `http://localhost:8000`
   - `https://v0-remitero.vercel.app`

### 3. Hacer Redeploy en Vercel

**⚠️ CRÍTICO**: Después de actualizar variables de entorno, DEBES hacer redeploy:

1. Ve a **Deployments** en Vercel Dashboard
2. Busca el deployment más reciente de la rama `develop` (o la que uses para preview)
3. Haz clic en los **tres puntos** (⋯)
4. Selecciona **"Redeploy"**
5. Espera a que complete (1-3 minutos)

**Nota**: Las variables de entorno solo se aplican en nuevos deployments. Si actualizaste las variables pero no hiciste redeploy, seguirá usando las variables antiguas.

### 4. Verificar Configuración con Endpoint de Debug

Después del redeploy, verifica la configuración:

1. Abre: `https://remitero-dev.vercel.app/api/auth/debug`
2. Verifica que:
   - `googleOAuth.hasGoogleClientId` = `true`
   - `googleOAuth.hasGoogleClientSecret` = `true`
   - `nextAuth.nextAuthUrl` = `https://remitero-dev.vercel.app`
   - `nextAuth.expectedCallbackUrl` = `https://remitero-dev.vercel.app/api/auth/callback/google`
   - `status.allConfigured` = `true`

### 5. Verificar Logs de Vercel

1. Ve a **Deployments** → Selecciona el deployment → **Logs**
2. Busca errores relacionados con OAuth:
   - `invalid_client`
   - `OAuthCallback`
   - `redirect_uri_mismatch`

## 🐛 Errores Comunes y Soluciones

### Error: "invalid_client (Unauthorized)"

**Causa**: El cliente OAuth está deshabilitado o las credenciales son incorrectas.

**Solución**:
1. Ve a Google Cloud Console → Credenciales
2. Verifica que el cliente esté **Habilitado**
3. Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en Vercel sean correctos
4. Haz redeploy después de actualizar

### Error: "redirect_uri_mismatch"

**Causa**: La URI de redirección no está configurada en Google Cloud Console.

**Solución**:
1. Ve a Google Cloud Console → Credenciales → Tu cliente OAuth
2. Agrega `https://remitero-dev.vercel.app/api/auth/callback/google` a "URIs de redireccionamiento autorizados"
3. Guarda
4. Espera 1-2 minutos para que se active

### Las variables no se aplican

**Causa**: No se hizo redeploy después de actualizar las variables.

**Solución**:
1. Ve a Deployments
2. Haz redeploy del deployment más reciente
3. Espera a que complete

### Funciona en localhost pero no en dev

**Causa común**: Las variables están solo en Production, no en Preview/Development.

**Solución**:
1. Ve a Settings → Environment Variables
2. Para cada variable (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.):
   - Verifica que esté marcada para **Preview** y **Development**
   - Si solo está en Production, edítala y marca también Preview y Development
3. Haz redeploy

## ✅ Verificación Final

Después de seguir todos los pasos:

1. **Prueba el login** en: `https://remitero-dev.vercel.app/auth/login`
2. **Haz clic en "Continuar con Google"**
3. **Deberías poder iniciar sesión** sin errores

Si aún no funciona:
- Revisa los logs de Vercel para ver el error específico
- Verifica que el endpoint `/api/auth/debug` muestre todas las variables configuradas
- Asegúrate de que el cliente OAuth esté habilitado en Google Cloud Console

---

**Última actualización**: Diciembre 2024

