# 🚀 Configuración para localhost - SOLUCIÓN AL ERROR redirect_uri_mismatch

## ⚠️ PROBLEMA: Error 400: redirect_uri_mismatch

Este error ocurre porque NextAuth necesita `NEXTAUTH_URL` configurado correctamente para construir la URI de redirección que envía a Google.

## ✅ SOLUCIÓN: Crea `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto (al mismo nivel que `package.json`) con este contenido:

```bash
# Supabase (ya deberías tener estas)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# ⚠️ CRÍTICO: NextAuth Configuration
# Debe ser EXACTAMENTE http://localhost:8000 (sin barra final, sin espacios)
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="wUY54Fv/DQ21F+f6sQ+LPyDRcccGZPQETubdPedTJsU="

# ⚠️ CRÍTICO: Google OAuth Configuration
# Usa el Client ID que tienes en Google Cloud Console
GOOGLE_CLIENT_ID="117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-tu-secret-completo-aqui"  # ⚠️ NO el que está parcialmente oculto

# Environment
NODE_ENV="development"
```

## 📋 Pasos para solucionarlo:

### 1. Verifica en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Edita tu cliente OAuth "remitero"
3. En **"URIs de redireccionamiento autorizados"**, asegúrate de tener EXACTAMENTE:
   ```
   http://localhost:8000/api/auth/callback/google
   ```
   - Sin barra final
   - Sin espacios
   - Con el puerto correcto (8000)
   - Con el protocolo `http://` (no `https://`)

4. En **"Orígenes autorizados de JavaScript"**, agrega:
   ```
   http://localhost:8000
   ```

5. Haz clic en **"Guardar"** al final de la página

### 2. Crea el archivo `.env.local`

```bash
# En la raíz del proyecto
touch .env.local
```

Luego copia el contenido de arriba, reemplazando:
- `GOOGLE_CLIENT_SECRET` con el secreto completo (no el parcialmente oculto `****mgTl`)
- Las variables de Supabase con tus valores reales

### 3. Reinicia el servidor

```bash
# Detén el servidor (Ctrl+C si está corriendo)
# Luego reinícialo
npm run dev
```

### 4. Prueba

1. Abre `http://localhost:8000/auth/login`
2. Haz clic en "Continuar con Google"
3. Debería funcionar sin el error

## 🔍 Verificación rápida

Ejecuta esto para verificar que las variables están cargadas:

```bash
# En la consola del navegador (F12) o en el servidor
console.log(process.env.NEXTAUTH_URL)  # Debe mostrar: http://localhost:8000
console.log(process.env.GOOGLE_CLIENT_ID)  # Debe mostrar tu Client ID
```

## ⚠️ Errores comunes

### "redirect_uri_mismatch" persiste:
- Verifica que `NEXTAUTH_URL` no tenga barra final: `http://localhost:8000/` ❌ → `http://localhost:8000` ✅
- Verifica que el puerto coincida (8000)
- Espera 1-2 minutos después de agregar URIs en Google Cloud Console

### "Invalid client":
- Verifica que `GOOGLE_CLIENT_ID` esté completo y correcto
- Verifica que `GOOGLE_CLIENT_SECRET` sea el secreto completo (no parcialmente oculto)

### Variables no se cargan:
- Asegúrate de que el archivo se llame `.env.local` (no `.env.local.txt`)
- Reinicia el servidor después de crear/modificar `.env.local`
- Verifica que esté en la raíz del proyecto (mismo nivel que `package.json`)

