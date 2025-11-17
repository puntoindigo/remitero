# 🔑 Generar Nuevo Client Secret de Google OAuth

Guía paso a paso para generar un nuevo Client Secret cuando las credenciales actuales no funcionan o están deshabilitadas.

## 📋 Pasos

### 1. Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Selecciona el proyecto correcto (o crea uno nuevo si es necesario)

### 2. Ir a Credenciales

1. En el menú lateral, ve a: **APIs y servicios** → **Credenciales**
2. Busca el cliente OAuth 2.0 que estás usando (o crea uno nuevo)

### 3. Verificar/Configurar el Cliente OAuth

Si el cliente existe:
1. Haz clic en el cliente OAuth 2.0
2. Verifica que esté **Habilitado** (no "Deshabilitado")
3. Si está deshabilitado, haz clic en **"Habilitar"**

Si el cliente no existe o necesitas crear uno nuevo:
1. Haz clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth"**
2. Selecciona tipo: **"Aplicación web"** o **"Web application"**
3. Completa:
   - **Nombre**: "Remitero" (o el que prefieras)
   - **URIs de redireccionamiento autorizados**: Agrega:
     - `http://localhost:8000/api/auth/callback/google` (para localhost)
     - `https://remitero-dev.vercel.app/api/auth/callback/google` (para dev/preview)
     - `https://v0-remitero.vercel.app/api/auth/callback/google` (para producción)
   - **Orígenes autorizados de JavaScript**: Agrega:
     - `http://localhost:8000` (para localhost)
     - `https://remitero-dev.vercel.app` (para dev/preview)
     - `https://v0-remitero.vercel.app` (para producción)
4. Haz clic en **"Crear"** o **"CREATE"**

### 4. Obtener las Credenciales

Después de crear o editar el cliente:
1. Se mostrará un modal con:
   - **ID de cliente** (Client ID): Copia este valor
   - **Secreto de cliente** (Client Secret): Haz clic en el icono del ojo 👁️ para mostrarlo, luego cópialo
2. **IMPORTANTE**: Guarda estos valores de forma segura, los necesitarás en el siguiente paso

### 5. Actualizar Variables de Entorno Local

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Actualiza estas líneas:
   ```bash
   GOOGLE_CLIENT_ID="tu-nuevo-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="tu-nuevo-client-secret"
   NEXTAUTH_URL="http://localhost:8000"
   ```
3. Guarda el archivo

### 6. Actualizar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Actualiza estas variables para **Production**, **Preview** y **Development**:
   - `GOOGLE_CLIENT_ID` = (tu nuevo Client ID)
   - `GOOGLE_CLIENT_SECRET` = (tu nuevo Client Secret)
   - `NEXTAUTH_URL` = (la URL correspondiente al entorno)

### 7. Reiniciar el Servidor Local

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev
```

### 8. Probar

1. En localhost: Abre `http://localhost:8000/auth/login` y prueba iniciar sesión con Google
2. En Vercel: Espera a que se complete el deploy y prueba en la URL correspondiente

## ⚠️ Notas Importantes

- **El Client Secret es sensible**: No lo compartas públicamente ni lo subas a Git
- **Las URIs deben coincidir exactamente**: Sin espacios, sin barras finales, con el protocolo correcto (`http://` para localhost, `https://` para Vercel)
- **Puede tardar 1-2 minutos**: Después de actualizar las URIs en Google Cloud Console, pueden tardar en activarse
- **Un cliente puede tener múltiples URIs**: Puedes agregar todas las URIs necesarias (localhost, dev, producción) en el mismo cliente

## 🐛 Solución de Problemas

### Error: "invalid_client (Unauthorized)"
- Verifica que el cliente esté **Habilitado** en Google Cloud Console
- Verifica que las credenciales sean correctas (sin espacios, sin caracteres extra)
- Verifica que las URIs de redirección estén configuradas correctamente

### Error: "redirect_uri_mismatch"
- Verifica que las URIs en Google Cloud Console coincidan **exactamente** con las que estás usando
- No debe haber espacios ni barras finales extra
- Asegúrate de que el puerto sea correcto (8000 para localhost)

### El cliente está deshabilitado
- Ve a Google Cloud Console → Credenciales
- Haz clic en el cliente
- Haz clic en **"Habilitar"** o **"Enable"**

---

**Última actualización**: Diciembre 2024

