# 🔧 Variables de Entorno

Guía completa de todas las variables de entorno necesarias para el proyecto.

## 📋 Variables Requeridas

### Base de Datos (Supabase)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Autenticación (NextAuth)

```bash
NEXTAUTH_URL="http://localhost:8000"  # Para localhost
# O
NEXTAUTH_URL="https://remitero-dev.vercel.app"  # Para producción

NEXTAUTH_SECRET="tu-secret-key-aqui"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Google OAuth

```bash
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
```

### Email (Opcional)

```bash
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-contraseña-de-aplicacion"  # Contraseña de aplicación, NO la contraseña normal
```

**O si usas OAuth2 para emails:**

```bash
EMAIL_USER="tu-email@gmail.com"
GOOGLE_OAUTH_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="tu-client-secret"
GOOGLE_OAUTH_REFRESH_TOKEN="tu-refresh-token"
```

## 🌐 Variables por Entorno

### Localhost (`.env.local`)

```bash
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:8000"
# ... resto de variables
```

### Vercel - Development/Preview

```bash
NODE_ENV="development"
NEXTAUTH_URL="https://remitero-dev.vercel.app"
# ... resto de variables
```

### Vercel - Production

```bash
NODE_ENV="production"
NEXTAUTH_URL="https://remitero-prod.vercel.app"
# ... resto de variables
```

## ✅ Checklist de Verificación

- [ ] Todas las variables de Supabase están configuradas
- [ ] `NEXTAUTH_URL` coincide con el entorno (localhost/producción)
- [ ] `NEXTAUTH_SECRET` está generado y es único
- [ ] `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` están correctos
- [ ] Variables de email están configuradas (si se usa)
- [ ] Variables están configuradas en TODOS los entornos necesarios

## 🔒 Seguridad

- **NUNCA** subas `.env.local` a Git (está en `.gitignore`)
- **NUNCA** compartas las variables públicamente
- **Usa** diferentes valores para desarrollo y producción
- **Rota** los secrets periódicamente

---

**Siguiente paso**: [Entornos](./entornos.md)

