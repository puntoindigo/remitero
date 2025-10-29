# Changelog

Todas las notables cambios a este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-XX

### 🚀 Añadido
- **Sistema de autenticación completo** con NextAuth.js
- **Base de datos Supabase** para persistencia en la nube
- **Sistema de empresas** con selección dinámica
- **Gestión de usuarios** con roles (ADMIN, SUPERADMIN)
- **Sistema de estados de remitos** con colores personalizables
- **Atajos de teclado** para navegación rápida (Ctrl+N, Ctrl+S, etc.)
- **Notificaciones toast** para feedback inmediato
- **Sistema de impresión mejorado** con modal optimizado
- **Estados de carga** en todos los botones de acción
- **Persistencia de selección** de empresa en sessionStorage
- **Error boundaries** para manejo graceful de errores
- **Sistema de logging** para debugging y monitoreo
- **Scripts de optimización** de base de datos
- **Componentes reutilizables** mejorados (SearchInput, LoadingSpinner, etc.)

### 🔧 Cambiado
- **Optimización crítica de rendimiento**: API calls de 14s → <500ms (97% mejora)
- **Eliminación de carga en dos etapas** en páginas con desplegable de empresa
- **Carga optimizada** para superusuarios con empresa guardada
- **Redirección de puertos** corregida para desarrollo (3000 → 8000)
- **Manejo de errores robusto** con interceptores tempranos
- **Modales de éxito** sin títulos genéricos duplicados
- **Formularios mejorados** con mejor espaciado y validaciones
- **Sistema de logout** optimizado (7s → <1s)
- **React Query optimizado** con DevTools removido
- **13 rutas API optimizadas** eliminando JOINs innecesarios

### 🐛 Corregido
- **useEffect no definido** en EmpresasContent y CategoriasContent
- **Cambios de estado de remitos** no se guardaban desde dropdown
- **Link de notas invisible** por color de fondo
- **Error 500** al editar clientes (JSON parse error)
- **Error de parámetros** en rutas API de productos
- **Cambios de stock** no se reflejaban en UI
- **Redirección incorrecta** a puerto 3000 en logout
- **Errores [object Event]** en dashboard y logout
- **Import de fuente Segoe UI** fallando
- **Títulos duplicados** en modales de éxito
- **Checkbox pegado** en formulario de estados
- **Datos de clientes perdidos** en lista de remitos
- **Colores de estado** no aparecían en lista
- **Puntos circulares** innecesarios en dropdown
- **Salto de UI** al cambiar selección de estado
- **Página roja** en logout
- **Botones no deshabilitados** durante procesamiento

### 🗑️ Eliminado
- **DevTools de React Query** para mejor rendimiento
- **Import de fuente Segoe UI** innecesario
- **JOINs costosos** en consultas de base de datos
- **Carga redundante** de datos en páginas
- **Títulos genéricos** en modales de éxito

### 🔒 Seguridad
- **Autenticación robusta** con NextAuth.js
- **Middleware de protección** de rutas
- **Validación de sesiones** en todas las operaciones
- **Manejo seguro** de errores y excepciones

### 📊 Rendimiento
- **97% mejora** en tiempo de respuesta de API
- **85% mejora** en tiempo de logout
- **Eliminación completa** de carga en dos etapas
- **Índices de base de datos** para consultas optimizadas
- **Caché inteligente** con React Query

## [1.0.0] - 2024-09-XX

### 🚀 Añadido
- **Sistema base** de gestión de productos y remitos
- **ABM completo** para categorías, clientes, productos y remitos
- **Sistema de impresión** en formato A4 duplicado
- **Interfaz responsive** con Tailwind CSS
- **Validaciones** de formularios con Zod
- **Persistencia local** con LocalStorage
- **Componentes modulares** y reutilizables

### 💻 Tecnología
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **React Hook Form** para formularios
- **Zod** para validaciones

---

**Nota**: Este changelog documenta los cambios más significativos. Para una lista completa de commits, consulta el historial de Git.
