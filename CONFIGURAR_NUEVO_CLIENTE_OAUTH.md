# 🔧 Configurar Nuevo Cliente OAuth

Tienes un nuevo cliente OAuth de Google. Aquí están los pasos para configurarlo completamente.

## 📋 Valores del Cliente OAuth

Del archivo JSON que tienes (`client_secret_*.json`):

- **Client ID**: Está en el campo `client_id` del JSON
- **Client Secret**: Está en el campo `client_secret` del JSON

⚠️ **IMPORTANTE**: No subas el archivo JSON a Git. Ya está en `.gitignore`.
- **Redirect URIs** (ya configurados):
  - `https://remitero-dev.vercel.app/api/auth/callback/google`
  - `https://v0-remitero.vercel.app/api/auth/callback/google`
  - `http://localhost:8000/api/auth/callback/google`
  - `https://developers.google.com/oauthplayground`

## 🚀 Pasos para Configurar

### Paso 1: Configurar Login con Google (NextAuth)

Este cliente puede usarse para el login con Google. Actualiza en Vercel:

**Variables de entorno en Vercel:**
- `GOOGLE_CLIENT_ID` = (el valor de `client_id` del archivo JSON)
- `GOOGLE_CLIENT_SECRET` = (el valor de `client_secret` del archivo JSON)

### Paso 2: Configurar Envío de Emails con OAuth2 (Opcional)

Si quieres usar OAuth2 para envío de emails (en lugar de App Password):

**Variables de entorno en Vercel:**
- `GOOGLE_OAUTH_CLIENT_ID` = (el valor de `client_id` del archivo JSON)
- `GOOGLE_OAUTH_CLIENT_SECRET` = (el valor de `client_secret` del archivo JSON)

**Obtener Refresh Token para emails:**

1. Asegúrate de tener `googleapis` instalado:
   ```bash
   npm install googleapis
   ```

2. El script `scripts/get-refresh-token.js` ya está actualizado con tus credenciales.

3. Ejecuta el script:
   ```bash
   node scripts/get-refresh-token.js
   ```

4. Sigue las instrucciones:
   - Abre la URL que muestra
   - Inicia sesión con `puntoindigo3@gmail.com`
   - Autoriza la aplicación
   - Copia el código de la URL de respuesta
   - Pega el código en la terminal
   - Copia el **REFRESH_TOKEN** que muestra

5. Agrega en Vercel:
   - `GOOGLE_OAUTH_REFRESH_TOKEN` = (el refresh token que obtuviste)

### Paso 3: Verificar que App Password esté configurado (Recomendado)

Para tener un respaldo automático, asegúrate de tener:
- `EMAIL_USER` = `puntoindigo3@gmail.com`
- `EMAIL_PASSWORD` = (tu contraseña de aplicación de 16 caracteres)

El sistema ahora hace fallback automático a App Password si OAuth2 falla.

## ✅ Resumen de Variables en Vercel

### Mínimo necesario (Login con Google):
```
GOOGLE_CLIENT_ID=(valor de client_id del archivo JSON)
GOOGLE_CLIENT_SECRET=(valor de client_secret del archivo JSON)
```

### Para envío de emails con OAuth2 (Opcional):
```
GOOGLE_OAUTH_CLIENT_ID=(valor de client_id del archivo JSON)
GOOGLE_OAUTH_CLIENT_SECRET=(valor de client_secret del archivo JSON)
GOOGLE_OAUTH_REFRESH_TOKEN=(obtener con el script)
```

### Para fallback automático (Recomendado):
```
EMAIL_USER=puntoindigo3@gmail.com
EMAIL_PASSWORD=(tu contraseña de aplicación de 16 caracteres)
```

## 🎯 Recomendación

**Opción 1 (Más simple):** Solo configura `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` para login, y usa `EMAIL_PASSWORD` para emails. El sistema funcionará perfectamente.

**Opción 2 (Más seguro):** Configura todo (OAuth2 para emails + App Password como respaldo). El sistema usará OAuth2 cuando esté disponible y hará fallback automático a App Password si falla.

## 🔄 Después de Configurar

1. Haz redeploy en Vercel
2. Prueba el login con Google
3. Prueba enviar un email de invitación

---

**Nota:** El archivo `client_secret_*.json` contiene información sensible. No lo subas a Git. Ya debería estar en `.gitignore`.

