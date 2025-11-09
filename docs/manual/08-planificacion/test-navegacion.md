# Test de Navegación Completo

Este documento contiene una suite completa de tests para verificar el 100% de la navegación de la aplicación.

**Última actualización**: Noviembre 2024

---

## 📋 Índice

1. [Autenticación y Login](#1-autenticación-y-login)
2. [Dashboard](#2-dashboard)
3. [Gestión de Usuarios](#3-gestión-de-usuarios)
4. [Gestión de Remitos](#4-gestión-de-remitos)
5. [Gestión de Productos](#5-gestión-de-productos)
6. [Gestión de Clientes](#6-gestión-de-clientes)
7. [Gestión de Categorías](#7-gestión-de-categorías)
8. [Gestión de Estados de Remitos](#8-gestión-de-estados-de-remitos)
9. [Gestión de Empresas](#9-gestión-de-empresas)
10. [Perfil de Usuario](#10-perfil-de-usuario)
11. [Configuración](#11-configuración)
12. [Navegación entre Páginas](#12-navegación-entre-páginas)
13. [Permisos y Roles](#13-permisos-y-roles)
14. [Casos Edge y Errores](#14-casos-edge-y-errores)

---

## 1. Autenticación y Login

### 1.1 Login con Email/Contraseña
- [ ] Ir a `/auth/login`
- [ ] Verificar que se muestran dos opciones: "Acceder con Gmail" y "Acceder con Email"
- [ ] Hacer clic en "Acceder con Email"
- [ ] Verificar que aparece el formulario de email/contraseña
- [ ] Ingresar email válido y contraseña correcta
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Verificar redirección según rol:
  - SUPERADMIN → `/empresas` o `/dashboard`
  - ADMIN/USER → `/dashboard`
- [ ] Verificar que la sesión se mantiene al recargar la página

### 1.2 Login con Gmail
- [ ] Ir a `/auth/login`
- [ ] Hacer clic en "Acceder con Gmail"
- [ ] Verificar redirección a Google OAuth
- [ ] Completar autenticación en Google
- [ ] Verificar redirección de vuelta a la aplicación
- [ ] Verificar que la sesión se crea correctamente
- [ ] Verificar redirección según rol

### 1.3 Casos de Error en Login
- [ ] Intentar login con email incorrecto → Verificar mensaje de error
- [ ] Intentar login con contraseña incorrecta → Verificar mensaje de error
- [ ] Intentar login con usuario desactivado → Verificar mensaje específico
- [ ] Intentar login con Gmail de usuario desactivado → Verificar mensaje específico
- [ ] Verificar que los errores se muestran correctamente en la UI

### 1.4 Logout
- [ ] Estar logueado
- [ ] Hacer clic en el menú de usuario (TopBar)
- [ ] Hacer clic en "Cerrar Sesión"
- [ ] Verificar redirección a `/auth/login`
- [ ] Verificar que la sesión se destruye
- [ ] Intentar acceder a una ruta protegida → Verificar redirección a login

---

## 2. Dashboard

### 2.1 Acceso al Dashboard
- [ ] Loguearse como SUPERADMIN
- [ ] Navegar a `/dashboard`
- [ ] Verificar que se muestran todas las cards:
  - Remitos
  - Productos
  - Clientes
  - Categorías
  - Usuarios
  - Empresas (solo SUPERADMIN)
- [ ] Verificar que cada card muestra estadísticas correctas

### 2.2 Navegación desde Dashboard
- [ ] Hacer clic en "Ver remitos" → Verificar redirección a `/remitos`
- [ ] Volver al dashboard
- [ ] Hacer clic en "Nuevo remito" → Verificar que se abre modal o redirecciona
- [ ] Repetir para todas las cards (productos, clientes, categorías, usuarios, empresas)

### 2.3 Filtro de Empresa (SUPERADMIN)
- [ ] Loguearse como SUPERADMIN
- [ ] En el dashboard, verificar selector de empresa
- [ ] Seleccionar una empresa específica
- [ ] Verificar que las estadísticas se actualizan
- [ ] Seleccionar "Todas las empresas"
- [ ] Verificar que muestra estadísticas globales
- [ ] Verificar que no hay error 400

### 2.4 Hover en Cards
- [ ] Pasar el mouse sobre cualquier card
- [ ] Verificar que el fondo cambia a gris claro (#f9fafb)
- [ ] Verificar que la card se agranda ligeramente (scale 1.02)
- [ ] Verificar que el header cambia de color (#f1f3f5)
- [ ] Verificar que el cursor cambia a pointer
- [ ] Verificar animación bounce suave

---

## 3. Gestión de Usuarios

### 3.1 Acceso a Gestión de Usuarios
- [ ] Loguearse como ADMIN o SUPERADMIN
- [ ] Navegar a `/usuarios`
- [ ] Verificar que se muestra la lista de usuarios
- [ ] Verificar que USER no puede acceder (debe mostrar "Acceso Denegado")

### 3.2 Listado de Usuarios
- [ ] Verificar que se muestran las columnas:
  - Usuario
  - Email
  - Rol
  - Activo (StatusToggle)
  - Último estado
  - Impersonar (solo SUPERADMIN)
  - Acciones (Editar, Eliminar)
- [ ] Verificar que los datos se cargan correctamente
- [ ] Verificar paginación si hay muchos usuarios

### 3.3 Crear Usuario
- [ ] Hacer clic en "+ Nuevo Usuario"
- [ ] Verificar que se abre el modal de creación
- [ ] Completar el formulario:
  - Email (probar con y sin @gmail.com)
  - Rol
  - Nombre, teléfono, dirección (opcionales)
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que el usuario se crea
- [ ] Verificar que aparece en la lista
- [ ] Verificar que se envía email de invitación (revisar logs)

### 3.4 Editar Usuario
- [ ] Hacer clic en el botón de editar de un usuario
- [ ] Verificar que se abre el modal con datos precargados
- [ ] Modificar algún campo
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan
- [ ] Verificar que la lista se actualiza

### 3.5 Eliminar Usuario
- [ ] Hacer clic en el botón de eliminar de un usuario
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que el usuario desaparece de la lista
- [ ] Verificar que NO aparece modal de "OK" (solo toast)

### 3.6 Activar/Desactivar Usuario
- [ ] Hacer clic en el StatusToggle (Activo) de un usuario
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar acción
- [ ] Verificar que el estado cambia
- [ ] Verificar que el usuario no puede loguearse si está desactivado

### 3.7 Reenviar Invitación
- [ ] Hacer clic en el icono de Mail (sobre) al lado del icono Activity
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar reenvío
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que se envía el email (revisar logs)
- [ ] Probar con usuario con actividad y sin actividad

### 3.8 Ver Log de Actividad
- [ ] Hacer clic en el icono Activity al lado de "Último estado"
- [ ] Verificar que se abre modal con log de actividad
- [ ] Verificar que se muestran todas las actividades del usuario
- [ ] Verificar paginación si hay muchas actividades
- [ ] Cerrar el modal

### 3.9 Impersonación (SUPERADMIN)
- [ ] Loguearse como SUPERADMIN
- [ ] Hacer clic en "Impersonar" de un usuario
- [ ] Verificar que se cambia la sesión
- [ ] Verificar que se muestra indicador de impersonación
- [ ] Verificar que se puede dejar de impersonar

### 3.10 Filtros y Búsqueda
- [ ] Usar el campo de búsqueda
- [ ] Verificar que filtra usuarios por nombre/email
- [ ] Si es SUPERADMIN, verificar selector de empresa
- [ ] Verificar que los filtros funcionan correctamente

---

## 4. Gestión de Remitos

### 4.1 Acceso a Gestión de Remitos
- [ ] Navegar a `/remitos`
- [ ] Verificar que se muestra la lista de remitos
- [ ] Verificar que todos los roles pueden acceder

### 4.2 Listado de Remitos
- [ ] Verificar columnas:
  - Número
  - Fecha
  - Cliente
  - Estado
  - Total
  - Acciones (Imprimir, Editar, Eliminar)
- [ ] Verificar que los datos se cargan correctamente
- [ ] Verificar formato de total (separador de miles)

### 4.3 Crear Remito
- [ ] Hacer clic en "+ Nuevo Remito"
- [ ] Verificar que se abre el modal
- [ ] Completar el formulario:
  - Cliente (sin label, solo placeholder)
  - Estado (sin label, solo placeholder)
  - Agregar productos
  - Observaciones
- [ ] Verificar que "Precio Unit." dice "Precio"
- [ ] Verificar que NO hay columna "Acciones" en la tabla de productos
- [ ] Verificar que el botón de eliminar producto está en la columna "Total"
- [ ] Hacer clic en "Guardar" (no "Crear")
- [ ] Verificar que el remito se crea
- [ ] Verificar que aparece modal de confirmación para imprimir
- [ ] Confirmar impresión → Verificar que se abre nueva pestaña
- [ ] Cancelar impresión → Verificar que no se abre pestaña

### 4.4 Editar Remito
- [ ] Hacer clic en editar un remito
- [ ] Verificar que se abre el modal con datos precargados
- [ ] Modificar algún campo
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan

### 4.5 Eliminar Remito
- [ ] Hacer clic en eliminar un remito
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que el remito desaparece de la lista

### 4.6 Imprimir Remito
- [ ] Hacer clic en el botón de imprimir (icono de impresora)
- [ ] Verificar que se abre nueva pestaña con `/remitos/[number]/print`
- [ ] Verificar que se muestra el remito correctamente
- [ ] Verificar que se ejecuta `window.print()` automáticamente
- [ ] Verificar paginación (máximo 17 líneas por página)
- [ ] Verificar que el header se repite en cada página
- [ ] Verificar que "Página X de Y" aparece en cada página
- [ ] Verificar que el total solo aparece en la última página
- [ ] Verificar que la pestaña se cierra después de imprimir

### 4.7 Filtros
- [ ] Probar filtro por estado
- [ ] Probar filtro por cliente
- [ ] Verificar que los filtros funcionan correctamente
- [ ] Si es SUPERADMIN, verificar selector de empresa

---

## 5. Gestión de Productos

### 5.1 Acceso a Gestión de Productos
- [ ] Navegar a `/productos`
- [ ] Verificar que se muestra la lista de productos
- [ ] Verificar que todos los roles pueden acceder

### 5.2 Listado de Productos
- [ ] Verificar columnas:
  - Nombre
  - Categoría
  - Precio (con separador de miles)
  - Stock (StatusToggle)
  - Acciones (Editar, Eliminar)
- [ ] Verificar que los datos se cargan correctamente

### 5.3 Crear Producto
- [ ] Hacer clic en "+ Nuevo Producto"
- [ ] Verificar que se abre el modal
- [ ] Completar el formulario:
  - Nombre
  - Categoría (verificar que NO hay contenedor extra alrededor del select)
  - Precio (probar formato con punto y coma)
  - Stock (toggle al final, abajo a la izquierda)
- [ ] Verificar que el precio acepta formato: 15.000,50 (punto para miles, coma para decimales)
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que el producto se crea
- [ ] Verificar que aparece en la lista

### 5.4 Editar Producto
- [ ] Hacer clic en editar un producto
- [ ] Verificar que se abre el modal con datos precargados
- [ ] Modificar precio (probar formato)
- [ ] Modificar stock (click en el toggle)
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan

### 5.5 Eliminar Producto
- [ ] Hacer clic en eliminar un producto
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que el producto desaparece de la lista

### 5.6 Cambiar Stock desde Lista
- [ ] Hacer clic en el StatusToggle de stock en la lista
- [ ] Verificar que el stock cambia inmediatamente
- [ ] Verificar que se actualiza en la base de datos
- [ ] Verificar tooltip "Modificar stock"

### 5.7 Filtros y Búsqueda
- [ ] Usar el campo de búsqueda
- [ ] Verificar que filtra productos por nombre
- [ ] Si es SUPERADMIN, verificar selector de empresa

---

## 6. Gestión de Clientes

### 6.1 Acceso a Gestión de Clientes
- [ ] Navegar a `/clientes`
- [ ] Verificar que se muestra la lista de clientes
- [ ] Verificar que todos los roles pueden acceder

### 6.2 Listado de Clientes
- [ ] Verificar columnas:
  - Nombre
  - Email
  - Teléfono
  - Dirección
  - Acciones (Editar, Eliminar)
- [ ] Verificar que los datos se cargan correctamente

### 6.3 Crear Cliente
- [ ] Hacer clic en "+ Nuevo Cliente"
- [ ] Verificar que se abre el modal
- [ ] Verificar que NO hay labels, solo placeholders:
  - "Nombre"
  - "email"
  - "telefono"
  - "direccion"
- [ ] Completar el formulario
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que el cliente se crea
- [ ] Verificar que aparece en la lista

### 6.4 Editar Cliente
- [ ] Hacer clic en editar un cliente
- [ ] Verificar que se abre el modal con datos precargados
- [ ] Modificar algún campo
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan

### 6.5 Eliminar Cliente
- [ ] Hacer clic en eliminar un cliente
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que el cliente desaparece de la lista

### 6.6 Filtros y Búsqueda
- [ ] Usar el campo de búsqueda
- [ ] Verificar que filtra clientes por nombre/email
- [ ] Si es SUPERADMIN, verificar selector de empresa

---

## 7. Gestión de Categorías

### 7.1 Acceso a Gestión de Categorías
- [ ] Navegar a `/categorias`
- [ ] Verificar que se muestra la lista de categorías
- [ ] Verificar que USER no puede acceder (debe mostrar "Acceso Denegado")

### 7.2 Listado de Categorías
- [ ] Verificar columnas:
  - Nombre
  - Descripción
  - Acciones (Editar, Eliminar)
- [ ] Verificar que los datos se cargan correctamente

### 7.3 Crear Categoría
- [ ] Hacer clic en "+ Nueva Categoría"
- [ ] Verificar que se abre el modal
- [ ] Completar el formulario
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que la categoría se crea
- [ ] Verificar que aparece en la lista

### 7.4 Editar Categoría
- [ ] Hacer clic en editar una categoría
- [ ] Verificar que se abre el modal con datos precargados
- [ ] Modificar algún campo
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan

### 7.5 Eliminar Categoría
- [ ] Hacer clic en eliminar una categoría
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que la categoría desaparece de la lista

### 7.6 Filtros y Búsqueda
- [ ] Usar el campo de búsqueda
- [ ] Verificar que filtra categorías por nombre
- [ ] Si es SUPERADMIN, verificar selector de empresa

---

## 8. Gestión de Estados de Remitos

### 8.1 Acceso a Gestión de Estados
- [ ] Navegar a `/estados-remitos`
- [ ] Verificar que se muestra la lista de estados
- [ ] Verificar que USER no puede acceder (debe mostrar "Acceso Denegado")

### 8.2 Listado de Estados
- [ ] Verificar columnas:
  - Nombre
  - Descripción
  - Activo (toggle)
  - Acciones (Editar, Eliminar)
- [ ] Verificar que los datos se cargan correctamente

### 8.3 Crear Estado
- [ ] Hacer clic en "+ Nuevo Estado"
- [ ] Verificar que se abre el modal
- [ ] Completar el formulario:
  - Nombre
  - Descripción
  - Activo (toggle, no checkbox)
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que el estado se crea
- [ ] Verificar que aparece en la lista

### 8.4 Editar Estado
- [ ] Hacer clic en editar un estado
- [ ] Verificar que se abre el modal con datos precargados
- [ ] Modificar algún campo
- [ ] Cambiar estado activo/inactivo
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan

### 8.5 Eliminar Estado
- [ ] Hacer clic en eliminar un estado
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que el estado desaparece de la lista

### 8.6 Filtros y Búsqueda
- [ ] Usar el campo de búsqueda
- [ ] Verificar que filtra estados por nombre
- [ ] Si es SUPERADMIN, verificar selector de empresa

---

## 9. Gestión de Empresas

### 9.1 Acceso a Gestión de Empresas
- [ ] Loguearse como SUPERADMIN
- [ ] Navegar a `/empresas`
- [ ] Verificar que se muestra la lista de empresas
- [ ] Verificar que ADMIN y USER no pueden acceder

### 9.2 Listado de Empresas
- [ ] Verificar columnas:
  - Nombre
  - Acciones (Editar, Eliminar)
- [ ] Verificar que los datos se cargan correctamente

### 9.3 Crear Empresa
- [ ] Hacer clic en "+ Nueva Empresa"
- [ ] Verificar que se abre el modal
- [ ] Completar el formulario
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que la empresa se crea
- [ ] Verificar que aparece en la lista

### 9.4 Editar Empresa
- [ ] Hacer clic en editar una empresa
- [ ] Verificar que se abre el modal con datos precargados
- [ ] Modificar algún campo
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan

### 9.5 Eliminar Empresa
- [ ] Hacer clic en eliminar una empresa
- [ ] Verificar que aparece modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar que aparece toast de éxito
- [ ] Verificar que la empresa desaparece de la lista

---

## 10. Perfil de Usuario

### 10.1 Acceso al Perfil
- [ ] Hacer clic en el menú de usuario (TopBar)
- [ ] Hacer clic en "Perfil" o navegar a `/perfil`
- [ ] Verificar que se muestra el formulario de perfil

### 10.2 Editar Perfil
- [ ] Verificar que el formulario muestra datos del usuario actual
- [ ] Modificar algún campo (nombre, teléfono, dirección)
- [ ] Verificar que el campo de rol:
  - Solo es visible si es ADMIN/SUPERADMIN
  - ADMIN no puede cambiarse a SUPERADMIN
  - Usuario no puede cambiar su propio rol
- [ ] Hacer clic en "Guardar"
- [ ] Verificar que los cambios se guardan
- [ ] Verificar que la sesión se actualiza

### 10.3 Cambiar Contraseña
- [ ] Si el usuario tiene contraseña, verificar opción de cambiar contraseña
- [ ] Probar cambio de contraseña
- [ ] Verificar que funciona con la nueva contraseña

---

## 11. Configuración

### 11.1 Acceso a Configuración
- [ ] Hacer clic en el menú de usuario (TopBar)
- [ ] Hacer clic en "Configuración"
- [ ] Verificar que se abre modal (no página completa)
- [ ] Verificar que es compacto

### 11.2 Configuración de Tema
- [ ] Verificar selector de tema
- [ ] Cambiar de tema
- [ ] Verificar que el tema se aplica inmediatamente
- [ ] Verificar que se persiste al recargar

### 11.3 Configuración de Desarrollo (solo en desarrollo)
- [ ] Si `NODE_ENV === 'development'`, verificar que aparecen:
  - Toggle "Habilitar Botonera"
  - Toggle "Habilitar Modales Anclados"
- [ ] Activar/desactivar botonera
- [ ] Verificar que la botonera aparece/desaparece sin refrescar página
- [ ] Activar/desactivar modales anclados
- [ ] Verificar que el panel de modales anclados aparece/desaparece

---

## 12. Navegación entre Páginas

### 12.1 Navegación desde TopBar
- [ ] Verificar que el TopBar muestra opciones según rol
- [ ] Hacer clic en cada opción del menú
- [ ] Verificar que navega correctamente
- [ ] Verificar que el menú se cierra después de navegar

### 12.2 Navegación desde Dashboard
- [ ] Desde el dashboard, hacer clic en cada card
- [ ] Verificar que navega a la página correcta
- [ ] Verificar que los botones "Ver" y "Nuevo" funcionan

### 12.3 Navegación desde Botonera (si está habilitada)
- [ ] Verificar que la botonera aparece en la parte inferior
- [ ] Hacer clic en cada botón
- [ ] Verificar que navega correctamente
- [ ] Verificar que el botón activo se resalta

### 12.4 Breadcrumb Navigation (cuando se implemente)
- [ ] Navegar entre páginas
- [ ] Verificar que aparece breadcrumb
- [ ] Hacer clic en "Volver"
- [ ] Verificar que regresa a la página anterior
- [ ] Verificar que funciona en móvil (solo botón "Volver")

---

## 13. Permisos y Roles

### 13.1 Permisos de SUPERADMIN
- [ ] Loguearse como SUPERADMIN
- [ ] Verificar acceso a todas las páginas:
  - Dashboard ✅
  - Usuarios ✅
  - Remitos ✅
  - Productos ✅
  - Clientes ✅
  - Categorías ✅
  - Estados de Remitos ✅
  - Empresas ✅
- [ ] Verificar que puede ver todas las empresas
- [ ] Verificar que puede impersonar usuarios
- [ ] Verificar que puede crear/editar/eliminar todo

### 13.2 Permisos de ADMIN
- [ ] Loguearse como ADMIN
- [ ] Verificar acceso a páginas:
  - Dashboard ✅
  - Usuarios ✅
  - Remitos ✅
  - Productos ✅
  - Clientes ✅
  - Categorías ✅
  - Estados de Remitos ✅
  - Empresas ❌ (no debe acceder)
- [ ] Verificar que solo ve su empresa
- [ ] Verificar que NO puede cambiar su rol a SUPERADMIN
- [ ] Verificar que puede crear/editar/eliminar en su empresa

### 13.3 Permisos de USER
- [ ] Loguearse como USER
- [ ] Verificar acceso a páginas:
  - Dashboard ✅
  - Usuarios ❌ (debe mostrar "Acceso Denegado")
  - Remitos ✅
  - Productos ✅
  - Clientes ✅
  - Categorías ❌ (debe mostrar "Acceso Denegado")
  - Estados de Remitos ❌ (debe mostrar "Acceso Denegado")
  - Empresas ❌ (no debe acceder)
- [ ] Verificar que solo ve su empresa
- [ ] Verificar que NO puede cambiar su rol
- [ ] Verificar que puede crear/editar/eliminar en su empresa (solo entidades permitidas)

### 13.4 Usuario Desactivado
- [ ] Desactivar un usuario desde la gestión de usuarios
- [ ] Intentar loguearse con ese usuario (email/contraseña)
- [ ] Verificar que muestra mensaje: "Tu cuenta ha sido desactivada..."
- [ ] Intentar loguearse con Gmail de ese usuario
- [ ] Verificar que muestra mensaje de error apropiado
- [ ] Verificar que NO puede acceder a ninguna página

---

## 14. Casos Edge y Errores

### 14.1 Manejo de Errores de Red
- [ ] Desconectar internet
- [ ] Intentar realizar una acción (crear, editar, eliminar)
- [ ] Verificar que aparece mensaje de error apropiado
- [ ] Reconectar internet
- [ ] Verificar que la aplicación se recupera

### 14.2 Validación de Formularios
- [ ] Intentar crear usuario sin email → Verificar mensaje de error
- [ ] Intentar crear producto sin nombre → Verificar mensaje de error
- [ ] Intentar crear remito sin cliente → Verificar mensaje de error
- [ ] Verificar que los mensajes de error son claros y descriptivos

### 14.3 Datos Vacíos
- [ ] Acceder a una página sin datos (lista vacía)
- [ ] Verificar que muestra mensaje apropiado
- [ ] Verificar que el botón "Nuevo" está disponible

### 14.4 Paginación
- [ ] Si hay muchos elementos, verificar paginación
- [ ] Navegar entre páginas
- [ ] Verificar que los datos se cargan correctamente
- [ ] Verificar que los filtros se mantienen al cambiar de página

### 14.5 Búsqueda
- [ ] Buscar un término que no existe
- [ ] Verificar que muestra "No se encontraron resultados"
- [ ] Limpiar búsqueda
- [ ] Verificar que vuelve a mostrar todos los resultados

### 14.6 Modales
- [ ] Abrir un modal
- [ ] Hacer clic fuera del modal (overlay)
- [ ] Verificar que el modal se cierra
- [ ] Abrir un modal
- [ ] Presionar Esc
- [ ] Verificar que el modal se cierra
- [ ] Verificar que el scroll del body se bloquea cuando el modal está abierto

### 14.7 Toasts
- [ ] Realizar una acción exitosa
- [ ] Verificar que aparece toast en la parte superior
- [ ] Verificar que el toast desaparece automáticamente
- [ ] Realizar una acción con error
- [ ] Verificar que aparece toast de error
- [ ] Verificar que se puede cerrar manualmente

---

## 15. Testing de Performance

### 15.1 Carga Inicial
- [ ] Medir tiempo de carga inicial
- [ ] Verificar que aparece preloader
- [ ] Verificar que la transición es suave
- [ ] Verificar que no hay "blank screen" prolongado

### 15.2 Navegación entre Páginas
- [ ] Medir tiempo de navegación entre páginas
- [ ] Verificar que es rápido (< 500ms idealmente)
- [ ] Verificar que no hay "flash" de contenido

### 15.3 Carga de Datos
- [ ] Verificar que los datos se cargan rápidamente
- [ ] Verificar que se usa cache cuando es apropiado
- [ ] Verificar que los datos se actualizan cuando es necesario

---

## 16. Testing de Responsive

### 16.1 Desktop (> 1024px)
- [ ] Verificar que todo se ve correctamente
- [ ] Verificar que las tablas muestran todas las columnas
- [ ] Verificar que los modales tienen tamaño apropiado

### 16.2 Tablet (768px - 1024px)
- [ ] Verificar que el layout se adapta
- [ ] Verificar que las tablas son scrollables horizontalmente si es necesario
- [ ] Verificar que los modales se ajustan

### 16.3 Móvil (< 768px)
- [ ] Verificar que el layout es responsive
- [ ] Verificar que los menús funcionan correctamente
- [ ] Verificar que los formularios son usables
- [ ] Verificar que los modales ocupan el ancho apropiado
- [ ] Verificar que los botones son lo suficientemente grandes para touch

---

## Checklist Final

### Funcionalidad Core
- [ ] Todas las páginas son accesibles según permisos
- [ ] CRUD funciona en todas las entidades
- [ ] Validaciones funcionan correctamente
- [ ] Mensajes de error son claros
- [ ] Toasts aparecen correctamente

### UX/UI
- [ ] Hover en cards del dashboard funciona
- [ ] Animaciones son suaves
- [ ] Modales funcionan correctamente
- [ ] Formularios son intuitivos
- [ ] Navegación es clara

### Performance
- [ ] Carga inicial es rápida
- [ ] Navegación es fluida
- [ ] Datos se cargan eficientemente
- [ ] No hay memory leaks

### Accesibilidad (cuando se implemente)
- [ ] Navegación por teclado funciona
- [ ] Focus es visible
- [ ] ARIA labels están presentes
- [ ] Lectores de pantalla funcionan

---

## Notas para Testing

1. **Ambiente de Testing**: Usar ambiente de desarrollo o staging, nunca producción
2. **Datos de Prueba**: Crear datos de prueba específicos para testing
3. **Rollback**: Tener plan para revertir cambios después de testing
4. **Documentación**: Documentar cualquier bug encontrado
5. **Reproducibilidad**: Asegurar que los tests son reproducibles

---

**Última actualización**: Noviembre 2024  
**Versión del documento**: 1.0

