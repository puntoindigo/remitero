# 🔧 Configuración .env.local para localhost

## ⚠️ CRÍTICO: El error "redirect_uri_mismatch" se soluciona así:

### 1. Crea un archivo `.env.local` en la raíz del proyecto

```bash
# Supabase Configuration (ya deberías tenerlas)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth Configuration
# ⚠️ IMPORTANTE: Debe ser EXACTAMENTE http://localhost:8000 (sin barra final)
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="wUY54Fv/DQ21F+f6sQ+LPyDRcccGZPQETubdPedTJsU="

# Google OAuth Configuration
# ⚠️ IMPORTANTE: Usa el Client ID que tienes en Google Cloud Console
GOOGLE_CLIENT_ID="117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-tu-secret-aqui"

# Environment
NODE_ENV="development"
```

### 2. Verifica en Google Cloud Console

En [Google Cloud Console - Credenciales](https://console.cloud.google.com/apis/credentials):
- Edita tu cliente OAuth "remitero"
- **URIs de redireccionamiento autorizados** debe tener EXACTAMENTE:
  - `http://localhost:8000/api/auth/callback/google`
  - (Sin barra final, sin espacios, exactamente así)

### 3. Reinicia el servidor

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

## ✅ Checklist de verificación

- [ ] `.env.local` existe en la raíz del proyecto
- [ ] `NEXTAUTH_URL="http://localhost:8000"` (sin barra final)
- [ ] `GOOGLE_CLIENT_ID` tiene el valor correcto
- [ ] `GOOGLE_CLIENT_SECRET` tiene el valor correcto (no parcialmente oculto)
- [ ] `NEXTAUTH_SECRET` tiene un valor generado
- [ ] En Google Cloud Console: `http://localhost:8000/api/auth/callback/google` está agregado
- [ ] Servidor reiniciado después de crear `.env.local`

## 🐛 Si sigue fallando

1. Verifica que no haya espacios extra en las variables
2. Verifica que las comillas sean correctas (dobles, no simples)
3. Asegúrate de que el puerto en `NEXTAUTH_URL` coincida con el que usas (`npm run dev` usa 8000)
4. Espera 1-2 minutos después de agregar URIs en Google Cloud Console

