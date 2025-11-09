# Tareas Pendientes y Mejoras Futuras

Este documento contiene todas las tareas pendientes, mejoras identificadas y features que se han discutido pero aún no están implementadas.

**Última actualización**: Noviembre 2024

---

## 🔴 Prioridad Alta

### 1. Sistema de Navegación y Accesibilidad
**Estado**: 📋 Propuesta completa lista  
**Documento**: [NAVEGACION_Y_ACCESIBILIDAD.md](./NAVEGACION_Y_ACCESIBILIDAD.md)  
**Descripción**: Implementar navegación "Volver" con breadcrumb y sistema completo de navegación por teclado  
**Tiempo estimado**: 16-22 horas  
**Notas**: 
- Incluye navegación en tablas, formularios, modales
- Preparado para móviles
- 6 fases de implementación definidas

### 2. Optimización para Móviles (100% Funcional)
**Estado**: 📋 Pendiente  
**Descripción**: Hacer la aplicación completamente funcional en dispositivos móviles  
**Tareas**:
- Mejorar responsive design en todas las páginas
- Optimizar tablas para móvil (scroll horizontal, cards en lugar de tabla)
- Mejorar formularios para touch (inputs más grandes, mejor spacing)
- Optimizar modales para pantallas pequeñas
- Testing en dispositivos reales (iOS, Android)

**Dependencias**: Sistema de navegación y accesibilidad (Fase 6)

### 3. Corrección de Error de Email de Invitación
**Estado**: 🔧 En progreso  
**Descripción**: El sistema de envío de emails de invitación tiene problemas de autenticación  
**Contexto**:
- Variables de entorno configuradas correctamente
- Error `EAUTH` en logs de Vercel
- Posible problema con contraseña de aplicación de Gmail

**Acciones necesarias**:
- Verificar que `EMAIL_PASSWORD` sea una contraseña de aplicación válida (16 caracteres)
- Verificar que no haya espacios o caracteres extra en las variables
- Revisar logs detallados después de mejorar el diagnóstico
- Considerar usar servicio de email alternativo (SendGrid, AWS SES) si persiste

---

## 🟡 Prioridad Media

### 4. Mejora del Sistema de Caché
**Estado**: ⚠️ Parcialmente implementado  
**Descripción**: El sistema de caché actual puede mejorarse  
**Mejoras propuestas**:
- Invalidación más inteligente (solo invalidar lo necesario)
- Cache warming más agresivo en rutas críticas
- Implementar cache por usuario/rol
- Métricas de hit/miss rate

**Archivos relacionados**:
- `src/lib/cache-manager.ts`
- `src/middleware/cache.ts`
- `src/app/api/cache/invalidate/route.ts`

### 5. Optimización de Performance
**Estado**: 📋 Pendiente  
**Descripción**: Varias optimizaciones de performance identificadas  
**Tareas**:
- Lazy loading de componentes pesados
- Code splitting más agresivo
- Optimizar imágenes (si se agregan)
- Reducir bundle size
- Implementar service worker para cache offline (futuro)

### 6. Mejora del Sistema de Logs de Actividad
**Estado**: ✅ Implementado básicamente  
**Descripción**: El sistema de logs puede mejorarse  
**Mejoras propuestas**:
- Filtros avanzados (por fecha, tipo de acción, usuario)
- Exportar logs a CSV/Excel
- Dashboard de actividad
- Notificaciones de actividades importantes
- Retención automática de logs antiguos

**Archivos relacionados**:
- `src/lib/user-activity-logger.ts`
- `src/components/common/UserActivityLogModal.tsx`
- `src/app/api/users/[id]/activity-logs/route.ts`

### 7. Sistema de Búsqueda Global
**Estado**: 📋 Pendiente  
**Descripción**: Implementar búsqueda global con `Ctrl/Cmd + K`  
**Features**:
- Búsqueda en todas las entidades (remitos, productos, clientes, usuarios, etc.)
- Resultados agrupados por tipo
- Navegación rápida a resultados
- Historial de búsquedas recientes

**Tecnología sugerida**: Algolia, Meilisearch, o implementación custom con Fuse.js

---

## 🟢 Prioridad Baja / Mejoras Futuras

### 8. Sistema de Notificaciones en Tiempo Real
**Estado**: 📋 Pendiente  
**Descripción**: Notificaciones push para eventos importantes  
**Features**:
- Notificaciones cuando se crea/actualiza un remito
- Notificaciones de cambios en productos/stock
- Notificaciones de nuevos usuarios
- Preferencias de usuario para notificaciones

**Tecnología sugerida**: WebSockets (Socket.io) o Server-Sent Events (SSE)

### 9. Exportación de Datos
**Estado**: 📋 Pendiente  
**Descripción**: Permitir exportar datos a diferentes formatos  
**Features**:
- Exportar remitos a PDF/Excel
- Exportar listados completos (productos, clientes, etc.)
- Exportar reportes personalizados
- Programar exportaciones automáticas

### 10. Sistema de Reportes Avanzados
**Estado**: 📋 Pendiente  
**Descripción**: Dashboard de reportes y analytics  
**Features**:
- Gráficos de ventas por período
- Análisis de productos más vendidos
- Reportes de clientes
- Comparativas entre períodos
- Exportar reportes

**Tecnología sugerida**: Recharts, Chart.js, o D3.js

### 11. Multi-idioma (i18n)
**Estado**: 📋 Pendiente  
**Descripción**: Soporte para múltiples idiomas  
**Features**:
- Español (actual)
- Inglés
- Portugués (futuro)
- Selector de idioma en configuración

**Tecnología sugerida**: next-intl o react-i18next

### 12. Temas Personalizados
**Estado**: ✅ Parcialmente implementado  
**Descripción**: Sistema de temas ya existe, pero puede mejorarse  
**Mejoras propuestas**:
- Más temas predefinidos
- Editor de temas personalizados
- Modo oscuro mejorado
- Temas por empresa (futuro)

**Archivos relacionados**:
- `src/hooks/useTheme.ts`
- `src/contexts/ColorThemeContext.tsx`

### 13. Mejora del Sistema de Impresión
**Estado**: ✅ Implementado básicamente  
**Descripción**: Sistema de impresión de remitos funciona, pero puede mejorarse  
**Mejoras propuestas**:
- Plantillas de impresión personalizables
- Múltiples formatos de remito
- Vista previa antes de imprimir
- Historial de impresiones

**Archivos relacionados**:
- `src/app/remitos/[number]/print/page.tsx`

### 14. Validación de Formularios Mejorada
**Estado**: ✅ Implementado básicamente  
**Descripción**: Validación con Zod funciona, pero puede mejorarse  
**Mejoras propuestas**:
- Validación en tiempo real más clara
- Mensajes de error más descriptivos
- Validación asíncrona (ej: verificar email único)
- Sugerencias automáticas

### 15. Sistema de Permisos Granular
**Estado**: ✅ Implementado básicamente  
**Descripción**: Sistema de roles existe, pero puede ser más granular  
**Mejoras propuestas**:
- Permisos por acción (crear, editar, eliminar, ver)
- Permisos por entidad (remitos, productos, etc.)
- Roles personalizados
- Permisos por empresa (para SUPERADMIN)

**Archivos relacionados**:
- `src/lib/auth.ts`
- Todos los archivos de API routes

---

## 🐛 Bugs Conocidos / Issues Menores

### 16. Error 404 en Prefetch de Empresas
**Estado**: ⚠️ Menor  
**Descripción**: `empresas/nuevo?_rsc=skepm:1 Failed to load resource: 404`  
**Impacto**: Bajo - solo aparece en consola, no afecta funcionalidad  
**Notas**: Es un prefetch de Next.js, puede ignorarse o desactivarse

### 17. Performance en Carga Inicial
**Estado**: ⚠️ Mejorado pero puede optimizarse más  
**Descripción**: Aunque se mejoró, la carga inicial puede ser más rápida  
**Mejoras aplicadas**:
- ✅ Preloader implementado
- ✅ Route prefetching implementado
- ✅ Cache system implementado

**Mejoras pendientes**:
- Optimizar bundle size
- Implementar streaming SSR
- Mejorar code splitting

---

## 📚 Documentación Pendiente

### 18. Documentación de API
**Estado**: 📋 Pendiente  
**Descripción**: Documentar todas las rutas de API  
**Formato sugerido**: OpenAPI/Swagger o documentación en Markdown

### 19. Guía de Contribución
**Estado**: 📋 Pendiente  
**Descripción**: Guía para desarrolladores que quieran contribuir  
**Contenido**:
- Setup del entorno
- Estructura del proyecto
- Convenciones de código
- Proceso de PR

### 20. Documentación de Deployment
**Estado**: 📋 Pendiente  
**Descripción**: Documentar proceso de deployment  
**Contenido**:
- Variables de entorno necesarias
- Proceso de migración de base de datos
- Rollback procedures
- Monitoreo y alertas

---

## 🔧 Mejoras Técnicas

### 21. Testing
**Estado**: 📋 Pendiente  
**Descripción**: Implementar suite de tests completa  
**Tareas**:
- Unit tests para hooks y utilidades
- Integration tests para API routes
- E2E tests para flujos críticos
- Tests de accesibilidad
- Tests de performance

**Tecnología sugerida**: Jest, React Testing Library, Playwright

### 22. CI/CD Mejorado
**Estado**: ✅ Básico implementado  
**Descripción**: Mejorar pipeline de CI/CD  
**Mejoras propuestas**:
- Tests automáticos antes de deploy
- Linting y type checking
- Build verification
- Deploy automático a staging
- Rollback automático en caso de error

### 23. Monitoreo y Logging
**Estado**: 📋 Pendiente  
**Descripción**: Implementar sistema de monitoreo  
**Features**:
- Error tracking (Sentry, LogRocket)
- Performance monitoring
- Analytics de uso
- Alertas automáticas

### 24. Seguridad
**Estado**: ✅ Básico implementado  
**Descripción**: Mejoras de seguridad  
**Tareas**:
- Rate limiting en API routes
- Validación de inputs más estricta
- Sanitización de datos
- Auditoría de seguridad
- Penetration testing

---

## 📊 Métricas y Analytics

### 25. Dashboard de Métricas
**Estado**: 📋 Pendiente  
**Descripción**: Dashboard interno con métricas del sistema  
**Features**:
- Usuarios activos
- Remitos creados por día
- Productos más utilizados
- Performance del sistema
- Errores y excepciones

---

## 🎨 Mejoras de UI/UX

### 26. Animaciones y Transiciones
**Estado**: ✅ Parcialmente implementado  
**Descripción**: Mejorar animaciones en toda la app  
**Mejoras aplicadas**:
- ✅ Hover en cards del dashboard
- ✅ Transiciones en modales

**Pendientes**:
- Animaciones de carga más suaves
- Transiciones entre páginas
- Micro-interacciones en botones

### 27. Mejora de Feedback Visual
**Estado**: ✅ Mejorado recientemente  
**Descripción**: Sistema de toasts implementado  
**Mejoras pendientes**:
- Progress indicators más claros
- Estados de carga más informativos
- Confirmaciones más claras

---

## 🔄 Refactorizaciones Futuras

### 28. Migración a TypeScript Estricto
**Estado**: ⚠️ Parcial  
**Descripción**: Algunos archivos aún tienen `any` o tipos débiles  
**Tareas**:
- Eliminar todos los `any`
- Tipos estrictos en todos los componentes
- Mejorar tipos de API responses
- Tipos compartidos entre frontend y backend

### 29. Optimización de Queries
**Estado**: ✅ Mejorado con React Query  
**Descripción**: Optimizar queries a la base de datos  
**Mejoras pendientes**:
- Reducir N+1 queries
- Implementar paginación en todas las listas
- Lazy loading de datos no críticos
- Optimizar queries complejas

---

## 📝 Notas para Otra IA

### Contexto del Proyecto
- **Framework**: Next.js 15.5.3 con App Router
- **Autenticación**: NextAuth.js
- **Base de datos**: Supabase (PostgreSQL)
- **Estado**: React Query (TanStack Query)
- **Estilos**: CSS Modules + Tailwind (parcial)
- **TypeScript**: Sí, pero no estricto en todos lados

### Convenciones
- Componentes en `src/components/`
- Hooks en `src/hooks/`
- API routes en `src/app/api/`
- Utilidades en `src/lib/`
- Migraciones en `migrations/`

### Estado Actual
- ✅ Sistema básico funcionando
- ✅ Autenticación con Google OAuth y Credentials
- ✅ CRUD completo para todas las entidades
- ✅ Sistema de roles (SUPERADMIN, ADMIN, USER)
- ✅ Multi-empresa para SUPERADMIN
- ✅ Sistema de logs de actividad
- ✅ Envío de emails (con problemas actuales)

### Prioridades
1. **Alta**: Navegación y accesibilidad, optimización móvil, fix de emails
2. **Media**: Performance, caché, búsqueda global
3. **Baja**: Features avanzadas, reportes, multi-idioma

### Recursos Útiles
- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Supabase: https://supabase.com/docs
- Documentación de React Query: https://tanstack.com/query/latest
- Documentación de NextAuth: https://next-auth.js.org/

---

## 📅 Historial de Cambios

- **Noviembre 2024**: Documento creado con todas las tareas pendientes identificadas
- **Noviembre 2024**: Sistema de navegación y accesibilidad propuesto
- **Noviembre 2024**: Sistema de toasts implementado
- **Noviembre 2024**: Botón de reenviar invitación implementado

---

**Nota**: Este documento debe actualizarse regularmente conforme se completen tareas o se identifiquen nuevas mejoras.

