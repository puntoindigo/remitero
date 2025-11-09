# 🏗️ Arquitectura

Arquitectura general del sistema, estructura de carpetas y decisiones de diseño.

## 📋 Stack Tecnológico

- **Framework**: Next.js 15.5.3 (App Router)
- **Lenguaje**: TypeScript
- **Autenticación**: NextAuth.js
- **Base de Datos**: Supabase (PostgreSQL)
- **Estado**: React Query (TanStack Query v5)
- **Estilos**: CSS Modules + Tailwind CSS (parcial)
- **Deployment**: Vercel
- **Email**: Nodemailer (Gmail)

## 📁 Estructura del Proyecto

```
remitero-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── users/         # Usuarios API
│   │   │   ├── remitos/       # Remitos API
│   │   │   ├── products/      # Productos API
│   │   │   ├── clients/       # Clientes API
│   │   │   ├── categories/    # Categorías API
│   │   │   ├── estados-remitos/ # Estados API
│   │   │   ├── companies/     # Empresas API
│   │   │   └── dashboard/     # Dashboard API
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── dashboard/         # Dashboard
│   │   ├── usuarios/          # Gestión de usuarios
│   │   ├── remitos/           # Gestión de remitos
│   │   ├── productos/         # Gestión de productos
│   │   ├── clientes/          # Gestión de clientes
│   │   ├── categorias/        # Gestión de categorías
│   │   ├── estados-remitos/   # Gestión de estados
│   │   ├── empresas/          # Gestión de empresas (solo SUPERADMIN)
│   │   └── perfil/            # Perfil de usuario
│   ├── components/
│   │   ├── common/            # Componentes reutilizables
│   │   ├── forms/             # Formularios
│   │   └── layout/            # Componentes de layout
│   ├── hooks/                 # Custom hooks
│   │   ├── queries/           # React Query hooks
│   │   └── ...
│   ├── lib/                   # Utilidades y configuraciones
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── supabase.ts        # Supabase client
│   │   ├── email.ts           # Email utilities
│   │   └── validations.ts     # Zod schemas
│   └── types/                 # TypeScript types
├── public/                    # Archivos estáticos
├── migrations/                # SQL migrations
├── docs/                      # Documentación
└── package.json
```

## 🔑 Conceptos Clave

### Sistema de Roles
- **SUPERADMIN**: Acceso total, puede ver todas las empresas, impersonar usuarios
- **ADMIN**: Acceso completo a su empresa, puede gestionar usuarios
- **USER**: Acceso limitado, solo puede ver y editar sus propios datos

### Multi-Empresa
- Cada usuario pertenece a una empresa
- Los datos están aislados por empresa
- SUPERADMIN puede ver todas las empresas

### Autenticación
- Google OAuth (principal)
- Credenciales (email/password) como alternativa
- Sesiones gestionadas por NextAuth

### Base de Datos
- PostgreSQL en Supabase
- Migraciones SQL en `/migrations`
- Cliente Supabase para queries

## 🔄 Flujos Principales

### Autenticación
1. Usuario inicia sesión (Google OAuth o credenciales)
2. NextAuth crea sesión
3. Middleware verifica autenticación
4. Usuario accede a la aplicación

### CRUD de Entidades
1. Usuario accede a página de gestión (ej: `/usuarios`)
2. React Query carga datos desde API
3. Usuario puede crear/editar/eliminar
4. Mutaciones actualizan cache y base de datos

## 📚 Referencias

- [AGENTS.md](../../AGENTS.md) - Guía completa para agentes IA
- [Navegación y Accesibilidad](./navegacion-accesibilidad.md)
- [Performance](./performance.md)

---

**Siguiente paso**: [Planificación](../08-planificacion/README.md)

