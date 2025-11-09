# 🎯 Primeros Pasos

Guía para configurar el proyecto desde cero.

## 📋 Requisitos Previos

- **Node.js**: Versión 18 o superior
- **npm** o **yarn**: Gestor de paquetes
- **Git**: Control de versiones
- **Cuenta de Google**: Para autenticación OAuth
- **Cuenta de Supabase**: Para base de datos
- **Cuenta de Vercel**: Para despliegue (opcional)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/puntoindigo/remitero.git
cd remitero-nextjs
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="tu-secret-key-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"

# Email (opcional)
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-contraseña-de-aplicacion"
```

**Ver guía completa**: [Configuración Localhost](../02-configuracion/localhost.md)

### 4. Configurar Base de Datos

Asegúrate de que tu base de datos Supabase tenga:
- Todas las tablas creadas
- Datos iniciales (si aplica)
- Permisos correctos

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:8000`

## ✅ Verificación

1. Abre `http://localhost:8000` en tu navegador
2. Deberías ver la página de login
3. Prueba iniciar sesión con Google OAuth

## 🐛 Problemas Comunes

### Error: "redirect_uri_mismatch"
- Verifica que `NEXTAUTH_URL` sea exactamente `http://localhost:8000` (sin barra final)
- Verifica que las URIs estén configuradas en Google Cloud Console

### Error: "Invalid client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de que no haya espacios extra

### Variables no se cargan
- Asegúrate de que el archivo se llame `.env.local` (no `.env.local.txt`)
- Reinicia el servidor después de crear/modificar `.env.local`

## 📚 Siguientes Pasos

- [Configuración Localhost](../02-configuracion/localhost.md)
- [Google OAuth Setup](../03-autenticacion/google-oauth-setup.md)
- [Flujo de Trabajo](../04-desarrollo/flujo-trabajo.md)

---

**¿Necesitas ayuda?** Revisa la sección de [Troubleshooting](../06-troubleshooting/README.md)

