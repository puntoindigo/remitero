# 🔄 Recrear Cliente OAuth (Cliente Eliminado)

Si ves el error **"The OAuth client was deleted"** o **"404. Se trata de un error"** en Google, significa que el cliente OAuth fue eliminado y necesitas crear uno nuevo.

## 📋 Pasos para Recrear el Cliente OAuth

### Paso 1: Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Asegúrate de estar en el proyecto correcto (o crea uno nuevo si es necesario)

### Paso 2: Habilitar Gmail API (si no está habilitada)

1. En el menú lateral, ve a: **APIs y servicios** → **Biblioteca**
2. Busca "Gmail API"
3. Haz clic en **"Habilitar"** o **"HABILITAR"**

### Paso 3: Configurar Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a: **APIs y servicios** → **Pantalla de consentimiento de OAuth**
2. Si ya existe, verifica que:
   - Tu email (`puntoindigo3@gmail.com`) esté en **"Usuarios de prueba"**
   - Los ámbitos incluyan:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.compose`
3. Si no existe, créala siguiendo los pasos en `docs/SOLUCION_OAUTH2_EMAIL.md`

### Paso 4: Crear Nuevo Cliente OAuth

1. En el menú lateral, ve a: **APIs y servicios** → **Credenciales**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth"**
3. Selecciona tipo: **"Aplicación web"** o **"Web application"**
4. Completa:
   - **Nombre**: "Remitero Email Sender" (o el que prefieras)
   - **URI de redirección autorizados**: Haz clic en **"+ Agregar URI"** y agrega:
     - `http://localhost:3000`
     - `https://developers.google.com/oauthplayground`
     - `https://remitero-dev.vercel.app` (opcional, para producción)
5. Haz clic en **"Crear"** o **"CREATE"**
6. **IMPORTANTE**: Se abrirá un modal con tus credenciales:
   - **ID de cliente** (Client ID): Copia este valor
   - **Secreto de cliente** (Client Secret): Haz clic en el icono del ojo 👁️ para mostrarlo, luego cópialo
   - **Guárdalos de forma segura**, los necesitarás en el siguiente paso

### Paso 5: Actualizar el Script

1. Abre el archivo: `scripts/get-refresh-token.js`
2. Reemplaza:
   ```javascript
   const CLIENT_ID = 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com';
   const CLIENT_SECRET = 'TU_CLIENT_SECRET_AQUI';
   ```
   Con los valores que copiaste en el Paso 4

### Paso 6: Obtener Nuevo Refresh Token

1. Asegúrate de tener `googleapis` instalado:
   ```bash
   npm install googleapis
   ```

2. Ejecuta el script:
   ```bash
   node scripts/get-refresh-token.js
   ```

3. El script te mostrará una URL. Ábrela en tu navegador

4. Inicia sesión con `puntoindigo3@gmail.com`

5. Autoriza la aplicación

6. Después de autorizar, copia el código de la URL de respuesta
   - La URL será algo como: `http://localhost:3000/?code=4/0A...`
   - Copia solo la parte después de `code=` hasta antes del siguiente `&` o el final

7. Pega el código en la terminal donde está corriendo el script

8. El script te mostrará el **REFRESH_TOKEN**

### Paso 7: Actualizar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/
2. Ve a **Settings** → **Environment Variables**
3. Actualiza estas variables:
   - `GOOGLE_OAUTH_CLIENT_ID` = (tu nuevo Client ID)
   - `GOOGLE_OAUTH_CLIENT_SECRET` = (tu nuevo Client Secret)
   - `GOOGLE_OAUTH_REFRESH_TOKEN` = (el nuevo Refresh Token que obtuviste)
4. Asegúrate de que `EMAIL_USER=puntoindigo3@gmail.com` también esté configurado

### Paso 8: Redeploy

1. En Vercel, ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el deploy (2-3 minutos)

### Paso 9: Probar

1. Ve a: `https://remitero-dev.vercel.app/api/email/test` (GET)
2. Verifica que muestre:
   ```json
   {
     "hasOAuth2": true,
     "method": "OAuth2"
   }
   ```
3. Prueba enviar un email de invitación desde la app

---

## ⚠️ Notas Importantes

- **El refresh token es permanente** (a menos que lo revoques manualmente)
- **No compartas** estos valores públicamente
- Si eliminas el cliente OAuth nuevamente, tendrás que repetir este proceso
- El modo de prueba es suficiente para enviar emails desde tu propia cuenta

---

## 🆘 Si Tienes Problemas

1. **Error "redirect_uri_mismatch"**:
   - Verifica que `http://localhost:3000` esté en los URI de redirección autorizados
   - También agrega `https://developers.google.com/oauthplayground`

2. **Error "invalid_grant"**:
   - El refresh token puede haber expirado
   - Obtén uno nuevo siguiendo el Paso 6

3. **No aparece el refresh_token**:
   - Asegúrate de usar `prompt: 'consent'` en el script
   - Si ya autorizaste antes, revoca el acceso y vuelve a autorizar

---

**Última actualización**: Diciembre 2024

