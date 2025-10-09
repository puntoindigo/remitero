# Configuración de Google OAuth - Guía Completa

## Error Actual: 400 "invalid client"

El error que estás viendo indica que Google no reconoce el cliente OAuth o que las URLs de redirección no están configuradas correctamente.

## Pasos para Solucionar

### 1. Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto correcto
3. Ve a **APIs & Services** > **Credentials**

### 2. Verificar/Crear OAuth 2.0 Client ID

1. Busca el OAuth 2.0 Client ID: `117638263113-52cdt45...`
2. Si no existe, crea uno nuevo:
   - Haz clic en **"+ CREATE CREDENTIALS"**
   - Selecciona **"OAuth client ID"**
   - Tipo de aplicación: **"Web application"**

### 3. Configurar URLs Autorizadas

**Authorized JavaScript origins** (Orígenes JavaScript autorizados):
```
https://remitero-dev.vercel.app
https://v0-remitero.vercel.app
```

**Authorized redirect URIs** (URIs de redirección autorizadas):
```
https://remitero-dev.vercel.app/api/auth/callback/google
https://v0-remitero.vercel.app/api/auth/callback/google
```

### 4. Verificar Configuración del Cliente

Asegúrate de que:
- **Application type**: Web application
- **Name**: Un nombre descriptivo (ej: "Remitero Dev")
- **Authorized JavaScript origins**: Incluye ambos dominios
- **Authorized redirect URIs**: Incluye ambas URLs de callback

### 5. OAuth consent screen

1. Ve a **OAuth consent screen**
2. Asegúrate de que esté configurado:
   - **User Type**: External (si es para usuarios externos)
   - **App name**: "Sistema de Remitos"
   - **User support email**: Tu email
   - **Developer contact information**: Tu email

### 6. Verificar Scopes

En **OAuth consent screen** > **Scopes**, asegúrate de tener:
- `email`
- `profile`
- `openid`

## Configuración Actual Detectada

Según el debug, tu configuración actual es:
- **Client ID**: `117638263113-52cdt45...`
- **Callback URL**: `https://remitero-dev.vercel.app/api/auth/callback/google`
- **NEXTAUTH_URL**: `https://remitero-dev.vercel.app`

## URLs que DEBEN estar en Google Console

### Authorized JavaScript origins:
```
https://remitero-dev.vercel.app
https://v0-remitero.vercel.app
```

### Authorized redirect URIs:
```
https://remitero-dev.vercel.app/api/auth/callback/google
https://v0-remitero.vercel.app/api/auth/callback/google
```

## Verificación Rápida

Para verificar que la configuración es correcta:

1. **Ve a Google Cloud Console**
2. **APIs & Services** > **Credentials**
3. **Busca tu OAuth 2.0 Client ID**
4. **Verifica que las URLs estén exactamente como se muestran arriba**

## Problemas Comunes

### ❌ URLs incorrectas:
- `http://` en lugar de `https://`
- Dominio incorrecto
- Path incorrecto (`/callback/google` no `/callback`)

### ❌ Cliente no encontrado:
- Client ID incorrecto
- Proyecto incorrecto en Google Console
- Cliente eliminado o deshabilitado

### ❌ Consent screen no configurado:
- OAuth consent screen no configurado
- Scopes faltantes
- Información de contacto faltante

## Comandos de Verificación

```bash
# Verificar configuración actual
curl -s https://remitero-dev.vercel.app/api/debug-google-auth

# Probar login con Google (después de configurar)
# Ve a: https://remitero-dev.vercel.app/auth/login
```

## Próximos Pasos

1. **Configura las URLs en Google Console** (pasos 1-3)
2. **Espera 5-10 minutos** para que los cambios se propaguen
3. **Prueba el login** nuevamente
4. **Verifica los logs** en la consola del navegador

## Contacto

Si necesitas ayuda con la configuración de Google Console, asegúrate de:
- Usar el proyecto correcto
- Tener permisos de administrador
- Configurar exactamente las URLs mostradas arriba
