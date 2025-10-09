# Solución para Error 400 "invalid client" de Google OAuth

## 🚨 Error Actual
```
400. Se trata de un error.
El servidor no puede procesar la solicitud porque el formato es incorrecto.
```

## 🔍 Diagnóstico
El error indica que Google no reconoce el cliente OAuth. Esto sucede cuando:
1. El `GOOGLE_CLIENT_ID` no existe en Google Cloud Console
2. Las URLs de redirección no están configuradas correctamente
3. El proyecto de Google Cloud Console no es el correcto

## 📋 Configuración Actual Detectada
- **Client ID**: `117638263113-52cdt45...`
- **Callback URL**: `https://remitero-dev.vercel.app/api/auth/callback/google`
- **Variables de entorno**: ✅ Configuradas en Vercel

## 🛠️ Solución Paso a Paso

### Paso 1: Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **Asegúrate de estar en el proyecto correcto**
3. Ve a **APIs & Services** > **Credentials**

### Paso 2: Verificar/Crear OAuth 2.0 Client ID
1. Busca el OAuth 2.0 Client ID: `117638263113-52cdt45...`
2. **Si NO existe**, crea uno nuevo:
   - Haz clic en **"+ CREATE CREDENTIALS"**
   - Selecciona **"OAuth client ID"**
   - Tipo de aplicación: **"Web application"**
   - Nombre: "Remitero Dev"

### Paso 3: Configurar URLs (CRÍTICO)
**Authorized JavaScript origins:**
```
https://remitero-dev.vercel.app
https://v0-remitero.vercel.app
```

**Authorized redirect URIs:**
```
https://remitero-dev.vercel.app/api/auth/callback/google
https://v0-remitero.vercel.app/api/auth/callback/google
```

### Paso 4: Verificar OAuth Consent Screen
1. Ve a **OAuth consent screen**
2. Configura:
   - **User Type**: External
   - **App name**: "Sistema de Remitos"
   - **User support email**: Tu email
   - **Developer contact information**: Tu email

### Paso 5: Verificar Scopes
En **OAuth consent screen** > **Scopes**, asegúrate de tener:
- `email`
- `profile` 
- `openid`

## ⚠️ Puntos Críticos

### ❌ Errores Comunes:
- Usar `http://` en lugar de `https://`
- Dominio incorrecto (localhost en lugar de vercel.app)
- Path incorrecto (`/callback` en lugar de `/api/auth/callback/google`)
- Barras finales en las URLs
- Proyecto incorrecto en Google Cloud Console

### ✅ Configuración Correcta:
- **HTTPS obligatorio**
- **Dominio exacto**: `remitero-dev.vercel.app`
- **Path exacto**: `/api/auth/callback/google`
- **Sin barras finales**

## 🔄 Después de Configurar

1. **Guarda los cambios** en Google Console
2. **Espera 5-10 minutos** para propagación
3. **Prueba el login** nuevamente
4. **Verifica los logs** en consola del navegador

## 🧪 Verificación

### Comando de verificación:
```bash
curl -s https://remitero-dev.vercel.app/api/debug-google-auth
```

### Resultado esperado:
```json
{
  "success": true,
  "config": {
    "hasGoogleClientId": true,
    "hasGoogleClientSecret": true,
    "callbackUrl": "https://remitero-dev.vercel.app/api/auth/callback/google"
  }
}
```

## 🆘 Si el Problema Persiste

### Opción 1: Crear Nuevo Cliente OAuth
1. En Google Cloud Console, crea un **nuevo OAuth 2.0 Client ID**
2. Copia el nuevo `Client ID` y `Client Secret`
3. Actualiza las variables de entorno en Vercel:
   ```bash
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   ```

### Opción 2: Verificar Proyecto
1. Asegúrate de estar en el **proyecto correcto** en Google Cloud Console
2. Verifica que el proyecto tenga **APIs habilitadas**:
   - Google+ API
   - Google OAuth2 API

## 📞 Contacto
Si necesitas ayuda:
1. Verifica que tengas **permisos de administrador** en Google Cloud Console
2. Asegúrate de estar en el **proyecto correcto**
3. Configura **exactamente** las URLs mostradas arriba

## 🎯 Próximo Paso
**Configura las URLs en Google Cloud Console** siguiendo los pasos 1-5. Una vez hecho esto, el error 400 desaparecerá y el login con Google funcionará.
