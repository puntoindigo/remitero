# ✅ Paso 2: Agregar URI en Google Cloud Console

## Tu `.env.local` ya está configurado correctamente ✅

Tienes:
- ✅ `NEXTAUTH_URL="http://localhost:8000"`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`

## 🔧 Solo falta agregar la URI en Google Cloud Console

### Pasos:

1. **Ve a Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials
   - Haz clic en tu cliente OAuth "remitero"

2. **En "URIs de redireccionamiento autorizados":**
   - Haz clic en "+ Agregar URI"
   - Agrega EXACTAMENTE esto (sin espacios, sin barra final):
     ```
     http://localhost:8000/api/auth/callback/google
     ```

3. **En "Orígenes autorizados de JavaScript":**
   - Haz clic en "+ Agregar URI"
   - Agrega EXACTAMENTE esto:
     ```
     http://localhost:8000
     ```

4. **Haz clic en "Guardar"** al final de la página

5. **Espera 1-2 minutos** para que Google actualice las URIs

6. **Reinicia tu servidor:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

7. **Prueba de nuevo** en `http://localhost:8000/auth/login`

## ✅ Verificación

Si todo está bien:
- ✅ `.env.local` tiene las variables correctas (ya lo tienes)
- ✅ Google Cloud Console tiene `http://localhost:8000/api/auth/callback/google`
- ✅ Servidor reiniciado

El error `redirect_uri_mismatch` debería desaparecer.

