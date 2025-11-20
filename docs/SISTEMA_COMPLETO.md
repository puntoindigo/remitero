# 📋 Documentación Completa del Sistema Remitero

**Repositorio**: https://github.com/puntoindigo/remitero  
**Branch Principal**: `develop`  
**Branch Producción**: `main`  
**Última Actualización**: Enero 2025

---

## 🎯 Descripción General

**Remitero** es un sistema web completo de gestión de remitos (recibos de entrega) diseñado para empresas que necesitan gestionar entregas de productos a clientes. El sistema incluye funcionalidades completas de CRUD para múltiples entidades, sistema de roles y permisos, soporte multi-empresa, autenticación con Google OAuth y credenciales tradicionales, y un sistema robusto de logging y auditoría.

### Características Principales

- ✅ **Gestión completa de remitos** con estados personalizables
- ✅ **Multi-empresa** con aislamiento de datos
- ✅ **Sistema de roles** (SUPERADMIN, ADMIN, USER)
- ✅ **Autenticación dual** (Google OAuth + Credenciales)
- ✅ **ABM completo** para todas las entidades
- ✅ **Sistema de impresión** de remitos
- ✅ **Logs de actividad** de usuarios
- ✅ **Dashboard** con métricas y gráficos
- ✅ **Sistema de temas** personalizables
- ✅ **Responsive design** (en progreso)

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | Next.js | 15.5.3 (App Router) |
| **Lenguaje** | TypeScript | 5.x |
| **Autenticación** | NextAuth.js | 4.24.11 |
| **Base de Datos** | Supabase (PostgreSQL) | 2.58.0 |
| **Estado Global** | React Query (TanStack Query) | 5.90.5 |
| **Estilos** | CSS Modules + Tailwind CSS | 3.4.0 |
| **Formularios** | React Hook Form | 7.62.0 |
| **Validación** | Zod | 4.1.9 |
| **Email** | Nodemailer | 6.10.1 |
| **Deployment** | Vercel | - |
| **UI Components** | Radix UI + Lucide Icons | - |

### Estructura del Proyecto

```
remitero-nextjs/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes (Backend)
│   │   │   ├── auth/                 # NextAuth endpoints
│   │   │   │   ├── [...nextauth]/    # Configuración NextAuth
│   │   │   │   ├── check/            # Verificación de sesión
│   │   │   │   ├── logout/           # Cierre de sesión
│   │   │   │   └── verify-session/   # Verificación de sesión
│   │   │   ├── users/                # API de usuarios
│   │   │   │   ├── [id]/             # Operaciones por ID
│   │   │   │   │   ├── activity-logs/ # Logs de actividad
│   │   │   │   │   ├── resend-invitation/ # Reenvío de invitación
│   │   │   │   │   └── reset-password/   # Reset de contraseña
│   │   │   │   └── route.ts          # CRUD de usuarios
│   │   │   ├── remitos/              # API de remitos
│   │   │   │   ├── [id]/             # Operaciones por ID
│   │   │   │   │   ├── pdf/          # Generación de PDF
│   │   │   │   │   └── status/       # Cambio de estado
│   │   │   │   ├── number/[number]/  # Búsqueda por número
│   │   │   │   └── route.ts          # CRUD de remitos
│   │   │   ├── products/             # API de productos
│   │   │   ├── clients/              # API de clientes
│   │   │   ├── categories/           # API de categorías
│   │   │   ├── estados-remitos/      # API de estados
│   │   │   ├── companies/            # API de empresas
│   │   │   ├── dashboard/            # API del dashboard
│   │   │   ├── email/                # API de email
│   │   │   ├── cache/                # API de caché
│   │   │   └── feedback/             # API de feedback
│   │   ├── auth/                     # Páginas de autenticación
│   │   │   ├── login/                # Página de login
│   │   │   └── error/                # Página de error de auth
│   │   ├── dashboard/                # Dashboard principal
│   │   ├── usuarios/                 # Gestión de usuarios
│   │   ├── remitos/                  # Gestión de remitos
│   │   │   ├── [id]/print/           # Vista de impresión
│   │   │   └── nuevo/                # Crear nuevo remito
│   │   ├── productos/                # Gestión de productos
│   │   ├── clientes/                 # Gestión de clientes
│   │   ├── categorias/               # Gestión de categorías
│   │   ├── estados-remitos/          # Gestión de estados
│   │   ├── empresas/                 # Gestión de empresas (SUPERADMIN)
│   │   ├── perfil/                   # Perfil de usuario
│   │   ├── configuracion/            # Configuración
│   │   ├── themes/                   # Temas
│   │   └── manual/                   # Manual de usuario
│   ├── components/                   # Componentes React
│   │   ├── common/                   # Componentes reutilizables
│   │   │   ├── DataTable.tsx         # Tabla de datos genérica
│   │   │   ├── FormModal.tsx         # Modal de formulario
│   │   │   ├── DeleteConfirmModal.tsx # Modal de confirmación
│   │   │   ├── Toast.jsx             # Sistema de notificaciones
│   │   │   ├── LoadingSpinner.tsx    # Indicadores de carga
│   │   │   ├── SearchInput.tsx       # Input de búsqueda
│   │   │   ├── Pagination.tsx        # Paginación
│   │   │   ├── UserActivityLogModal.tsx # Logs de actividad
│   │   │   └── ...                   # Más componentes
│   │   ├── forms/                    # Formularios
│   │   │   ├── UsuarioForm.tsx       # Formulario de usuario
│   │   │   ├── RemitoFormComplete.tsx # Formulario de remito
│   │   │   ├── ProductoForm.tsx      # Formulario de producto
│   │   │   ├── ClienteForm.tsx       # Formulario de cliente
│   │   │   └── ...                   # Más formularios
│   │   ├── layout/                   # Componentes de layout
│   │   │   ├── AuthenticatedLayout.tsx # Layout autenticado
│   │   │   ├── TopBar.tsx            # Barra superior
│   │   │   ├── Header.tsx            # Encabezado
│   │   │   └── MobileLayout.tsx      # Layout móvil
│   │   └── ui/                       # Componentes UI base
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── ...
│   ├── hooks/                        # Custom hooks
│   │   ├── queries/                  # React Query hooks
│   │   │   ├── useRemitos.ts
│   │   │   ├── useProducts.ts
│   │   │   └── ...
│   │   ├── useUsuarios.ts
│   │   ├── useEmpresas.ts
│   │   └── useTheme.ts
│   ├── lib/                          # Utilidades y configuraciones
│   │   ├── auth.ts                   # Configuración NextAuth
│   │   ├── supabase.ts               # Cliente Supabase
│   │   ├── email.ts                  # Utilidades de email
│   │   ├── validations.ts            # Schemas Zod
│   │   ├── cache-manager.ts          # Gestión de caché
│   │   └── user-activity-logger.ts   # Logger de actividad
│   ├── types/                        # TypeScript types
│   ├── contexts/                     # React contexts
│   │   └── ColorThemeContext.tsx     # Context de temas
│   ├── providers/                    # Providers
│   │   └── QueryProvider.tsx         # Provider de React Query
│   └── middleware.ts                 # Middleware de Next.js
├── public/                           # Archivos estáticos
├── migrations/                       # Migraciones SQL
├── docs/                             # Documentación
│   ├── AGENTS.md                     # Guía para agentes IA
│   ├── TAREAS_PENDIENTES.md          # Tareas pendientes
│   ├── CHANGELOG.md                  # Historial de cambios
│   └── manual/                       # Manual de usuario
└── package.json
```

---

## 🔑 Conceptos Clave del Sistema

### 1. Sistema de Roles y Permisos

El sistema implementa un modelo de roles jerárquico:

#### Roles Disponibles

- **SUPERADMIN**
  - Acceso total al sistema
  - Puede ver y gestionar todas las empresas
  - Puede impersonar usuarios
  - Acceso a todas las funcionalidades
  - Gestión de empresas

- **ADMIN**
  - Acceso completo a su empresa asignada
  - Puede gestionar usuarios de su empresa
  - Puede gestionar todas las entidades (remitos, productos, clientes, etc.)
  - No puede ver otras empresas

- **USER**
  - Acceso limitado
  - Puede crear y editar remitos
  - Puede ver productos y clientes
  - No puede gestionar usuarios
  - No puede acceder a configuración avanzada

#### Implementación de Permisos

Los permisos se verifican en múltiples capas:
1. **Middleware** (`src/middleware.ts`): Verifica autenticación y redirige según rol
2. **API Routes**: Cada endpoint verifica permisos antes de ejecutar
3. **Componentes**: Ocultan/muestran funcionalidades según rol

### 2. Sistema Multi-Empresa

- Cada usuario (excepto SUPERADMIN) está vinculado a una empresa
- Los datos se filtran automáticamente por `company_id`
- SUPERADMIN puede seleccionar empresa o ver "Todas las empresas"
- Aislamiento completo de datos entre empresas

**Tablas con aislamiento por empresa:**
- `remitos`
- `products`
- `clients`
- `categories`
- `users` (excepto SUPERADMIN)

### 3. Autenticación

El sistema soporta dos métodos de autenticación:

#### Google OAuth
- Para usuarios con email `@gmail.com`
- Redirección a Google para autenticación
- Token gestionado por NextAuth

#### Credenciales (Email/Password)
- Autenticación tradicional
- Contraseñas hasheadas con bcrypt
- Soporte para reset de contraseña

**Flujo de Autenticación:**
1. Usuario accede a `/auth/login`
2. Elige método: Gmail o Email
3. Si Gmail: redirección a Google OAuth
4. Si Email: formulario email/contraseña
5. NextAuth valida credenciales
6. Verifica que usuario esté activo (`is_active = true`)
7. Redirección según rol:
   - SUPERADMIN → `/empresas` o `/dashboard`
   - Otros → `/dashboard`
8. Se registra actividad `LOGIN` en logs

### 4. Entidades Principales

#### Usuarios (`users`)
- Gestión completa de usuarios del sistema
- Campos: email, nombre, rol, empresa, estado activo
- Sistema de invitación por email
- Logs de actividad por usuario

#### Remitos (`remitos`)
- Documentos de entrega principales
- Relaciones: cliente, estado, empresa, productos
- Número único auto-incremental
- Sistema de impresión en PDF
- Estados personalizables con colores

#### Productos (`products`)
- Productos que se entregan en remitos
- Relaciones: categoría, empresa
- Control de stock
- Precios y descripciones

#### Clientes (`clients`)
- Clientes que reciben remitos
- Información de contacto
- Historial de remitos

#### Categorías (`categories`)
- Categorización de productos
- Organización jerárquica

#### Estados de Remitos (`estados_remitos`)
- Estados personalizables para remitos
- Colores personalizables
- Orden configurable

#### Empresas (`companies`)
- Entidades empresariales
- Solo gestionables por SUPERADMIN
- Aislamiento de datos

---

## 🔄 Flujos Principales del Sistema

### Flujo: Crear Usuario

1. **Formulario** en `/usuarios` → `UsuarioForm`
2. **Validación** con Zod schema
3. **POST** a `/api/users`
4. **Procesamiento**:
   - Si email no tiene `@`, se agrega `@gmail.com`
   - Si es Gmail, no se requiere contraseña (solo OAuth)
   - Se genera contraseña temporal si es necesario
5. **Email de invitación** (si está configurado)
6. **Logging** de actividad `CREATE_USER`
7. **Invalidación** de caché de React Query
8. **Toast** de confirmación

### Flujo: Crear Remito

1. **Formulario** en `/remitos/nuevo` → `RemitoFormComplete`
2. **Selección** de cliente y estado
3. **Agregar productos** dinámicamente
4. **Cálculo automático** de totales
5. **POST** a `/api/remitos`
6. **Validación** de permisos y datos
7. **Creación** en base de datos
8. **Logging** de actividad `CREATE_REMITO`
9. **Modal de confirmación** para imprimir
10. Si confirma, abre `/remitos/[number]/print`

### Flujo: Autenticación

1. Usuario accede a `/auth/login`
2. Elige método: Gmail o Email
3. **Si Gmail**:
   - Redirección a Google OAuth
   - Usuario autoriza en Google
   - Callback a NextAuth
4. **Si Email**:
   - Formulario email/contraseña
   - Validación con bcrypt
5. NextAuth crea sesión JWT
6. Middleware verifica autenticación
7. Redirección según rol
8. Logging de actividad `LOGIN`

### Flujo: Cambio de Estado de Remito

1. Usuario selecciona nuevo estado en dropdown
2. **PATCH** a `/api/remitos/[id]/status`
3. Validación de permisos
4. Actualización en base de datos
5. Invalidación de caché
6. Actualización de UI
7. Logging de actividad `UPDATE_REMITO_STATUS`

---

## 🗄️ Base de Datos

### Esquema Principal

#### Tabla: `users`
```sql
- id (uuid, PK)
- email (text, unique)
- name (text)
- password_hash (text, nullable)
- role (enum: SUPERADMIN, ADMIN, USER)
- company_id (uuid, FK → companies.id, nullable)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `companies`
```sql
- id (uuid, PK)
- name (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `remitos`
```sql
- id (uuid, PK)
- number (integer, unique)
- client_id (uuid, FK → clients.id)
- company_id (uuid, FK → companies.id)
- status_id (uuid, FK → estados_remitos.id)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `products`
```sql
- id (uuid, PK)
- name (text)
- description (text, nullable)
- price (decimal)
- stock (integer)
- category_id (uuid, FK → categories.id)
- company_id (uuid, FK → companies.id)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `clients`
```sql
- id (uuid, PK)
- name (text)
- email (text, nullable)
- phone (text, nullable)
- address (text, nullable)
- company_id (uuid, FK → companies.id)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `categories`
```sql
- id (uuid, PK)
- name (text)
- company_id (uuid, FK → companies.id)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `estados_remitos`
```sql
- id (uuid, PK)
- name (text)
- color (text)
- order (integer)
- company_id (uuid, FK → companies.id)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `user_activity_logs`
```sql
- id (uuid, PK)
- user_id (uuid, FK → users.id)
- action (text)
- entity_type (text)
- entity_id (uuid, nullable)
- details (jsonb, nullable)
- ip_address (text, nullable)
- user_agent (text, nullable)
- created_at (timestamp)
```

### Relaciones Clave

- `users.company_id` → `companies.id`
- `remitos.company_id` → `companies.id`
- `remitos.client_id` → `clients.id`
- `remitos.status_id` → `estados_remitos.id`
- `products.category_id` → `categories.id`
- `products.company_id` → `companies.id`
- `clients.company_id` → `companies.id`
- `categories.company_id` → `companies.id`
- `estados_remitos.company_id` → `companies.id`
- `user_activity_logs.user_id` → `users.id`

### Migraciones

- Ubicación: `migrations/`
- Formato: SQL puro
- Ejecución: Manual en Supabase SQL Editor
- Convención: `add_[feature]_to_[table].sql` o `create_[table].sql`

---

## 🎨 Sistema de Temas

### Implementación

- **Context**: `src/contexts/ColorThemeContext.tsx`
- **Hook**: `src/hooks/useTheme.ts`
- **Temas disponibles**: `modern`, `classic`, `dark`
- **Persistencia**: `localStorage`

### Uso

```typescript
import { useColorTheme } from "@/contexts/ColorThemeContext";

function Component() {
  const { colors, currentTheme, setTheme } = useColorTheme();
  // colors.primary, colors.secondary, etc.
}
```

---

## 🔐 Variables de Entorno

### Requeridas

```env
# NextAuth
NEXTAUTH_URL=https://remitero-dev.vercel.app
NEXTAUTH_SECRET=<secret-key>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google OAuth
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>

# Email (Gmail)
EMAIL_USER=<email@gmail.com>
EMAIL_PASSWORD=<app-password-16-chars>
```

### Importante

- `NEXTAUTH_URL` no debe tener espacios ni newlines
- `EMAIL_PASSWORD` debe ser una contraseña de aplicación de Gmail (16 caracteres), no la contraseña normal
- Todas las variables deben estar en Vercel para cada ambiente (Development, Preview, Production)

---

## 🚀 Deployment

### Plataforma: Vercel

- **Development**: `remitero-dev.vercel.app` (branch `develop`)
- **Production**: `remitero.vercel.app` (branch `main`)
- **Preview**: Automático para cada PR

### Proceso de Deploy

1. Push a `develop` → Deploy automático a Development
2. Merge a `main` → Deploy automático a Production
3. Variables de entorno configuradas en Vercel
4. Migraciones ejecutadas manualmente en Supabase

---

## 📊 Estado Actual del Sistema

### ✅ Implementado y Funcionando

- ✅ Sistema de autenticación completo (Google OAuth + Credenciales)
- ✅ Base de datos Supabase configurada
- ✅ Sistema de empresas con selección dinámica
- ✅ Gestión de usuarios con roles
- ✅ Sistema de estados de remitos con colores personalizables
- ✅ CRUD completo para todas las entidades
- ✅ Sistema de impresión de remitos
- ✅ Notificaciones toast para feedback
- ✅ Sistema de logging de actividad
- ✅ Dashboard con métricas
- ✅ Sistema de temas personalizables
- ✅ Atajos de teclado básicos
- ✅ Error boundaries para manejo de errores
- ✅ Sistema de caché con React Query
- ✅ Optimizaciones de performance (97% mejora en API calls)

### ⚠️ Parcialmente Implementado

- ⚠️ **Optimización móvil**: Funcional pero puede mejorarse
- ⚠️ **Sistema de caché**: Implementado pero puede optimizarse más
- ⚠️ **Sistema de logs**: Funcional pero faltan filtros avanzados
- ⚠️ **Validación de formularios**: Funciona pero puede mejorarse
- ⚠️ **Sistema de permisos**: Básico, puede ser más granular

### 🐛 Problemas Conocidos

1. **Error de Email de Invitación**
   - **Estado**: ⚠️ Problemas de autenticación
   - **Error**: `EAUTH` en logs
   - **Causa probable**: Contraseña de aplicación de Gmail incorrecta o revocada
   - **Solución temporal**: Verificar `EMAIL_PASSWORD` en Vercel

2. **Prefetch 404**
   - **Error**: `empresas/nuevo?_rsc=skepm:1 Failed to load resource: 404`
   - **Impacto**: Bajo, solo aparece en consola
   - **Solución**: Ignorar o desactivar prefetch para esa ruta

3. **Performance en Carga Inicial**
   - **Estado**: ⚠️ Mejorado pero puede optimizarse más
   - **Mejoras aplicadas**: Preloader, route prefetching, cache system
   - **Pendiente**: Optimizar bundle size, code splitting más agresivo

---

## 📋 Tareas Pendientes

### 🔴 Prioridad Alta

#### 1. Sistema de Navegación y Accesibilidad
- **Estado**: 📋 Propuesta completa lista
- **Documento**: `docs/NAVEGACION_Y_ACCESIBILIDAD.md`
- **Descripción**: Implementar navegación "Volver" con breadcrumb y sistema completo de navegación por teclado
- **Tiempo estimado**: 16-22 horas
- **Incluye**:
  - Navegación en tablas, formularios, modales
  - Preparado para móviles
  - 6 fases de implementación definidas

#### 2. Optimización para Móviles (100% Funcional)
- **Estado**: 📋 Pendiente
- **Descripción**: Hacer la aplicación completamente funcional en dispositivos móviles
- **Tareas**:
  - Mejorar responsive design en todas las páginas
  - Optimizar tablas para móvil (scroll horizontal, cards en lugar de tabla)
  - Mejorar formularios para touch (inputs más grandes, mejor spacing)
  - Optimizar modales para pantallas pequeñas
  - Testing en dispositivos reales (iOS, Android)
- **Dependencias**: Sistema de navegación y accesibilidad (Fase 6)

#### 3. Corrección de Error de Email de Invitación
- **Estado**: 🔧 En progreso
- **Descripción**: El sistema de envío de emails de invitación tiene problemas de autenticación
- **Acciones necesarias**:
  - Verificar que `EMAIL_PASSWORD` sea una contraseña de aplicación válida (16 caracteres)
  - Verificar que no haya espacios o caracteres extra en las variables
  - Revisar logs detallados después de mejorar el diagnóstico
  - Considerar usar servicio de email alternativo (SendGrid, AWS SES) si persiste

### 🟡 Prioridad Media

#### 4. Mejora del Sistema de Caché
- **Estado**: ⚠️ Parcialmente implementado
- **Mejoras propuestas**:
  - Invalidación más inteligente (solo invalidar lo necesario)
  - Cache warming más agresivo en rutas críticas
  - Implementar cache por usuario/rol
  - Métricas de hit/miss rate

#### 5. Optimización de Performance
- **Estado**: 📋 Pendiente
- **Tareas**:
  - Lazy loading de componentes pesados
  - Code splitting más agresivo
  - Optimizar imágenes (si se agregan)
  - Reducir bundle size
  - Implementar service worker para cache offline (futuro)

#### 6. Sistema de Búsqueda Global
- **Estado**: 📋 Pendiente
- **Features**:
  - Búsqueda en todas las entidades (remitos, productos, clientes, usuarios, etc.)
  - Resultados agrupados por tipo
  - Navegación rápida a resultados
  - Historial de búsquedas recientes
- **Tecnología sugerida**: Algolia, Meilisearch, o implementación custom con Fuse.js

### 🟢 Prioridad Baja / Mejoras Futuras

#### 7. Sistema de Notificaciones en Tiempo Real
- **Estado**: 📋 Pendiente
- **Features**:
  - Notificaciones cuando se crea/actualiza un remito
  - Notificaciones de cambios en productos/stock
  - Notificaciones de nuevos usuarios
  - Preferencias de usuario para notificaciones
- **Tecnología sugerida**: WebSockets (Socket.io) o Server-Sent Events (SSE)

#### 8. Exportación de Datos
- **Estado**: 📋 Pendiente
- **Features**:
  - Exportar remitos a PDF/Excel
  - Exportar listados completos (productos, clientes, etc.)
  - Exportar reportes personalizados
  - Programar exportaciones automáticas

#### 9. Sistema de Reportes Avanzados
- **Estado**: 📋 Pendiente
- **Features**:
  - Gráficos de ventas por período
  - Análisis de productos más vendidos
  - Reportes de clientes
  - Comparativas entre períodos
  - Exportar reportes
- **Tecnología sugerida**: Recharts, Chart.js, o D3.js

#### 10. Multi-idioma (i18n)
- **Estado**: 📋 Pendiente
- **Features**:
  - Español (actual)
  - Inglés
  - Portugués (futuro)
  - Selector de idioma en configuración
- **Tecnología sugerida**: next-intl o react-i18next

#### 11. Testing
- **Estado**: 📋 Pendiente
- **Tareas**:
  - Unit tests para hooks y utilidades
  - Integration tests para API routes
  - E2E tests para flujos críticos
  - Tests de accesibilidad
  - Tests de performance
- **Tecnología sugerida**: Jest, React Testing Library, Playwright

#### 12. CI/CD Mejorado
- **Estado**: ✅ Básico implementado
- **Mejoras propuestas**:
  - Tests automáticos antes de deploy
  - Linting y type checking
  - Build verification
  - Deploy automático a staging
  - Rollback automático en caso de error

#### 13. Monitoreo y Logging
- **Estado**: 📋 Pendiente
- **Features**:
  - Error tracking (Sentry, LogRocket)
  - Performance monitoring
  - Analytics de uso
  - Alertas automáticas

---

## 🛠️ Convenciones de Código

### Nombres de Archivos
- Componentes: `PascalCase.tsx`
- Hooks: `camelCase.ts` con prefijo `use`
- Utilidades: `camelCase.ts`
- API Routes: `route.ts` dentro de carpetas con nombre de recurso

### Estructura de Componentes
```typescript
"use client"; // Si es necesario

import React from "react";
// Imports de librerías
// Imports de componentes locales
// Imports de hooks
// Imports de tipos

interface ComponentProps {
  // Props tipadas
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // Estado
  // Funciones
  // Render
  return (
    // JSX
  );
}
```

### Manejo de Estado
- **Server State**: React Query (TanStack Query)
- **Client State**: `useState`, `useReducer`
- **Form State**: React Hook Form
- **Global State**: Context API (temas, colores)

### Validación
- **Formularios**: Zod schemas en `src/lib/validations.ts`
- **API**: Validación en los route handlers
- **Client-side**: React Hook Form con Zod resolver

### Manejo de Errores
- **API**: Try-catch con logging detallado
- **Client**: Try-catch con toasts para errores
- **Logging**: `console.error` con prefijos descriptivos (ej: `❌ [API]`)

---

## 📚 Documentación Adicional

### Documentos Importantes en el Repositorio

- **`docs/AGENTS.md`**: Guía completa para agentes IA
- **`docs/TAREAS_PENDIENTES.md`**: Lista completa de tareas y mejoras pendientes
- **`docs/NAVEGACION_Y_ACCESIBILIDAD.md`**: Propuesta de sistema de navegación
- **`docs/CHANGELOG.md`**: Historial de cambios
- **`docs/TEST_NAVEGACION.md`**: Suite completa de tests
- **`README.md`**: Documentación principal

### Recursos Externos

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- React Query: https://tanstack.com/query/latest
- NextAuth: https://next-auth.js.org/
- Zod: https://zod.dev/

---

## ⚠️ Advertencias Importantes

### No Hacer
- ❌ Modificar `main` branch directamente
- ❌ Hacer cambios sin probar en desarrollo primero
- ❌ Eliminar migraciones existentes
- ❌ Cambiar estructura de base de datos sin migración
- ❌ Hardcodear valores que deberían ser configurables
- ❌ Ignorar errores de TypeScript sin justificación

### Siempre Hacer
- ✅ Trabajar en branch `develop`
- ✅ Probar cambios localmente antes de commit
- ✅ Crear migraciones para cambios de BD
- ✅ Agregar logging para debugging
- ✅ Manejar errores apropiadamente
- ✅ Actualizar documentación cuando sea necesario
- ✅ Usar toasts para feedback al usuario (no modales de OK)
- ✅ Verificar permisos según rol en todas las operaciones

---

## 🔄 Flujo de Trabajo Recomendado

1. **Leer documentación relevante**:
   - `TAREAS_PENDIENTES.md` para ver qué está pendiente
   - `NAVEGACION_Y_ACCESIBILIDAD.md` si trabajas en navegación
   - Este documento para contexto general

2. **Crear branch** (si es necesario):
   ```bash
   git checkout -b feature/nombre-feature
   ```

3. **Desarrollar**:
   - Seguir convenciones de código
   - Agregar logging apropiado
   - Manejar errores correctamente

4. **Probar**:
   - Probar localmente
   - Seguir checklist en `TEST_NAVEGACION.md` si aplica
   - Verificar en diferentes roles

5. **Commit y Push**:
   ```bash
   git add .
   git commit -m "feat: descripción clara del cambio"
   git push origin develop
   ```

6. **Verificar deploy**:
   - Revisar logs en Vercel
   - Probar en ambiente de preview/staging

---

## 📊 Métricas y Performance

### Mejoras Aplicadas

- ✅ **97% mejora** en tiempo de respuesta de API (14s → <500ms)
- ✅ **85% mejora** en tiempo de logout (7s → <1s)
- ✅ Eliminación completa de carga en dos etapas
- ✅ Índices de base de datos para consultas optimizadas
- ✅ Caché inteligente con React Query

### Pendiente

- Optimizar bundle size
- Implementar streaming SSR
- Mejorar code splitting
- Métricas de hit/miss rate en caché

---

## 🎯 Prioridades Actuales

### Alta Prioridad
1. **Sistema de Navegación y Accesibilidad**: Ver `NAVEGACION_Y_ACCESIBILIDAD.md`
2. **Optimización Móvil**: Hacer app 100% funcional en móviles
3. **Fix Email de Invitación**: Resolver problemas de autenticación

### Media Prioridad
1. Mejora del sistema de caché
2. Optimización de performance
3. Sistema de búsqueda global

### Baja Prioridad
1. Features avanzadas (reportes, analytics)
2. Multi-idioma
3. Sistema de notificaciones en tiempo real

---

## 📝 Notas Finales

Este documento proporciona una visión completa del sistema Remitero. Para información más detallada sobre aspectos específicos, consultar los documentos individuales en la carpeta `docs/`.

**Última actualización**: Enero 2025  
**Versión del documento**: 1.0  
**Mantenido por**: Equipo de desarrollo

---

## 🔗 URLs Importantes

- **Repositorio GitHub**: https://github.com/puntoindigo/remitero
- **Branch Develop**: https://github.com/puntoindigo/remitero/tree/develop
- **Branch Main**: https://github.com/puntoindigo/remitero/tree/main
- **Documento AGENTS.md**: https://github.com/puntoindigo/remitero/blob/develop/docs/AGENTS.md
- **Documento TAREAS_PENDIENTES.md**: https://github.com/puntoindigo/remitero/blob/develop/docs/TAREAS_PENDIENTES.md
- **Documento NAVEGACION_Y_ACCESIBILIDAD.md**: https://github.com/puntoindigo/remitero/blob/develop/docs/NAVEGACION_Y_ACCESIBILIDAD.md
- **Este documento**: https://github.com/puntoindigo/remitero/blob/develop/docs/SISTEMA_COMPLETO.md

