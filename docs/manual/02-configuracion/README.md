# ⚙️ Configuración

Guías para configurar entornos, variables de entorno y setup inicial.

## 📋 Guías Disponibles

### [Localhost](./localhost.md)
Configuración completa para desarrollo local, incluyendo `.env.local` y Google Cloud Console.

### [Variables de Entorno](./variables-entorno.md)
Guía completa de todas las variables de entorno necesarias.

### [Entornos](./entornos.md)
Documentación de los diferentes entornos del proyecto (development, preview, production).

---

## 🔧 Configuración Rápida

### Variables Mínimas Requeridas

```bash
# Base de datos
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Autenticación
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (opcional)
EMAIL_USER="..."
EMAIL_PASSWORD="..."
```

---

**Siguiente paso**: [Localhost](./localhost.md)

