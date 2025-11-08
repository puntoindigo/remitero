# Solución: Configurar Email con OAuth2 (Alternativa a Contraseñas de Aplicación)

## 🎯 Cuándo Usar Esta Solución

Usa OAuth2 cuando:
- ❌ Las contraseñas de aplicación no están disponibles para tu cuenta
- ❌ Tienes una cuenta de Google Workspace con restricciones
- ✅ Quieres una solución más moderna y segura
- ✅ Necesitas mejor control sobre permisos

---

## 📋 Requisitos Previos

1. Acceso a Google Cloud Console: https://console.cloud.google.com/
2. Cuenta de Google con permisos para crear proyectos
3. Acceso a la cuenta de email que se usará para enviar

---

## 🚀 Implementación Paso a Paso

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Haz clic en el selector de proyectos (arriba)
3. Haz clic en "NUEVO PROYECTO"
4. Nombre: "Sistema Remitero Email"
5. Haz clic en "Crear"
6. Espera a que se cree y selecciónalo

### Paso 2: Habilitar Gmail API

1. En el menú lateral, ve a: **APIs & Services** → **Library**
2. Busca "Gmail API"
3. Haz clic en "Gmail API"
4. Haz clic en "ENABLE"
5. Espera a que se habilite

### Paso 3: Configurar Pantalla de Consentimiento OAuth

1. Ve a: **APIs & Services** → **OAuth consent screen**
2. Selecciona "External" (a menos que tengas Google Workspace)
3. Haz clic en "CREATE"
4. Completa el formulario:
   - **App name**: "Sistema de Remitos"
   - **User support email**: `puntoindigo3@gmail.com`
   - **Developer contact information**: Tu email
5. Haz clic en "SAVE AND CONTINUE"
6. En "Scopes", haz clic en "ADD OR REMOVE SCOPES"
7. Busca y agrega:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.compose`
8. Haz clic en "UPDATE" y luego "SAVE AND CONTINUE"
9. En "Test users", agrega `puntoindigo3@gmail.com`
10. Haz clic en "SAVE AND CONTINUE"
11. Revisa y haz clic en "BACK TO DASHBOARD"

### Paso 4: Crear Credenciales OAuth2

1. Ve a: **APIs & Services** → **Credentials**
2. Haz clic en "CREATE CREDENTIALS" → "OAuth client ID"
3. **Application type**: "Web application"
4. **Name**: "Remitero Email Sender"
5. **Authorized redirect URIs**: 
   - Agrega: `http://localhost:3000` (para desarrollo)
   - Agrega: `https://remitero-dev.vercel.app` (para producción)
6. Haz clic en "CREATE"
7. **IMPORTANTE**: Copia el **Client ID** y **Client Secret**
   - Guárdalos de forma segura, los necesitarás

### Paso 5: Obtener Refresh Token

Para obtener el refresh token, necesitas hacer un flujo OAuth2 manual:

#### Opción A: Usar Script de Node.js (Recomendado)

Crea un archivo `get-refresh-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'TU_CLIENT_ID';
const CLIENT_SECRET = 'TU_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent' // Importante para obtener refresh_token
});

console.log('Autoriza esta app visitando esta URL:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Ingresa el código de la URL de respuesta: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error al obtener token', err);
    console.log('Refresh Token:', token.refresh_token);
    console.log('Access Token:', token.access_token);
    console.log('\nGuarda estos valores de forma segura!');
  });
});
```

Ejecuta:
```bash
npm install googleapis
node get-refresh-token.js
```

#### Opción B: Usar Herramienta Online

1. Ve a: https://developers.google.com/oauthplayground/
2. En la izquierda, busca "Gmail API v1"
3. Selecciona: `https://mail.google.com/`
4. Haz clic en "Authorize APIs"
5. Inicia sesión con `puntoindigo3@gmail.com`
6. Copia el "Refresh token" que aparece

### Paso 6: Instalar Dependencias

```bash
npm install nodemailer nodemailer-google-oauth2
```

O si prefieres implementación manual:
```bash
npm install googleapis nodemailer
```

### Paso 7: Actualizar Código

Actualiza `src/lib/email.ts` para usar OAuth2. Te proporciono el código actualizado en el siguiente paso.

---

## 🔧 Código de Implementación

### Opción 1: Usando `nodemailer-google-oauth2` (Más Simple)

```typescript
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  if (!emailUser || !clientId || !clientSecret || !refreshToken) {
    console.error('❌ [Email] Variables de OAuth2 no configuradas');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground' // Redirect URI
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: emailUser,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
      accessToken: oauth2Client.getAccessToken()
    }
  });
};
```

### Opción 2: Implementación Manual con googleapis

```typescript
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const createTransporter = async () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  if (!emailUser || !clientId || !clientSecret || !refreshToken) {
    console.error('❌ [Email] Variables de OAuth2 no configuradas');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  // Obtener access token
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: emailUser,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
      accessToken: accessToken.token
    }
  });
};
```

---

## 🔐 Variables de Entorno Necesarias

Agrega estas variables en Vercel:

```env
EMAIL_USER=puntoindigo3@gmail.com
GOOGLE_OAUTH_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=tu_client_secret
GOOGLE_OAUTH_REFRESH_TOKEN=tu_refresh_token
```

**IMPORTANTE**: 
- El `refresh_token` es permanente (a menos que lo revoques)
- El `access_token` se renueva automáticamente
- No compartas estos valores públicamente

---

## ✅ Ventajas de OAuth2

1. ✅ Funciona con cuentas de Google Workspace
2. ✅ Más seguro que contraseñas de aplicación
3. ✅ Mejor control de permisos
4. ✅ No requiere Verificación en 2 pasos para funcionar
5. ✅ Tokens se renuevan automáticamente

---

## ⚠️ Consideraciones

1. **Tokens expiran**: Los access tokens expiran, pero se renuevan automáticamente con el refresh token
2. **Permisos**: Asegúrate de tener solo los permisos necesarios
3. **Seguridad**: Guarda los tokens de forma segura, nunca en el código

---

## 🆘 Si Necesitas Ayuda

Si prefieres que implemente esta solución directamente en el código, puedo hacerlo. Solo necesitas:
1. Los valores de Client ID, Client Secret y Refresh Token
2. Confirmar que quieres usar OAuth2 en lugar de contraseñas de aplicación

---

**Última actualización**: Noviembre 2024

