# 🔧 Agregar URI de Redireccionamiento para OAuth Playground

## Paso a Paso

### 1. Ve a Google Cloud Console

1. Abre: https://console.cloud.google.com/apis/credentials
2. Asegúrate de estar en el proyecto correcto (el que tiene tu Client ID)

### 2. Edita tu Cliente OAuth

1. Busca tu cliente OAuth con el ID: `442455029183-52a0dpfgs10d0a0nv3i00snep247tdrc`
2. Haz clic en el nombre del cliente para editarlo

### 3. Agrega el URI de Redireccionamiento

1. En la sección **"URIs de redireccionamiento autorizados"**, haz clic en **"+ Agregar URI"** o **"ADD URI"**
2. Agrega exactamente este URI:
   ```
   https://developers.google.com/oauthplayground
   ```
   - **IMPORTANTE**: Sin barra final, sin espacios, exactamente así
3. Haz clic en **"Guardar"** o **"SAVE"** al final de la página

### 4. Verifica

Deberías ver en la lista:
- `https://developers.google.com/oauthplayground`
- Y probablemente otros URIs como `http://localhost:8000/api/auth/callback/google`

### 5. Espera unos minutos

Los cambios pueden tardar 1-2 minutos en propagarse.

---

## ✅ Listo

Ahora puedes usar OAuth Playground para obtener el refresh token:

1. Ve a: https://developers.google.com/oauthplayground
2. Configura tus credenciales (Client ID y Secret)
3. Selecciona `https://mail.google.com/`
4. Autoriza y obtén el refresh token

---

## 📝 Nota

Si prefieres usar localhost en lugar de OAuth Playground, también puedes agregar:
- `http://localhost:3000`
- `http://localhost:8000`

Pero OAuth Playground es más rápido y no requiere servidor local.

