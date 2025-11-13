# 📋 Inventario de Modales y Notificaciones

## 📊 Tabla de Modales por Categoría

| Categoría | Modal | Archivo | Propósito | Uso Actual | ¿Reemplazar por Toast? |
|-----------|-------|---------|-----------|------------|------------------------|
| **🔐 Autenticación** |
| | `ChangePasswordModal` | `src/components/common/ChangePasswordModal.tsx` | Cambio obligatorio/opcional de contraseña | Modal con formulario | ❌ No (requiere input) |
| | `ForgotPasswordModal` | `src/components/common/ForgotPasswordModal.tsx` | Solicitar recuperación de contraseña | Modal con formulario | ❌ No (requiere input) |
| **✅ Confirmación** |
| | `ConfirmationModal` | `src/components/common/ConfirmationModal.tsx` | Confirmar acciones (genérico) | Modal con botones Confirmar/Cancelar | ⚠️ Depende del caso |
| | `DeleteConfirmModal` | `src/components/common/DeleteConfirmModal.tsx` | Confirmar eliminación de elementos | Modal específico para borrar | ❌ No (acción destructiva) |
| **📝 Formularios** |
| | `FormModal` | `src/components/common/FormModal.tsx` | Contenedor genérico para formularios | Usado en todos los ABMs | ❌ No (requiere formulario) |
| | `RemitoFormComplete` | `src/components/forms/RemitoFormComplete.tsx` | Formulario completo de remitos | Modal complejo con múltiples pasos | ❌ No (formulario complejo) |
| **ℹ️ Información** |
| | `MessageModal` | `src/components/common/MessageModal.tsx` | Mostrar mensajes (success/error/warning/info) | Modal informativo con botón OK | ✅ **SÍ** (candidato principal) |
| | `UserActivityLogModal` | `src/components/common/UserActivityLogModal.tsx` | Ver historial de actividad del usuario | Modal con lista de actividades | ❌ No (requiere scroll y datos) |
| | `ConfiguracionModal` | `src/components/common/ConfiguracionModal.tsx` | Configuración de usuario | Modal con formulario de settings | ❌ No (requiere formulario) |
| **🖨️ Acciones Especiales** |
| | `PrintRemitoModal` | `src/components/common/PrintRemitoModal.tsx` | Vista previa e impresión de remitos | Modal con preview de PDF | ❌ No (requiere preview) |
| | `PasswordGeneratorModal` | `src/components/common/PasswordGeneratorModal.tsx` | Generar contraseña aleatoria | Modal con generador | ❌ No (requiere interacción) |
| **🔧 Sistema** |
| | `PinnedModalsPanel` | `src/components/common/PinnedModalsPanel.tsx` | Panel de modales anclados | Sistema de gestión de modales | ❌ No (sistema interno) |
| | `ErrorBoundary` | `src/components/common/ErrorBoundary.tsx` | Captura de errores de React | Modal de error crítico | ❌ No (error crítico) |

## 🚨 Uso de `alert()` - Candidatos para Toast

### Archivos con `alert()` encontrados:

| Archivo | Línea | Contexto | ¿Reemplazar? |
|---------|-------|----------|--------------|
| `src/components/forms/RemitoFormComplete.tsx` | 251 | Error al crear cliente sin empresa | ✅ **SÍ** |
| `src/components/forms/RemitoFormComplete.tsx` | 287 | Error al crear cliente | ✅ **SÍ** |
| `src/components/layout/AuthenticatedLayout.tsx` | 250 | Error al cambiar contraseña | ✅ **SÍ** |

## 🎯 Recomendaciones por Categoría

### ✅ **Candidatos para Toast (Notificaciones no bloqueantes)**

1. **`MessageModal`** - Mensajes informativos simples
   - ✅ Éxito: "Cliente creado correctamente"
   - ✅ Error: "Error al crear cliente"
   - ✅ Advertencia: "Este cliente ya existe"
   - ✅ Info: "Operación completada"

2. **`alert()` en formularios** - Errores de validación
   - ✅ Errores de creación/edición
   - ✅ Mensajes de éxito después de guardar

### ❌ **Mantener como Modal (Requieren interacción)**

1. **Confirmaciones destructivas** - `DeleteConfirmModal`
   - ❌ Eliminar requiere confirmación explícita
   - ❌ Acción irreversible

2. **Formularios** - Todos los `FormModal`
   - ❌ Requieren input del usuario
   - ❌ Validación en tiempo real

3. **Cambio de contraseña** - `ChangePasswordModal`
   - ❌ Obligatorio y requiere input
   - ❌ Validación de contraseñas

## 📦 Librerías de Toast Recomendadas

### Opción 1: **react-hot-toast** ⭐ (Recomendada)
```bash
npm install react-hot-toast
```

**Ventajas:**
- ✅ Muy ligera (~5KB)
- ✅ Fácil de usar
- ✅ Soporte para promesas
- ✅ Animaciones suaves
- ✅ Personalizable

**Ejemplo de uso:**
```typescript
import toast from 'react-hot-toast';

// Éxito
toast.success('Cliente creado correctamente');

// Error
toast.error('Error al crear cliente');

// Con promesa (loading automático)
toast.promise(
  createClient(data),
  {
    loading: 'Creando cliente...',
    success: 'Cliente creado correctamente',
    error: 'Error al crear cliente'
  }
);
```

### Opción 2: **sonner** (Alternativa moderna)
```bash
npm install sonner
```

**Ventajas:**
- ✅ Muy moderna y elegante
- ✅ Soporte para acciones (botones en el toast)
- ✅ Mejor para confirmaciones rápidas

**Ejemplo de uso:**
```typescript
import { toast } from 'sonner';

toast.success('Cliente creado correctamente');

// Con acción
toast.success('Cliente creado', {
  action: {
    label: 'Deshacer',
    onClick: () => undo()
  }
});
```

### Opción 3: **react-toastify** (Más completa)
```bash
npm install react-toastify
```

**Ventajas:**
- ✅ Muy completa y configurable
- ✅ Soporte para posiciones múltiples
- ✅ Temas incluidos

## 🎨 Implementación Sugerida

### 1. Instalar react-hot-toast
```bash
npm install react-hot-toast
```

### 2. Crear wrapper personalizado
```typescript
// src/lib/toast.ts
import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => toast.success(message, { duration: 3000 }),
  error: (message: string) => toast.error(message, { duration: 4000 }),
  warning: (message: string) => toast(message, { 
    icon: '⚠️',
    duration: 3000 
  }),
  info: (message: string) => toast(message, { 
    icon: 'ℹ️',
    duration: 3000 
  }),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => toast.promise(promise, messages)
};
```

### 3. Agregar ToasterProvider en layout
```typescript
// src/app/layout.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
```

### 4. Reemplazar alert() y MessageModal simples

**ANTES:**
```typescript
alert('Error al crear cliente');
// o
<MessageModal 
  isOpen={showMessage}
  onClose={() => setShowMessage(false)}
  type="error"
  title="Error"
  message="Error al crear cliente"
/>
```

**DESPUÉS:**
```typescript
import { showToast } from '@/lib/toast';

showToast.error('Error al crear cliente');
```

## 📝 Plan de Migración

### Fase 1: Instalación y Setup
- [ ] Instalar `react-hot-toast`
- [ ] Crear wrapper `src/lib/toast.ts`
- [ ] Agregar `Toaster` en `layout.tsx`

### Fase 2: Reemplazar `alert()`
- [ ] `RemitoFormComplete.tsx` - 2 alertas
- [ ] `AuthenticatedLayout.tsx` - 1 alerta

### Fase 3: Reemplazar `MessageModal` simples
- [ ] Identificar usos de `MessageModal` que solo muestran OK
- [ ] Reemplazar por toasts
- [ ] Mantener `MessageModal` para casos complejos

### Fase 4: Mejorar UX
- [ ] Agregar toasts de éxito después de crear/editar
- [ ] Agregar toasts de loading durante operaciones
- [ ] Usar `toast.promise()` para operaciones async

## 🎯 Casos de Uso Específicos

### ✅ Toast para:
- Mensajes de éxito: "Cliente creado correctamente"
- Mensajes de error: "Error al crear cliente"
- Advertencias: "Este cliente ya existe"
- Info: "Operación completada"
- Loading: "Guardando cambios..."

### ❌ Modal para:
- Confirmaciones destructivas: "¿Eliminar cliente?"
- Formularios: Crear/editar entidades
- Cambio de contraseña: Requiere input
- Vista previa: Imprimir remitos
- Configuración: Settings del usuario

## 📚 Referencias

- [react-hot-toast Docs](https://react-hot-toast.com/)
- [sonner Docs](https://sonner.emilkowal.ski/)
- [react-toastify Docs](https://fkhadra.github.io/react-toastify/)

