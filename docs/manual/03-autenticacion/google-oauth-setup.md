# Configuración de Google OAuth

## 🎯 Opción 1: Desarrollo local (localhost)

### Paso 1: Agregar URIs de localhost en Google Cloud Console

1. Ve a [Google Cloud Console - Credenciales](https://console.cloud.google.com/apis/credentials)
2. Haz clic en tu cliente OAuth 2.0 "remitero"
3. Agrega las siguientes URIs:

**Orígenes autorizados de JavaScript:**
- Haz clic en "+ Agregar URI" y agrega: `http://localhost:8000`
- (Opcional) Si usas otro puerto: `http://localhost:3000`

**URIs de redireccionamiento autorizados:**
- Haz clic en "+ Agregar URI" y agrega: `http://localhost:8000/api/auth/callback/google`
- (Opcional) Si usas otro puerto: `http://localhost:3000/api/auth/callback/google`

4. Haz clic en "Guardar" al final de la página

### Paso 2: Configurar variables de entorno local

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret-aqui"
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="tu-secret-key-aqui"
```

### Paso 3: Reiniciar el servidor

```bash
npm run dev
```

**¡Listo!** Ya puedes usar Google OAuth en localhost.

---

## 🚀 Opción 2: Deploy en Vercel (Recomendado)

### Paso 1: Verificar URIs en Google Cloud Console

Tus URIs de producción ya están configuradas ✅:
- `https://remitero-dev.vercel.app`
- `https://v0-remitero.vercel.app`

**URIs de redireccionamiento también están configuradas ✅:**
- `https://remitero-dev.vercel.app/api/auth/callback/google`
- `https://v0-remitero.vercel.app/api/auth/callback/google`

### Paso 2: Configurar variables de entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables para **Production**, **Preview** y **Development**:

```bash
GOOGLE_CLIENT_ID=117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui
NEXTAUTH_URL=https://remitero-dev.vercel.app  # Para preview/dev
# O para producción:
NEXTAUTH_URL=https://v0-remitero.vercel.app
NEXTAUTH_SECRET=tu-secret-key-aqui
```

### Paso 3: Hacer deploy

```bash
# Hacer commit y push
git add .
git commit -m "Agregar Google OAuth"
git push origin develop  # o main para producción
```

Vercel automáticamente hará el deploy y las variables de entorno estarán disponibles.

**¡Listo!** Tu aplicación estará disponible en:
- **Dev**: `https://remitero-dev.vercel.app`
- **Prod**: `https://v0-remitero.vercel.app`

---

## 📝 Notas importantes

### ⚠️ Seguridad
- **NUNCA** subas tus credenciales a git
- El archivo `.env.local` está en `.gitignore` y no se sube
- En Vercel, las variables de entorno están encriptadas

### 🔄 Actualización de URIs
- Después de agregar URIs en Google Cloud, pueden tardar **1-2 minutos** en activarse
- Si no funciona inmediatamente, espera unos minutos y prueba de nuevo

### 🌐 Múltiples entornos
Puedes tener **ambas configuraciones** activas al mismo tiempo:
- **Localhost** para desarrollo
- **Vercel** para producción/preview

Solo necesitas tener las URIs correctas en Google Cloud Console.

### 🔍 Verificar que funciona

**En localhost:**
1. Abre `http://localhost:8000/auth/login`
2. Haz clic en "Continuar con Google"
3. Deberías ver la pantalla de Google para autorizar

**En Vercel:**
1. Abre `https://remitero-dev.vercel.app/auth/login`
2. Haz clic en "Continuar con Google"
3. Deberías ver la pantalla de Google para autorizar

---

## 🐛 Solución de problemas

### Error: "redirect_uri_mismatch"
- Verifica que las URIs en Google Cloud Console coincidan exactamente
- No debe haber espacios ni barras finales extra
- Asegúrate de que el puerto sea correcto

### Error: "Invalid client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de que no haya espacios o caracteres extra

### No aparece el botón de Google
- Verifica que las variables de entorno estén configuradas
- Reinicia el servidor después de agregar variables

