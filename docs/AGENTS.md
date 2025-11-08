# Guía para Agentes IA - Sistema Remitero

Este documento proporciona toda la información necesaria para que un agente IA pueda trabajar efectivamente en este proyecto.

**Última actualización**: Noviembre 2024

---

## 🎯 Información General del Proyecto

### Descripción
Sistema de gestión de remitos (recibos de entrega) con funcionalidades completas de CRUD para múltiples entidades, sistema de roles, multi-empresa, y autenticación con Google OAuth y credenciales.

### Stack Tecnológico
- **Framework**: Next.js 15.5.3 (App Router)
- **Lenguaje**: TypeScript (no estricto en todos lados)
- **Autenticación**: NextAuth.js
- **Base de Datos**: Supabase (PostgreSQL)
- **Estado**: React Query (TanStack Query v5)
- **Estilos**: CSS Modules + Tailwind CSS (parcial)
- **Deployment**: Vercel
- **Email**: Nodemailer (Gmail)

### Repositorio
- **URL**: `github.com/puntoindigo/remitero`
- **Branch principal**: `develop`
- **Branch de producción**: `main` (probablemente)

---

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
│   │   ├── dashboard/      # Dashboard
│   │   ├── usuarios/          # Gestión de usuarios
│   │   ├── remitos/           # Gestión de remitos
│   │   ├── productos/         # Gestión de productos
│   │   ├── clientes/          # Gestión de clientes
│   │   ├── categorias/        # Gestión de categorías
│   │   ├── estados-remitos/   # Gestión de estados
│   │   ├── empresas/          # Gestión de empresas (solo SUPERADMIN)
│   │   ├── perfil/            # Perfil de usuario
│   │   └── configuracion/     # Configuración (ahora es modal)
│   ├── components/
│   │   ├── common/            # Componentes reutilizables
│   │   │   ├── DataTable.tsx
│   │   │   ├── FormModal.tsx
│   │   │   ├── DeleteConfirmModal.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── ToastContainer.tsx
│   │   │   └── ...
│   │   ├── forms/             # Formularios
│   │   │   ├── UsuarioForm.tsx
│   │   │   ├── RemitoFormComplete.tsx
│   │   │   ├── ProductoForm.tsx
│   │   │   └── ...
│   │   └── layout/            # Componentes de layout
│   │       ├── TopBar.tsx
│   │       ├── AuthenticatedLayout.tsx
│   │       └── OSDBottomNavigation.tsx
│   ├── hooks/                 # Custom hooks
│   │   ├── queries/           # React Query hooks
│   │   ├── useUsuarios.ts
│   │   ├── useEmpresas.ts
│   │   └── ...
│   ├── lib/                   # Utilidades y configuraciones
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── supabase.ts        # Supabase client
│   │   ├── email.ts           # Email utilities
│   │   ├── validations.ts     # Zod schemas
│   │   └── ...
│   ├── types/                 # TypeScript types
│   └── contexts/              # React contexts
├── public/                    # Archivos estáticos
├── migrations/                # SQL migrations
├── docs/                      # Documentación
└── package.json
```

---

## 🔑 Conceptos Clave

### Sistema de Roles
- **SUPERADMIN**: Acceso total, puede ver todas las empresas, impersonar usuarios
- **ADMIN**: Acceso completo a su empresa, puede gestionar usuarios
- **USER**: Acceso limitado, solo puede gestionar remitos, productos y clientes

### Multi-Empresa
- Cada usuario (excepto SUPERADMIN) está vinculado a una empresa
- SUPERADMIN puede seleccionar empresa o ver "Todas las empresas"
- Los datos se filtran automáticamente por empresa

### Autenticación
- **Google OAuth**: Para usuarios con email @gmail.com
- **Credentials**: Email/contraseña tradicional
- Los usuarios sin contraseña (solo OAuth) no pueden usar credentials

### Entidades Principales
1. **Usuarios**: Gestión de usuarios del sistema
2. **Remitos**: Documentos de entrega
3. **Productos**: Productos que se entregan
4. **Clientes**: Clientes que reciben remitos
5. **Categorías**: Categorías de productos
6. **Estados de Remitos**: Estados posibles de un remito
7. **Empresas**: Empresas (solo SUPERADMIN)

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

## 🔐 Variables de Entorno

### Requeridas
```env
# NextAuth
NEXTAUTH_URL=https://remitero-dev.vercel.app
NEXTAUTH_SECRET=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email (Gmail)
EMAIL_USER=...
EMAIL_PASSWORD=... # Contraseña de aplicación de Gmail (16 caracteres)
```

### Importante
- `NEXTAUTH_URL` no debe tener espacios ni newlines
- `EMAIL_PASSWORD` debe ser una contraseña de aplicación de Gmail, no la contraseña normal
- Todas las variables deben estar en Vercel para cada ambiente (Development, Preview, Production)

---

## 📊 Base de Datos

### Tablas Principales
- `users`: Usuarios del sistema
- `companies`: Empresas
- `remitos`: Remitos/documentos
- `products`: Productos
- `clients`: Clientes
- `categories`: Categorías
- `estados_remitos`: Estados de remitos
- `user_activity_logs`: Logs de actividad de usuarios

### Migraciones
- Ubicación: `migrations/`
- Formato: SQL puro
- Ejecución: Manual en Supabase SQL Editor
- Convención: `add_[feature]_to_[table].sql` o `create_[table].sql`

### Relaciones Clave
- `users.company_id` → `companies.id`
- `remitos.company_id` → `companies.id`
- `remitos.client_id` → `clients.id`
- `remitos.status_id` → `estados_remitos.id`
- `products.category_id` → `categories.id`
- `products.company_id` → `companies.id`

---

## 🎨 Sistema de Temas

### Implementación
- Context: `src/contexts/ColorThemeContext.tsx`
- Hook: `src/hooks/useTheme.ts`
- Temas disponibles: `modern`, `classic`, `dark` (probablemente)
- Persistencia: `localStorage`

### Uso
```typescript
import { useColorTheme } from "@/contexts/ColorThemeContext";

function Component() {
  const { colors, currentTheme, setTheme } = useColorTheme();
  // colors.primary, colors.secondary, etc.
}
```

---

## 🚀 Flujos Importantes

### Crear Usuario
1. Formulario en `/usuarios` → `UsuarioForm`
2. Validación con Zod
3. POST a `/api/users`
4. Si email no tiene `@`, se agrega `@gmail.com`
5. Si es Gmail, no se requiere contraseña
6. Se envía email de invitación (si está configurado)
7. Se loguea actividad `CREATE_USER`
8. Se invalida cache de React Query

### Crear Remito
1. Formulario en `/remitos` → `RemitoFormComplete`
2. Selección de cliente y estado (sin labels, solo placeholders)
3. Agregar productos dinámicamente
4. Cálculo automático de totales
5. POST a `/api/remitos`
6. Se loguea actividad `CREATE_REMITO`
7. Modal de confirmación para imprimir
8. Si confirma, abre `/remitos/[number]/print`

### Login
1. Usuario va a `/auth/login`
2. Elige método: Gmail o Email
3. Si Gmail: redirección a Google OAuth
4. Si Email: formulario email/contraseña
5. NextAuth valida credenciales
6. Verifica que usuario esté activo (`is_active = true`)
7. Redirección según rol:
   - SUPERADMIN → `/empresas` o `/dashboard`
   - Otros → `/dashboard`
8. Se loguea actividad `LOGIN`

---

## 🐛 Problemas Conocidos

### Email de Invitación
- **Estado**: ⚠️ Problemas de autenticación
- **Error**: `EAUTH` en logs
- **Causa probable**: Contraseña de aplicación de Gmail incorrecta o revocada
- **Solución temporal**: Verificar `EMAIL_PASSWORD` en Vercel, debe ser de 16 caracteres

### Prefetch 404
- **Error**: `empresas/nuevo?_rsc=skepm:1 Failed to load resource: 404`
- **Impacto**: Bajo, solo aparece en consola
- **Solución**: Ignorar o desactivar prefetch para esa ruta

### Performance
- **Estado**: ✅ Mejorado pero puede optimizarse más
- **Mejoras aplicadas**: Preloader, route prefetching, cache system
- **Pendiente**: Optimizar bundle size, code splitting más agresivo

---

## 📝 Patrones Importantes

### API Routes
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    // Verificar permisos según rol
    // Hacer query a Supabase
    // Retornar datos
  } catch (error: any) {
    console.error('❌ [API] Error:', error);
    return NextResponse.json(
      { error: error.message || "Error" },
      { status: 500 }
    );
  }
}
```

### React Query Hooks
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase";

export function useItemsQuery(companyId?: string) {
  return useQuery({
    queryKey: ['items', companyId],
    queryFn: async () => {
      // Fetch data
    },
    enabled: !!companyId,
  });
}
```

### Formularios con React Hook Form
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  // Schema definition
});

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    // Submit logic
  };
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

## 🧪 Testing

### Documentación de Tests
- Ver `docs/TEST_NAVEGACION.md` para suite completa de tests
- Tests manuales por ahora
- E2E tests pendientes de implementar

### Cómo Probar
1. Usar ambiente de desarrollo o staging
2. Crear datos de prueba
3. Seguir checklist en `TEST_NAVEGACION.md`
4. Documentar bugs encontrados

---

## 📚 Documentación Adicional

### Documentos Importantes
- `docs/NAVEGACION_Y_ACCESIBILIDAD.md`: Propuesta de sistema de navegación
- `docs/TAREAS_PENDIENTES.md`: Lista de tareas y mejoras pendientes
- `docs/TEST_NAVEGACION.md`: Suite completa de tests
- `README.md`: Documentación principal

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

## 💡 Tips para Agentes IA

### Cuando Trabajas en Este Proyecto
1. **Lee primero**: Siempre lee la documentación relevante antes de hacer cambios
2. **Contexto**: Este es un sistema de producción, sé cuidadoso con cambios
3. **Testing**: Si agregas features, agrega tests o actualiza `TEST_NAVEGACION.md`
4. **Documentación**: Actualiza documentación cuando hagas cambios significativos
5. **Consistencia**: Sigue los patrones existentes en el código
6. **Logging**: Agrega logging útil para debugging (con prefijos como `❌ [API]`)
7. **Errores**: Siempre maneja errores apropiadamente, nunca dejes try-catch vacíos
8. **TypeScript**: Intenta mejorar tipos cuando sea posible, evita `any` innecesarios

### Estructura de Commits
- `feat:` para nuevas features
- `fix:` para correcciones de bugs
- `docs:` para documentación
- `refactor:` para refactorizaciones
- `style:` para cambios de formato
- `test:` para tests

### Ejemplo de Commit
```
feat: agregar botón reenviar invitación y unificar mensajes de eliminación a toasts

- Agregado endpoint API /api/users/[id]/resend-invitation
- Agregado botón de reenviar invitación (icono Mail) al lado del icono Activity
- Implementado ConfirmationModal para confirmar reenvío
- Cambiado showSuccess/showError de MessageModal por toasts en eliminaciones
- Agregado ToastContainer en todos los archivos modificados
```

---

## 📞 Información de Contacto/Support

- **Repositorio**: github.com/puntoindigo/remitero
- **Deployment**: Vercel (remitero-dev.vercel.app)
- **Base de Datos**: Supabase

---

## 🔄 Historial de Cambios Importantes

### Noviembre 2024
- ✅ Sistema de toasts implementado
- ✅ Botón de reenviar invitación implementado
- ✅ Hover y animación en cards del dashboard
- ✅ Mejoras en manejo de errores
- ✅ Documentación de navegación y accesibilidad propuesta
- ✅ Documentación de tareas pendientes creada

---

**Última actualización**: Noviembre 2024  
**Versión del documento**: 1.0  
**Mantenido por**: Equipo de desarrollo

---

*Este documento debe actualizarse cuando se hagan cambios significativos en la arquitectura, stack tecnológico, o flujos importantes del sistema.*

