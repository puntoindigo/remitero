# 🔐 Análisis Completo de Infraestructura de Identidad - Remitero

**Fecha de Análisis**: Enero 2025  
**Sistema de Autenticación**: NextAuth.js (NO Auth0)  
**Proveedor OAuth**: Google OAuth 2.0

---

## ⚠️ IMPORTANTE: NO SE USA AUTH0

**Tu aplicación NO utiliza Auth0**. En su lugar, utiliza:

- **NextAuth.js** como framework de autenticación
- **Google OAuth 2.0** como proveedor de identidad
- **Supabase** como base de datos
- **JWT** para sesiones (gestionado por NextAuth)

---

## 1. Infraestructura de identidad

### ¿En qué archivos se configura NextAuth/Google OAuth? Rutas exactas.

**Archivo principal de configuración:**

- `src/lib/auth.ts` - Configuración completa de NextAuth

**Archivo de rutas de NextAuth:**

- `src/app/api/auth/[...nextauth]/route.ts` - Handler de NextAuth

**Variables de entorno:**

- `env.example` - Template de variables
- `.env.local` (local) o variables en Vercel (producción)

### ¿Dónde está configurado el dominio, client_id, client_secret y audiencia?

**Ubicación:** `src/lib/auth.ts` (líneas 35-36, 68-69)

```typescript
const GOOGLE_CLIENT_ID = cleanEnv(process.env.GOOGLE_CLIENT_ID);
const GOOGLE_CLIENT_SECRET = cleanEnv(process.env.GOOGLE_CLIENT_SECRET);
```

**Variables de entorno requeridas:**

- `GOOGLE_CLIENT_ID` - Client ID de Google OAuth
- `GOOGLE_CLIENT_SECRET` - Client Secret de Google OAuth
- `NEXTAUTH_URL` - URL base de la aplicación
- `NEXTAUTH_SECRET` - Secreto para firmar tokens JWT

**Configuración del provider:**
```67:79:src/lib/auth.ts
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Solo pide seleccionar cuenta, no consent cada vez
          access_type: "offline",
          response_type: "code"
        }
      },
      // Agregar logging en el provider
      checks: ["pkce", "state"],
    }),
```

**NOTA:** No hay "audiencia" como en Auth0. NextAuth maneja las sesiones internamente con JWT.

### ¿Se está usando Universal Login o login embebido?

**Login embebido** - La aplicación tiene su propia página de login en:
- `src/app/auth/login/page.tsx`

El usuario puede elegir entre:

1. **Login con Google OAuth** - Redirección a Google
2. **Login con Email/Password** - Formulario embebido

### ¿Está habilitado SSO entre aplicaciones?

**NO** - No hay SSO configurado. Cada aplicación NextAuth maneja su propia autenticación independientemente.

---

## 2. Flujos de autenticación

### ¿Qué flujo OAuth/OIDC está usando la app?

**Flujo: Authorization Code con PKCE**

Configuración en `src/lib/auth.ts`:

- `response_type: "code"` - Authorization Code flow
- `checks: ["pkce", "state"]` - PKCE habilitado para seguridad
- `access_type: "offline"` - Para obtener refresh tokens (aunque NextAuth no los usa directamente)

### ¿Dónde se valida en el backend el token JWT emitido por NextAuth? Rutas exactas.

**Middleware de Next.js:**

- `src/middleware.ts` - Valida tokens en todas las rutas protegidas usando `getToken` de `next-auth/jwt`

**Validación en API Routes:**

Todos los endpoints en `src/app/api/` usan `getServerSession`:

**Ejemplos de endpoints que validan:**

- `src/app/api/users/route.ts` - Línea 9: `getServerSession(authOptions)`
- `src/app/api/remitos/route.ts` - Validación de sesión
- `src/app/api/products/route.ts` - Validación de sesión
- `src/app/api/clients/route.ts` - Validación de sesión
- `src/app/api/companies/route.ts` - Línea 9: `getServerSession(authOptions)`
- `src/app/api/dashboard/route.ts` - Validación de sesión

**Total de endpoints protegidos:** 35+ archivos en `src/app/api/`

### ¿Hay algún refresh token implementado? Mostrar archivos donde se maneja.

**NO** - NextAuth maneja la renovación de tokens automáticamente. No hay implementación explícita de refresh tokens.

**Configuración de sesión:**
```201:203:src/lib/auth.ts
  session: {
    strategy: "jwt"
  },
```

NextAuth renueva los tokens JWT automáticamente cuando se accede a la sesión.

### ¿El login y el registro están separados? ¿Dónde?

**SÍ, están separados:**

**Login:**

- `src/app/auth/login/page.tsx` - Página de login
- Soporta Google OAuth y Email/Password

**Registro:**

- **NO hay registro público** - Los usuarios deben ser creados por administradores
- Creación de usuarios: `src/app/api/users/route.ts` (POST) - Solo ADMIN/SUPERADMIN
- Formulario de creación: `src/components/forms/UsuarioForm.tsx`
- Página de gestión: `src/app/usuarios/page.tsx`

**Flujo de registro:**

1. ADMIN/SUPERADMIN crea usuario en `/usuarios`
2. Se envía email de invitación automáticamente
3. Usuario accede con Google OAuth o Email/Password según su email

---

## 3. Roles, permisos y claims

### ¿Se usan roles o permisos de Google OAuth? Si sí, ¿en qué archivos se consumen?

**NO** - Los roles son **internos de la aplicación**, no vienen de Google OAuth.

Google OAuth solo proporciona:
- Email
- Nombre
- Foto (no se usa actualmente)

### ¿La app tiene roles internos propios? ¿En qué archivo se definen?

**SÍ** - Roles definidos en múltiples lugares:

**Definición de tipos:**
- `src/lib/validations.ts` - Línea 7: `role: z.enum(["SUPERADMIN", "ADMIN", "USER"])`
- `src/types/next-auth.d.ts` - Tipos TypeScript para roles

**Roles disponibles:**
1. **SUPERADMIN** - Acceso total, gestión multi-empresa
2. **ADMIN** - Gestión completa de su empresa
3. **USER** - Acceso limitado a operaciones básicas

**Documentación de roles:**
- `docs/SISTEMA_COMPLETO.md` - Líneas 158-189

### ¿Dónde se mapean los roles/claims del token al usuario interno?

**Mapeo en callbacks de NextAuth:**

**1. Durante el login (signIn callback):**
```411:420:src/lib/auth.ts
            (user as any).role = existingUser.role;
            (user as any).companyId = existingUser.company_id;
            (user as any).hasTemporaryPassword = existingUser.has_temporary_password || false;
            (user as any).enable_botonera = existingUser.enable_botonera ?? false;
            (user as any).enable_pinned_modals = existingUser.enable_pinned_modals ?? false;
            console.log('🔐 [NextAuth signIn] Datos asignados al user object:', {
              id: user.id,
              role: (user as any).role,
              companyId: (user as any).companyId
            });
```

**2. En el JWT callback:**
```515:522:src/lib/auth.ts
        token.role = user.role || (user as any).role
        token.companyId = user.companyId || (user as any).companyId
        token.companyName = (user as any).companyName
        token.impersonatingUserId = (user as any).impersonatingUserId
        token.hasTemporaryPassword = (user as any).hasTemporaryPassword || false
        token.enable_botonera = (user as any).enable_botonera ?? false
        token.enable_pinned_modals = (user as any).enable_pinned_modals ?? false
```

**3. En el session callback:**
```580:587:src/lib/auth.ts
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        ;(session.user as any).impersonatingUserId = token.impersonatingUserId as string
        ;(session.user as any).hasTemporaryPassword = token.hasTemporaryPassword ?? false
        ;(session.user as any).enable_botonera = token.enable_botonera ?? false
        ;(session.user as any).enable_pinned_modals = token.enable_pinned_modals ?? false
```

### ¿Existe "multi-empresa / multi-tenant" en el modelo de usuario? Ubicación exacta.

**SÍ** - Sistema multi-empresa completo implementado.

**Modelo de datos:**
- Tabla `companies` - Empresas del sistema
- Campo `users.company_id` - Relación usuario-empresa
- SUPERADMIN puede tener `company_id = null` para acceder a todas

**Implementación:**
- `src/lib/auth-helpers.ts` - Funciones helper para companyId
- `src/hooks/useDataWithCompanySimple.ts` - Hook para manejo de empresa
- `src/app/api/companies/route.ts` - API de empresas

**Aislamiento de datos:**
Todas las tablas tienen `company_id`:
- `remitos.company_id`
- `products.company_id`
- `clients.company_id`
- `categories.company_id`
- `estados_remitos.company_id`

**Documentación:**
- `docs/SISTEMA_COMPLETO.md` - Líneas 191-196

---

## 4. Modelo de usuario

### ¿Dónde está el modelo de usuario en la base de datos? Mostrar el archivo completo.

**No hay un archivo SQL único** - El modelo se construyó con migraciones:

**Migraciones relacionadas:**
- `migrations/add_is_active_to_users.sql` - Campo `is_active`
- `migrations/add_password_reset_token_to_users.sql` - Campos de reset
- `migrations/allow_null_password_in_users.sql` - Permitir password NULL
- `migrations/add_enable_botonera_to_users.sql` - Preferencias UI
- `migrations/add_enable_pinned_modals_to_users.sql` - Preferencias UI

**Estructura de la tabla `users` (según código y documentación):**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NULL, -- NULL para usuarios Gmail (OAuth)
  role VARCHAR(20) NOT NULL CHECK (role IN ('SUPERADMIN', 'ADMIN', 'USER')),
  company_id UUID REFERENCES companies(id) NULL, -- NULL para SUPERADMIN
  is_active BOOLEAN DEFAULT TRUE,
  password_reset_token VARCHAR(255) NULL,
  password_reset_expires TIMESTAMP WITH TIME ZONE NULL,
  has_temporary_password BOOLEAN DEFAULT FALSE,
  enable_botonera BOOLEAN DEFAULT FALSE,
  enable_pinned_modals BOOLEAN DEFAULT FALSE,
  phone TEXT NULL,
  address TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Referencia en código:**
- `docs/SISTEMA_COMPLETO.md` - Líneas 334-345

### ¿Cómo se asocia el usuario interno con el sub de NextAuth?

**Asociación por email:**

En el callback `signIn` de NextAuth:
```266:271:src/lib/auth.ts
          const { data: existingUser, error: findError } = await supabaseAdmin
            .schema(currentSchema)
            .from('users')
            .select('*, has_temporary_password')
            .eq('email', email)
            .single();
```

**Flujo:**
1. Usuario se autentica con Google OAuth
2. NextAuth obtiene email de Google
3. Se busca usuario en BD por email
4. Si existe, se asocia el `id` de la BD con el `sub` del JWT
5. Si no existe, se deniega el acceso (no se crean usuarios automáticamente)

**El `sub` del JWT es el `id` del usuario en la BD:**
```580:580:src/lib/auth.ts
        session.user.id = token.sub!
```

### ¿Qué campos guarda localmente la app sobre el usuario?

**Campos almacenados en la tabla `users`:**
- `id` - UUID único
- `email` - Email del usuario (único)
- `name` - Nombre completo
- `password` - Hash bcrypt (NULL para Gmail)
- `role` - SUPERADMIN, ADMIN, USER
- `company_id` - ID de empresa (NULL para SUPERADMIN)
- `is_active` - Estado activo/inactivo
- `phone` - Teléfono (opcional)
- `address` - Dirección (opcional)
- `password_reset_token` - Token para reset
- `password_reset_expires` - Expiración del token
- `has_temporary_password` - Flag de contraseña temporal
- `enable_botonera` - Preferencia UI
- `enable_pinned_modals` - Preferencia UI
- `created_at` - Fecha de creación
- `updated_at` - Fecha de actualización

**Campos en el token JWT (sesión):**
- `id` (sub)
- `email`
- `name`
- `role`
- `companyId`
- `companyName`
- `hasTemporaryPassword`
- `enable_botonera`
- `enable_pinned_modals`
- `impersonatingUserId` (si hay impersonation)

### ¿Existe verificación de email? ¿Dónde se controla?

**NO hay verificación de email explícita** - El email se verifica implícitamente:

1. **Para Google OAuth:** Google ya verificó el email
2. **Para Email/Password:** No hay verificación adicional

**Sistema de invitación:**
- Al crear usuario, se envía email de invitación
- `src/lib/email.ts` - Función `sendInvitationEmail`
- `src/app/api/users/route.ts` - Líneas 431-478 (envío de invitación)

**NO hay:**
- Verificación de email con token
- Confirmación de email requerida
- Estado `email_verified` en la BD

---

## 5. Sesiones y seguridad

### ¿Cómo se manejan las sesiones? (cookies, localStorage, server session)

**Estrategia: JWT en cookies HTTP-only**

**Configuración:**
```201:203:src/lib/auth.ts
  session: {
    strategy: "jwt"
  },
```

**Almacenamiento:**
- NextAuth almacena el JWT en **cookies HTTP-only** (seguro)
- Nombre de cookie: `next-auth.session-token` (o `__Secure-next-auth.session-token` en HTTPS)
- **NO se usa localStorage** para tokens (solo para preferencias UI como `selectedCompanyId`)

**SessionProvider:**
- `src/components/providers/SessionProvider.tsx` - Configuración del provider
- `refetchInterval: 5 * 60` - Refetch cada 5 minutos

### ¿Existe expiración configurable del token? ¿Dónde se define?

**SÍ, pero con valores por defecto de NextAuth:**

NextAuth usa valores por defecto:
- **JWT expiración:** 30 días (no configurable explícitamente en el código)
- **Session maxAge:** 30 días (por defecto)

**NO hay configuración explícita** en `src/lib/auth.ts` para:
- `jwt.maxAge`
- `session.maxAge`

**Para configurar expiración, agregar en `authOptions`:**
```typescript
jwt: {
  maxAge: 30 * 24 * 60 * 60, // 30 días en segundos
},
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 días
}
```

### ¿Hay logout global? ¿Dónde está implementado el logout?

**SÍ** - Logout implementado en múltiples componentes:

**1. Endpoint de logout:**
- `src/app/api/auth/logout/route.ts` - Registra actividad antes de logout

**2. Implementaciones en UI:**
- `src/components/layout/TopBar.tsx` - Líneas 147-214
- `src/components/layout/Header.tsx` - Líneas 70-90
- `src/components/common/UserPanel.tsx` - Líneas 28-49
- `src/components/layout/MobileMenu.tsx` - Líneas 50-70

**Flujo de logout:**
1. Llama a `signOut()` de NextAuth
2. Limpia cookies de NextAuth manualmente
3. Limpia `sessionStorage` y `localStorage`
4. Redirige a `/auth/login`
5. Registra actividad `LOGOUT` en logs

**Ejemplo de implementación:**
```147:196:src/components/layout/TopBar.tsx
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Registrar logout en el servidor
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {
        // Ignorar errores silenciosamente
      });
      
      // Hacer logout en NextAuth
      await signOut({
        redirect: false,
        callbackUrl: '/auth/login'
      }).catch(() => {
        // Ignorar errores silenciosamente
      });
      
      // Limpiar todas las cookies relacionadas con NextAuth
      // Esto asegura que la sesión se cierre completamente
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName.startsWith('next-auth') || cookieName.startsWith('__Secure-next-auth')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }
      });
      
      // Redirigir inmediatamente usando window.location con replace para evitar que el usuario pueda volver atrás
      window.location.replace('/auth/login');
    } catch (error) {
      // Si hay algún error, limpiar cookies y redirigir de todas formas
      if (typeof window !== 'undefined') {
        // Limpiar cookies de todas formas
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.trim().split("=")[0];
          if (cookieName.startsWith('next-auth') || cookieName.startsWith('__Secure-next-auth')) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          }
        });
        sessionStorage.clear();
        localStorage.removeItem('impersonation');
        window.location.replace('/auth/login');
      }
    }
  };
```

### ¿Hay rate-limit o bloqueo de cuenta en el login?

**NO** - No hay rate limiting implementado.

**Lo que SÍ existe:**
- Verificación de usuario activo (`is_active = false` bloquea login)
- Validación de credenciales (email/password incorrectos)

**Lo que NO existe:**
- Rate limiting por IP
- Bloqueo temporal después de X intentos fallidos
- Captcha después de múltiples intentos
- Lockout de cuenta

**Recomendación:** Implementar rate limiting con middleware o librería como `next-rate-limit`.

### ¿Hay auditoría de acceso? ¿Dónde se registran los logs?

**SÍ** - Sistema completo de auditoría implementado.

**Tabla de logs:**
- `user_activity_logs` - Tabla en Supabase
- Migración: `migrations/create_user_activity_logs.sql`

**Logger principal:**
- `src/lib/user-activity-logger.ts` - Función `logUserActivity()`

**Acciones registradas:**
- `LOGIN` - Inicio de sesión
- `LOGOUT` - Cierre de sesión
- `CREATE_USER` - Creación de usuario
- `UPDATE_USER` - Actualización de usuario
- `DELETE_USER` - Eliminación de usuario
- `CREATE_REMITO` - Creación de remito
- `UPDATE_REMITO` - Actualización de remito
- `PASSWORD_RESET_COMPLETED` - Reset de contraseña
- Y muchas más (ver `src/lib/user-activity-types.ts`)

**Campos registrados:**
- `user_id` - Usuario que realizó la acción
- `action` - Tipo de acción
- `description` - Descripción opcional
- `metadata` - JSONB con detalles adicionales (IP, user agent, etc.)
- `created_at` - Timestamp

**Endpoints de consulta:**
- `src/app/api/users/[id]/activity-logs/route.ts` - Obtener logs de un usuario
- Solo ADMIN y SUPERADMIN pueden ver logs de otros usuarios

**Logger adicional (archivo):**
- `src/lib/logger.ts` - Logger que escribe a archivo `logs/user-actions.log`
- Registra: login, logout, creación de recursos

---

## 6. Recuperación de contraseña y MFA

### ¿Dónde está implementado el flujo de "olvidé mi contraseña"?

**Implementado completamente:**

**1. Endpoint de solicitud:**
- `src/app/api/auth/forgot-password/route.ts` - POST para solicitar reset

**2. Endpoint de reset:**
- `src/app/api/auth/reset-password/route.ts` - POST para cambiar contraseña con token

**3. Página de reset:**
- `src/app/auth/reset-password/page.tsx` - UI para resetear contraseña

**4. Email de reset:**
- `src/lib/email-reset-password.ts` - Función `sendPasswordResetEmail()`

**Flujo completo:**
1. Usuario ingresa email en "Olvidé mi contraseña"
2. Se genera token único (32 bytes hex)
3. Se guarda `password_reset_token` y `password_reset_expires` (48 horas)
4. Se envía email con link: `/auth/reset-password?token=xxx`
5. Usuario hace clic, ingresa nueva contraseña
6. Se valida token y expiración
7. Se actualiza contraseña (hash bcrypt)
8. Se limpia token

**Código de generación de token:**
```59:64:src/app/api/users/[id]/reset-password/route.ts
    // Generar token único para reset de contraseña (32 caracteres hexadecimales)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración (48 horas desde ahora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
```

### ¿Se usa el password reset de Google OAuth o custom?

**Custom** - Sistema propio implementado en la aplicación.

**Google OAuth:**
- Solo se usa para autenticación
- NO se usa para reset de contraseña
- Usuarios Gmail no tienen contraseña en la BD (`password = NULL`)

**Sistema custom:**
- Token único generado con `crypto.randomBytes()`
- Expiración de 48 horas
- Email enviado con link de reset
- Validación en backend antes de cambiar contraseña

### ¿Hay MFA activado (TOTP, SMS, email-OTP)? ¿En qué archivo o configuración aparece?

**NO** - No hay MFA (Multi-Factor Authentication) implementado.

**Lo que existe:**
- Autenticación de dos factores con Google OAuth (si el usuario tiene 2FA en Google)
- Pero NO hay MFA propio de la aplicación

**Falta implementar:**
- TOTP (Time-based One-Time Password) con apps como Google Authenticator
- SMS OTP
- Email OTP
- Backup codes

---

## 7. Multiplicidad de apps / APIs

### ¿Cuántas aplicaciones están registradas en Google OAuth para este proyecto?

**Según la documentación y archivos:**
- Al menos **1 aplicación** registrada en Google Cloud Console
- Client ID visible en código: `117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com`
- Archivos de configuración encontrados:
  - `client_secret_442455029183-52a0dpfgs10d0a0nv3i00snep247tdrc.apps.googleusercontent.com.json`
  - `client_secret_2_442455029183-52a0dpfgs10d0a0nv3i00snep247tdrc.apps.googleusercontent.com.json`

**Parece haber 2 clientes OAuth diferentes** (diferentes project numbers: 117638263113 vs 442455029183)

### ¿Dónde se configuran las APIs protegidas (audience)?

**NO aplica** - NextAuth no usa "audience" como Auth0.

**Protección de rutas:**
- `src/middleware.ts` - Middleware que protege rutas
- Usa `getToken()` de `next-auth/jwt` para validar

**Configuración de rutas protegidas:**
```83:93:src/middleware.ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/remitos/:path*",
    "/productos/:path*",
    "/clientes/:path*",
    "/categorias/:path*",
    "/usuarios/:path*",
    "/empresas/:path*",
  ]
}
```

### ¿Qué endpoints requieren token? Listado por ruta.

**Todos los endpoints en `src/app/api/` requieren autenticación** (excepto públicos):

**Endpoints públicos (NO requieren token):**
- `/api/auth/[...nextauth]` - Rutas de NextAuth (login, callback)
- `/api/auth/forgot-password` - Solicitar reset (público)
- `/api/auth/reset-password` - Reset con token (público con token válido)
- `/api/debug` - Debug (público según middleware)

**Endpoints protegidos (requieren token):**

**Autenticación:**
- `/api/auth/logout` - POST
- `/api/auth/verify-session` - GET
- `/api/auth/check-user-status` - POST
- `/api/auth/impersonate` - POST
- `/api/auth/stop-impersonation` - POST

**Usuarios:**
- `/api/users` - GET, POST
- `/api/users/[id]` - GET, PUT, DELETE
- `/api/users/[id]/reset-password` - POST
- `/api/users/[id]/resend-invitation` - POST
- `/api/users/[id]/activity-logs` - GET
- `/api/users/[id]/clear-temporary-password` - POST

**Empresas:**
- `/api/companies` - GET, POST
- `/api/companies/[id]` - GET, PUT, DELETE
- `/api/companies/[id]/duplicate` - POST

**Remitos:**
- `/api/remitos` - GET, POST
- `/api/remitos/[id]` - GET, PUT, DELETE
- `/api/remitos/[id]/status` - PATCH
- `/api/remitos/number/[number]` - GET

**Productos:**
- `/api/products` - GET, POST
- `/api/products/[id]` - GET, PUT, DELETE

**Clientes:**
- `/api/clients` - GET, POST
- `/api/clients/[id]` - GET, PUT, DELETE

**Categorías:**
- `/api/categories` - GET, POST
- `/api/categories/[id]` - GET, PUT, DELETE

**Estados de Remitos:**
- `/api/estados-remitos` - GET, POST
- `/api/estados-remitos/[id]` - GET, PUT, DELETE

**Dashboard:**
- `/api/dashboard` - GET

**Perfil:**
- `/api/profile` - GET, PUT

**Notificaciones:**
- `/api/notifications/preferences` - GET, POST
- `/api/notifications/disable` - GET

**Admin:**
- `/api/admin/logs` - GET (solo SUPERADMIN)

**Cache:**
- `/api/cache/invalidate` - POST

**Email:**
- `/api/email/diagnose` - GET (solo SUPERADMIN)
- `/api/email/test` - POST

**Tasks:**
- `/api/tasks` - GET, POST

### ¿Hay algún lugar donde la app use más de un client_id?

**NO** - Solo se usa un `GOOGLE_CLIENT_ID` a la vez.

**Configuración:**
- Una sola variable `GOOGLE_CLIENT_ID` en `src/lib/auth.ts`
- Un solo `GoogleProvider` configurado

**NOTA:** Los archivos JSON de client secret encontrados sugieren que puede haber múltiples clientes configurados en Google Cloud, pero la app solo usa uno a la vez.

---

## 8. Versionado, entornos y migración

### ¿Dónde están definidas las variables de entorno relacionadas a NextAuth/Google OAuth?

**Archivos de referencia:**
- `env.example` - Template de variables
- `.env.local` - Variables locales (no en repo)
- Variables en Vercel para producción/preview

**Variables relacionadas con autenticación:**

```10:22:env.example
# NextAuth Configuration
# NEXTAUTH_URL se detecta automáticamente en desarrollo (soporta cualquier puerto)
# Para producción, especifica la URL completa: NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_URL=""
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth Configuration
# Obtén estas credenciales desde: https://console.cloud.google.com/apis/credentials
# Crear un proyecto > Habilitar Google+ API > Crear credenciales OAuth 2.0
# Agregar URI de redirección autorizada: http://localhost:8000/api/auth/callback/google (desarrollo)
# Agregar URI de redirección autorizada: https://tu-dominio.com/api/auth/callback/google (producción)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Otras variables relacionadas:**
- `DATABASE_SCHEMA` - Schema de BD (dev/public)
- `VERCEL_ENV` - Entorno de Vercel
- `VERCEL_URL` - URL de Vercel (auto)

**Documentación:**
- `VARIABLES_ENTORNO_VERCEL.md` - Guía de variables
- `CONFIGURACION_LOCALHOST.md` - Configuración local

### ¿Hay separación por entornos (dev, staging, prod)?

**SÍ** - Separación completa por entornos:

**1. Base de datos:**
- Schema `dev` - Desarrollo y preview branches
- Schema `public` - Producción
- Configurado en `src/lib/supabase.ts`:

```typescript
const databaseSchema = 
  process.env.VERCEL_ENV === 'production' ? 'public' : 
  (process.env.DATABASE_SCHEMA || 'dev');
```

**2. Variables de entorno:**
- Vercel maneja variables por entorno (Development, Preview, Production)
- `VERCEL_ENV` indica el entorno actual

**3. URLs:**
- Desarrollo: `http://localhost:8000` (o puerto configurado)
- Preview: `https://remitero-dev-*.vercel.app` (auto por Vercel)
- Producción: `https://remitero-dev.vercel.app` (o dominio custom)

**4. Configuración de NextAuth URL:**
```14:32:src/lib/auth.ts
const getNextAuthUrl = (): string => {
  // PRIORIDAD 1: Si hay NEXTAUTH_URL explícito, usarlo (tiene prioridad)
  const explicitNextAuthUrl = cleanEnv(process.env.NEXTAUTH_URL);
  if (explicitNextAuthUrl) {
    console.log('🔧 [NextAuth URL] Usando NEXTAUTH_URL explícito:', explicitNextAuthUrl);
    return explicitNextAuthUrl;
  }
  
  // PRIORIDAD 2: En Vercel, usar VERCEL_URL si está disponible
  if (process.env.VERCEL_URL) {
    const vercelUrl = `https://${process.env.VERCEL_URL}`;
    console.log('🔧 [NextAuth URL] Usando VERCEL_URL:', vercelUrl);
    return vercelUrl;
  }
  
  // PRIORIDAD 3: Fallback para desarrollo local
  console.log('🔧 [NextAuth URL] Usando fallback localhost');
  return 'http://localhost:8000';
};
```

### ¿Existe algún código para migrar usuarios?

**NO** - No hay código específico para migrar usuarios entre sistemas.

**Lo que existe:**
- Migraciones de esquema de BD (en `migrations/`)
- Scripts de copia de datos: `migrations/copy_data_prod_to_dev.sql`
- Scripts de estructura: `migrations/copy_structure_to_dev.sql`

**NO hay:**
- Migración desde Auth0
- Migración desde otro sistema de autenticación
- Importación masiva de usuarios desde CSV/JSON

### ¿Hay código que dependa directamente de proveedores externos específicos (lock-in)?

**SÍ, dependencias de proveedores:**

**1. NextAuth.js:**
- Framework de autenticación
- Lock-in: Medio (se puede migrar, pero requiere refactor)

**2. Google OAuth:**
- Proveedor de identidad
- Lock-in: Alto (usuarios Gmail dependen de Google)

**3. Supabase:**
- Base de datos y backend
- Lock-in: Medio (PostgreSQL es portable, pero funciones específicas de Supabase no)

**Código específico de NextAuth:**
- `src/lib/auth.ts` - Configuración NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` - Handler NextAuth
- Uso de `getServerSession`, `signIn`, `signOut` en todo el código

**Código específico de Google:**
- `src/lib/auth.ts` - `GoogleProvider`
- `src/lib/email.ts` - OAuth2 de Google para emails

**Para migrar a Auth0 u otro proveedor:**
- Requeriría reescribir toda la lógica de autenticación
- Cambiar callbacks de NextAuth
- Adaptar el flujo de login
- Migrar usuarios existentes

---

## 🧩 RESUMEN EJECUTIVO

### ✅ Funcionalidades Completas

1. **Autenticación básica:**
   - ✅ Login con Google OAuth
   - ✅ Login con Email/Password
   - ✅ Logout global
   - ✅ Sesiones JWT seguras

2. **Gestión de usuarios:**
   - ✅ CRUD completo de usuarios
   - ✅ Sistema de roles (SUPERADMIN, ADMIN, USER)
   - ✅ Activación/desactivación de usuarios
   - ✅ Reset de contraseña con token

3. **Multi-empresa:**
   - ✅ Aislamiento completo de datos por empresa
   - ✅ Selector de empresa para SUPERADMIN
   - ✅ Filtrado automático por `company_id`

4. **Seguridad básica:**
   - ✅ Validación de tokens en middleware
   - ✅ Verificación de permisos por rol
   - ✅ Contraseñas hasheadas con bcrypt
   - ✅ Tokens de reset con expiración

5. **Auditoría:**
   - ✅ Logs de actividad de usuarios
   - ✅ Registro de acciones críticas
   - ✅ Endpoints para consultar logs

### ❌ Funcionalidades Faltantes

1. **SSO (Single Sign-On):**
   - ❌ No hay SSO entre aplicaciones
   - ❌ No hay federación de identidad
   - ❌ No hay SAML/OIDC para empresas

2. **MFA (Multi-Factor Authentication):**
   - ❌ No hay TOTP (Google Authenticator, etc.)
   - ❌ No hay SMS OTP
   - ❌ No hay Email OTP
   - ❌ No hay backup codes

3. **Seguridad avanzada:**
   - ❌ No hay rate limiting
   - ❌ No hay bloqueo de cuenta después de intentos fallidos
   - ❌ No hay captcha
   - ❌ No hay verificación de email explícita
   - ❌ No hay políticas de contraseña configurables

4. **Gestión avanzada:**
   - ❌ No hay grupos de usuarios
   - ❌ No hay permisos granulares (solo roles)
   - ❌ No hay delegación de permisos
   - ❌ No hay expiración de sesión configurable por usuario/rol

5. **Integraciones:**
   - ❌ No hay LDAP/Active Directory
   - ❌ No hay otros proveedores OAuth (solo Google)
   - ❌ No hay SAML

### ⚠️ Riesgos de Seguridad Existentes

1. **Alto:**
   - ❌ **Sin rate limiting** - Vulnerable a ataques de fuerza bruta
   - ❌ **Sin bloqueo de cuenta** - Intentos ilimitados de login
   - ❌ **Sin verificación de email** - Emails no verificados pueden crear problemas

2. **Medio:**
   - ⚠️ **Dependencia de Google OAuth** - Si Google falla, usuarios Gmail no pueden acceder
   - ⚠️ **Sin MFA** - Solo protección de contraseña (o Google 2FA si el usuario lo tiene)
   - ⚠️ **Tokens JWT largos (30 días)** - Sesiones muy largas aumentan riesgo si se compromete

3. **Bajo:**
   - ✅ Contraseñas hasheadas correctamente (bcrypt)
   - ✅ Tokens de reset con expiración
   - ✅ Validación de permisos en backend
   - ✅ Cookies HTTP-only para sesiones

### 🚀 Qué Implementar para SSO, Roles, Tenants y MFA a Nivel Enterprise

#### 1. **SSO (Single Sign-On)**

**Opción A: Migrar a Auth0**
- Implementar Auth0 como proveedor de identidad
- Configurar Universal Login
- Habilitar SSO entre aplicaciones
- Configurar conexiones sociales (Google, Microsoft, etc.)
- **Esfuerzo:** Alto (refactor completo)

**Opción B: Implementar SAML/OIDC propio**
- Agregar soporte SAML 2.0
- Agregar soporte OIDC
- Crear Identity Provider (IdP)
- **Esfuerzo:** Muy Alto (desarrollo desde cero)

**Opción C: Usar NextAuth con múltiples proveedores**
- Agregar Microsoft Azure AD
- Agregar Okta
- Agregar otros proveedores OAuth
- **Esfuerzo:** Medio (configuración de providers)

#### 2. **Roles y Permisos Granulares**

**Implementar:**
- Sistema de permisos granulares (no solo roles)
- Tabla `permissions` con permisos específicos
- Tabla `role_permissions` para asignar permisos a roles
- Tabla `user_permissions` para permisos individuales
- Middleware de permisos en cada endpoint
- **Archivos a crear:**
  - `src/lib/permissions.ts` - Lógica de permisos
  - `src/app/api/permissions/route.ts` - API de permisos
  - Migraciones para nuevas tablas

**Ejemplo de estructura:**
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  resource VARCHAR(50), -- 'remitos', 'users', etc.
  action VARCHAR(50)   -- 'create', 'read', 'update', 'delete'
);

CREATE TABLE role_permissions (
  role VARCHAR(20),
  permission_id UUID,
  PRIMARY KEY (role, permission_id)
);
```

#### 3. **Multi-Tenant Avanzado**

**Mejorar sistema actual:**
- ✅ Ya existe aislamiento por `company_id`
- Agregar **subdominios por tenant** (ej: `empresa1.remitero.com`)
- Agregar **custom domains** por empresa
- Agregar **configuración por tenant** (branding, colores, etc.)
- Agregar **límites por tenant** (usuarios máximos, remitos máximos, etc.)
- **Archivos a modificar:**
  - `src/middleware.ts` - Detectar tenant por subdominio
  - `src/lib/tenant-config.ts` - Configuración por tenant
  - Nueva tabla `tenant_settings`

#### 4. **MFA (Multi-Factor Authentication)**

**Implementar TOTP:**
- Librería: `otplib` o `speakeasy`
- Tabla `user_mfa` con secret TOTP
- Endpoint `/api/auth/mfa/setup` - Generar QR
- Endpoint `/api/auth/mfa/verify` - Verificar código
- Modificar login para requerir MFA después de password
- **Archivos a crear:**
  - `src/lib/mfa.ts` - Lógica TOTP
  - `src/app/api/auth/mfa/route.ts` - API MFA
  - `src/components/auth/MFASetup.tsx` - UI setup
  - `src/components/auth/MFAVerify.tsx` - UI verificación

**Implementar SMS OTP (opcional):**
- Integración con Twilio o similar
- Tabla `user_mfa_sms` con número de teléfono
- Endpoint para enviar código SMS
- **Costo:** Requiere servicio de SMS pago

**Implementar Email OTP (más fácil):**
- Reutilizar sistema de email existente
- Generar código de 6 dígitos
- Enviar por email
- Validar código

**Backup Codes:**
- Generar 10 códigos únicos al activar MFA
- Guardar hash en BD
- Permitir usar una vez cada código

#### 5. **Seguridad Avanzada**

**Rate Limiting:**
- Implementar con `next-rate-limit` o `@upstash/ratelimit`
- Limitar intentos de login por IP (ej: 5 por minuto)
- Limitar requests por usuario (ej: 100 por minuto)

**Bloqueo de cuenta:**
- Tabla `login_attempts` con IP, email, timestamp
- Bloquear después de 5 intentos fallidos
- Desbloquear después de 15 minutos o manualmente por admin

**Verificación de email:**
- Agregar campo `email_verified` a `users`
- Enviar email de verificación al crear usuario
- Requerir verificación para ciertas acciones
- Endpoint `/api/auth/verify-email?token=xxx`

**Políticas de contraseña:**
- Tabla `password_policies` (longitud mínima, complejidad, etc.)
- Validar al crear/cambiar contraseña
- Forzar cambio periódico (ej: cada 90 días)

**Expiración de sesión configurable:**
- Agregar `session_timeout_minutes` por usuario/rol
- Implementar refresh automático
- Cerrar sesión después de inactividad

#### 6. **Migración a Auth0 (Recomendado para Enterprise)**

Si decides migrar a Auth0:

**Ventajas:**
- ✅ SSO out-of-the-box
- ✅ MFA integrado (TOTP, SMS, Push)
- ✅ Rate limiting automático
- ✅ Políticas de contraseña configurables
- ✅ Análisis de seguridad (anomalías, brechas)
- ✅ Compliance (SOC2, HIPAA, etc.)
- ✅ Multi-factor sin desarrollo propio

**Pasos de migración:**
1. Crear cuenta Auth0 y configurar aplicación
2. Configurar conexiones (Google, Database, etc.)
3. Migrar usuarios existentes a Auth0
4. Reemplazar NextAuth con Auth0 SDK
5. Adaptar callbacks y middleware
6. Probar en staging
7. Deploy a producción

**Archivos a modificar:**
- `src/lib/auth.ts` → Usar `@auth0/nextjs-auth0`
- `src/middleware.ts` → Usar `getSession` de Auth0
- Todos los `getServerSession` → `getSession` de Auth0
- Adaptar tipos en `src/types/next-auth.d.ts`

**Esfuerzo estimado:** 2-3 semanas de desarrollo + testing

---

## 📋 Checklist de Implementación Recomendada

### Prioridad Alta (Seguridad Crítica)
- [ ] Implementar rate limiting en login
- [ ] Implementar bloqueo de cuenta después de intentos fallidos
- [ ] Agregar verificación de email
- [ ] Configurar expiración de sesión más corta (ej: 8 horas)

### Prioridad Media (Funcionalidad Enterprise)
- [ ] Implementar MFA (TOTP como mínimo)
- [ ] Agregar permisos granulares
- [ ] Implementar políticas de contraseña
- [ ] Agregar logs de seguridad (intentos fallidos, cambios de contraseña, etc.)

### Prioridad Baja (Mejoras)
- [ ] Evaluar migración a Auth0
- [ ] Implementar SSO si hay múltiples aplicaciones
- [ ] Agregar subdominios por tenant
- [ ] Implementar SMS OTP (si hay presupuesto)

---

**Fin del análisis**

