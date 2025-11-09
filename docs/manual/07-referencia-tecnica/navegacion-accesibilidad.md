# Sistema de Navegación y Accesibilidad por Teclado

## Propuesta Completa de Implementación

### 1. Sistema de Navegación "Volver" (Breadcrumb/Back Navigation)

#### 1.1 Componente `BreadcrumbNavigation.tsx`
**Ubicación**: `src/components/common/BreadcrumbNavigation.tsx`

**Funcionalidad**:
- Muestra ruta de navegación: "Tablero de Control > Categorías > Nueva Categoría"
- Botón "Volver" con icono de flecha izquierda
- Texto dinámico: "Volver a [Página Anterior]"
- Historial de navegación usando `sessionStorage` o `localStorage`

**Props**:
```typescript
interface BreadcrumbNavigationProps {
  currentPage: string;
  showBackButton?: boolean;
  backTo?: string; // URL específica o 'auto' para detectar automáticamente
  customBreadcrumbs?: Array<{ label: string; href: string }>;
}
```

**Implementación**:
- Hook `useNavigationHistory` para rastrear navegación
- Almacenar historial en `sessionStorage` (se limpia al cerrar sesión)
- Detectar página anterior automáticamente desde el historial
- Fallback a página por defecto si no hay historial

**Posicionamiento**:
- En el extremo derecho de la línea del título
- Solo visible cuando NO estás en `/dashboard`
- Responsive: en móvil se colapsa a solo el botón "Volver"

---

### 2. Sistema de Navegación por Teclado

#### 2.1 Hook centralizado `useKeyboardNavigation.ts`
**Ubicación**: `src/hooks/useKeyboardNavigation.ts`

**Funcionalidad**:
- Gestiona toda la navegación por teclado
- Evita conflictos entre diferentes componentes
- Sistema de "modos" (normal, tabla, formulario, modal)

**Características**:
```typescript
interface KeyboardNavigationConfig {
  mode: 'normal' | 'table' | 'form' | 'modal';
  shortcuts: Record<string, () => void>;
  enableArrowKeys?: boolean;
  enableTabNavigation?: boolean;
}
```

**Atajos globales**:
- `Esc`: Cerrar modales/formularios, cancelar acciones
- `Ctrl/Cmd + K`: Búsqueda global (futuro)
- `Ctrl/Cmd + N`: Nuevo elemento (ya existe, mejorar)
- `Ctrl/Cmd + S`: Guardar (en formularios)
- `Ctrl/Cmd + /`: Mostrar ayuda de atajos

---

#### 2.2 Navegación en Tablas (`DataTable`)

**Mejoras en `DataTable.tsx`**:

1. **Navegación con flechas**:
   - `↑` / `↓`: Navegar entre filas
   - `←` / `→`: Navegar entre celdas (opcional)
   - `Enter`: Activar acción principal de la fila (editar)
   - `Space`: Seleccionar checkbox (si aplica)
   - `Tab`: Navegar a botones de acción

2. **Focus management**:
   - Focus visible en la fila activa
   - Scroll automático cuando el focus sale de la vista
   - Indicador visual de la fila con focus

3. **Accesibilidad**:
   - `role="grid"` o `role="table"`
   - `aria-rowindex`, `aria-colindex`
   - `aria-label` en botones de acción
   - `tabindex` dinámico (solo fila activa tiene tabindex=0)

**Implementación**:
```typescript
// En DataTable.tsx
const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
const [focusedCellIndex, setFocusedCellIndex] = useState<number | null>(null);

// Manejar teclas de flecha
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setFocusedRowIndex(prev => 
      prev !== null ? Math.min(prev + 1, data.length - 1) : 0
    );
  }
  // ... más teclas
};
```

---

#### 2.3 Navegación en Formularios

**Mejoras en todos los formularios**:

1. **Tab navigation mejorado**:
   - `Tab`: Siguiente campo
   - `Shift + Tab`: Campo anterior
   - `Enter`: Siguiente campo (en campos de texto, salta al siguiente)
   - `Esc`: Cancelar/cerrar formulario

2. **Atajos específicos**:
   - `Ctrl/Cmd + Enter`: Guardar formulario
   - `Ctrl/Cmd + Esc`: Cancelar sin guardar

3. **Focus management**:
   - Auto-focus en primer campo al abrir formulario
   - Validación en tiempo real sin perder focus
   - Mensajes de error accesibles (aria-live)

**Implementación**:
- Wrapper `FormKeyboardNavigation` que envuelve todos los formularios
- Hook `useFormKeyboardShortcuts` para lógica reutilizable

---

#### 2.4 Navegación en Modales

**Mejoras en `FormModal.tsx` y otros modales**:

1. **Focus trap**:
   - Focus queda dentro del modal
   - `Tab` cicla solo entre elementos del modal
   - `Esc` cierra el modal y devuelve focus al elemento que lo abrió

2. **Atajos**:
   - `Esc`: Cerrar modal
   - `Enter`: Confirmar acción (si es modal de confirmación)
   - `Tab`: Navegar entre elementos del modal

**Implementación**:
- Hook `useFocusTrap` para encapsular la lógica
- Usar `focus-trap-react` o implementación custom

---

#### 2.5 Navegación en Botones y Acciones

**Mejoras en todos los botones**:

1. **Indicadores visuales**:
   - Focus ring visible (outline)
   - Estados hover/focus/active claros
   - Tooltips con atajos de teclado

2. **Atajos de teclado**:
   - Cada botón puede tener un atajo (ej: `Alt + E` para Editar)
   - Mostrar atajos en tooltips
   - Sistema de "modo de atajos" (presionar `Alt` muestra todos los atajos disponibles)

**Implementación**:
- Componente `KeyboardShortcut` que muestra el atajo
- Hook `useButtonKeyboardShortcut` para asignar atajos dinámicamente

---

### 3. Arquitectura Propuesta

#### 3.1 Estructura de Archivos

```
src/
├── components/
│   ├── common/
│   │   ├── BreadcrumbNavigation.tsx      # NUEVO
│   │   ├── KeyboardShortcut.tsx         # NUEVO
│   │   ├── KeyboardShortcutsHelp.tsx    # NUEVO (modal de ayuda)
│   │   └── DataTable.tsx                # MEJORAR
│   ├── forms/
│   │   └── FormKeyboardNavigation.tsx   # NUEVO (wrapper)
│   └── layout/
│       └── AuthenticatedLayout.tsx      # MEJORAR (agregar breadcrumb)
├── hooks/
│   ├── useKeyboardNavigation.ts          # NUEVO
│   ├── useNavigationHistory.ts          # NUEVO
│   ├── useFormKeyboardShortcuts.ts      # NUEVO
│   ├── useFocusTrap.ts                  # NUEVO
│   ├── useTableKeyboardNavigation.ts    # NUEVO
│   └── useButtonKeyboardShortcut.ts     # NUEVO
└── lib/
    └── keyboard-shortcuts.ts             # NUEVO (configuración centralizada)
```

---

#### 3.2 Flujo de Navegación

```
Usuario navega: Dashboard → Categorías → Nueva Categoría
                ↓
sessionStorage guarda: ['/dashboard', '/categorias', '/categorias/nuevo']
                ↓
BreadcrumbNavigation muestra: "Tablero > Categorías > Nueva Categoría"
                ↓
Usuario presiona "Volver" o Alt + ←
                ↓
Navega a: /categorias (página anterior en historial)
```

---

### 4. Preparación para Móviles

#### 4.1 Responsive Design

**BreadcrumbNavigation**:
- Desktop: Muestra breadcrumb completo + botón "Volver"
- Tablet: Muestra breadcrumb corto + botón "Volver"
- Móvil: Solo botón "Volver" con texto "← Volver a [Página]"

**Keyboard Navigation**:
- En móvil, los atajos de teclado se desactivan automáticamente
- Se mantiene la navegación táctil normal
- Los atajos solo funcionan cuando hay teclado físico conectado

**DataTable**:
- En móvil, las flechas no funcionan (no hay teclado)
- Se mantiene scroll táctil normal
- Los botones de acción siguen siendo clickeables

---

#### 4.2 Detección de Dispositivo

```typescript
// Hook para detectar si hay teclado disponible
const useHasKeyboard = () => {
  const [hasKeyboard, setHasKeyboard] = useState(false);
  
  useEffect(() => {
    // Detectar si es móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Detectar si hay teclado físico conectado
    const checkKeyboard = () => {
      // Lógica para detectar teclado
    };
    
    if (!isMobile) {
      setHasKeyboard(true);
    }
  }, []);
  
  return hasKeyboard;
};
```

---

### 5. Plan de Implementación (Fases)

#### Fase 1: Navegación "Volver" (Prioridad Alta)
1. Crear `useNavigationHistory` hook
2. Crear `BreadcrumbNavigation` component
3. Integrar en `AuthenticatedLayout` (excepto dashboard)
4. Testing básico

**Tiempo estimado**: 2-3 horas

---

#### Fase 2: Navegación por Teclado en Tablas (Prioridad Alta)
1. Crear `useTableKeyboardNavigation` hook
2. Mejorar `DataTable.tsx` con navegación por flechas
3. Agregar focus management y scroll automático
4. Testing en todas las tablas

**Tiempo estimado**: 4-5 horas

---

#### Fase 3: Navegación por Teclado en Formularios (Prioridad Media)
1. Crear `useFormKeyboardShortcuts` hook
2. Crear `FormKeyboardNavigation` wrapper
3. Integrar en todos los formularios
4. Testing en todos los formularios

**Tiempo estimado**: 3-4 horas

---

#### Fase 4: Navegación por Teclado en Modales (Prioridad Media)
1. Crear `useFocusTrap` hook
2. Integrar en todos los modales
3. Mejorar manejo de `Esc` y `Tab`
4. Testing en todos los modales

**Tiempo estimado**: 2-3 horas

---

#### Fase 5: Atajos Globales y Ayuda (Prioridad Baja)
1. Crear `useKeyboardNavigation` hook centralizado
2. Crear `KeyboardShortcutsHelp` modal
3. Agregar atajos globales (Ctrl+K, Ctrl+/, etc.)
4. Testing completo

**Tiempo estimado**: 3-4 horas

---

#### Fase 6: Optimización Móvil (Prioridad Baja)
1. Mejorar responsive de `BreadcrumbNavigation`
2. Agregar detección de teclado
3. Desactivar atajos en móvil
4. Testing en dispositivos móviles reales

**Tiempo estimado**: 2-3 horas

---

### 6. Consideraciones Técnicas

#### 6.1 Performance
- Usar `useCallback` para handlers de teclado
- Debounce en scroll automático
- Lazy load de componentes de ayuda

#### 6.2 Accesibilidad
- Cumplir WCAG 2.1 Level AA
- Soporte para lectores de pantalla
- Indicadores de focus visibles
- ARIA labels apropiados

#### 6.3 Compatibilidad
- Funciona en Chrome, Firefox, Safari, Edge
- Soporte para teclados físicos y virtuales
- Compatible con lectores de pantalla (NVDA, JAWS, VoiceOver)

---

### 7. Ejemplo de Uso

```typescript
// En cualquier página (ej: categorias/page.tsx)
import { BreadcrumbNavigation } from "@/components/common/BreadcrumbNavigation";

export default function CategoriasPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Categorías</h1>
        <BreadcrumbNavigation 
          currentPage="Categorías"
          showBackButton={true}
        />
      </div>
      {/* resto del contenido */}
    </div>
  );
}
```

---

### 8. Testing Propuesto

1. **Unit tests**: hooks individuales
2. **Integration tests**: navegación completa
3. **E2E tests**: flujos completos con teclado
4. **Accessibility tests**: con lectores de pantalla
5. **Mobile tests**: en dispositivos reales

---

## Resumen Ejecutivo

✅ **Navegación "Volver"** con breadcrumb inteligente  
✅ **Navegación por teclado completa** (tablas, formularios, modales)  
✅ **Preparado para móviles** (responsive + detección de teclado)  
✅ **Arquitectura escalable** y mantenible  
✅ **Implementación por fases** (6 fases, ~16-22 horas total)

---

## Estado Actual

**Estado**: 📋 Propuesta - Pendiente de implementación

**Última actualización**: Noviembre 2024

**Prioridad**: Alta (mejora significativa de UX y accesibilidad)

