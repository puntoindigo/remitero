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
2. Haz clic en el selector de proyectos (arriba, donde dice el nombre del proyecto actual)
3. Haz clic en "NUEVO PROYECTO" o "Nueva proyecto"
4. Nombre: "Sistema Remitero Email"
5. Haz clic en "Crear"
6. Espera a que se cree (puede tardar unos segundos)
7. Selecciona el proyecto recién creado desde el selector de proyectos

### Paso 2: Habilitar Gmail API

1. En el menú lateral (izquierda), ve a: **APIs y servicios** → **Biblioteca**
   - Si no ves el menú, haz clic en el icono de menú (☰) en la esquina superior izquierda
2. En el buscador, escribe "Gmail API"
3. Haz clic en el resultado "Gmail API"
4. Haz clic en el botón azul **"Habilitar"** o **"HABILITAR"**
5. Espera a que se habilite (verás "API habilitada" o el estado cambiará a "Habilitada")

### Paso 3: Configurar Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a: **APIs y servicios** → **Pantalla de consentimiento de OAuth**
   - También puede aparecer como "Pantalla de consentimient..." (texto truncado)
2. Si es la primera vez, verás un formulario. Selecciona **"Externo"** (Usuarios externos)
   - **IMPORTANTE**: Aunque dice "modo de prueba", esto es suficiente para tu caso
   - El modo de prueba permite enviar emails desde tu cuenta (`puntoindigo3@gmail.com`)
   - Solo necesitas agregar tu email como usuario de prueba
   - **NO necesitas verificación completa** si solo envías emails desde tu propia cuenta
   - Haz clic en **"Crear"**
3. **Paso 1: Información de la app** (Descripción general):
   - **Nombre de la app**: "Sistema de Remitos"
   - **Correo electrónico de asistencia al usuario**: `puntoindigo3@gmail.com`
   - **Información de contacto del desarrollador**: Tu email
   - Haz clic en **"Guardar y continuar"** o **"SIGUIENTE"**
4. **Paso 2: Ámbitos** (Scopes):
   - Haz clic en **"Agregar o quitar ámbitos"** o **"ADD OR REMOVE SCOPES"**
   - En el buscador, busca "gmail"
   - Selecciona y agrega:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.compose`
   - Haz clic en **"Actualizar"** o **"UPDATE"**
   - Haz clic en **"Guardar y continuar"** o **"SIGUIENTE"**
5. **Paso 3: Usuarios de prueba** (Test users):
   - Haz clic en **"Agregar usuarios"** o **"ADD USERS"**
   - Ingresa: `puntoindigo3@gmail.com`
   - Haz clic en **"Agregar"** o **"ADD"**
   - **Esto es crucial**: Tu cuenta debe estar en la lista de usuarios de prueba
   - Puedes agregar más emails si necesitas
   - Haz clic en **"Guardar y continuar"** o **"SIGUIENTE"**
6. **Paso 4: Resumen**:
   - Revisa la información
   - Haz clic en **"Volver al panel"** o **"BACK TO DASHBOARD"**

**Nota sobre Modo de Prueba**:
- ✅ **SÍ funciona para enviar emails** desde tu cuenta
- ✅ **SÍ funciona en producción** (Vercel)
- ✅ **NO necesitas verificación** si solo envías desde tu propia cuenta
- ⚠️ Solo necesitarías verificación si quisieras que otros usuarios autoricen tu app
- ⚠️ Para tu caso (enviar emails del sistema), el modo de prueba es perfecto

### Paso 4: Crear Credenciales OAuth2

1. En el menú lateral, ve a: **APIs y servicios** → **Credenciales**
2. En la parte superior, haz clic en **"+ CREAR CREDENCIALES"** o **"Crear credenciales"**
3. Selecciona **"ID de cliente de OAuth"** o **"OAuth client ID"**
4. Si te pide seleccionar tipo de aplicación, elige **"Aplicación web"** o **"Web application"**
5. Completa el formulario:
   - **Nombre**: "Remitero Email Sender"
   - **URI de redirección autorizados**: 
     - Haz clic en **"+ Agregar URI"** o **"ADD URI"**
     - Agrega: `http://localhost:3000` (para desarrollo)
     - Agrega otro: `https://remitero-dev.vercel.app` (para producción)
     - También puedes agregar: `https://developers.google.com/oauthplayground` (para obtener el refresh token)
6. Haz clic en **"Crear"** o **"CREATE"**
7. **IMPORTANTE**: Se abrirá un modal con tus credenciales
   - **ID de cliente** (Client ID): Copia este valor
   - **Secreto de cliente** (Client Secret): Haz clic en el icono del ojo para mostrarlo, luego cópialo
   - **Guárdalos de forma segura**, los necesitarás para configurar las variables de entorno
   - Haz clic en **"Aceptar"** o **"OK"** para cerrar el modal

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

