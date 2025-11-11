# Plan de Implementación - Versión Mobile

## Objetivo
Crear una versión mobile optimizada que priorice facilidad y claridad en el uso, con diseño inspirado en MercadoPago/WhatsApp/Messenger.

## Principios de Diseño

### 1. Navegación Principal
- **Ubicación**: Barra inferior fija (similar a WhatsApp/Messenger)
- **Opciones básicas**:
  - 🏠 Tablero (Dashboard)
  - 📄 Remitos
  - 👥 Clientes
  - 📦 Productos
- **Cada sección tiene botón +** para crear nuevo elemento
- **Navegación táctil**: Botones grandes, fácil de tocar

### 2. Casos de Uso Mobile
El usuario mobile va a:
- ✅ **Controlar ventas**: Ver números, totales, estadísticas
- ✅ **Cambiar stock**: Actualizar cantidades rápidamente
- ✅ **Cargar remito nuevo**: Crear remito desde el celular (sin imprimir)
- ❌ **NO imprimir**: Deshabilitar impresión desde mobile

### 3. Listados
- **Diseño claro y simple**
- **Cards grandes** en lugar de tablas
- **Información esencial visible** sin scroll horizontal
- **Acciones rápidas** (swipe actions opcional)

### 4. Formularios
- **Inputs grandes** para touch
- **Spacing generoso** entre campos
- **Botones de acción fijos** en la parte inferior
- **Validación clara** y feedback inmediato

## Estructura de Implementación

### Fase 1: Detección y Layout Base
1. Crear hook `useIsMobile()` para detectar dispositivo
2. Crear componente `MobileLayout` con navegación inferior
3. Crear componente `MobileNavigation` (barra inferior)
4. Modificar `AuthenticatedLayout` para usar layout mobile cuando corresponda

### Fase 2: Navegación Mobile
1. Barra inferior con 4 opciones principales
2. Iconos grandes y claros
3. Indicador de página activa
4. Botón + flotante o en cada sección

### Fase 3: Adaptación de Listados
1. **Remitos**: Cards con número, cliente, fecha, total
2. **Clientes**: Cards con nombre, email, teléfono
3. **Productos**: Cards con nombre, precio, stock (con botón rápido para cambiar)
4. **Dashboard**: Versión compacta con números grandes

### Fase 4: Formularios Mobile
1. Adaptar formularios existentes para mobile
2. Inputs más grandes
3. Selectores tipo picker nativo cuando sea posible
4. Botones de acción fijos

### Fase 5: Funcionalidades Específicas
1. **Deshabilitar impresión** desde mobile
2. **Cambio rápido de stock** en productos
3. **Vista rápida de totales** en remitos
4. **Búsqueda simplificada**

## Componentes a Crear

### Nuevos Componentes
- `MobileLayout.tsx` - Layout principal para mobile
- `MobileNavigation.tsx` - Barra de navegación inferior
- `MobileCard.tsx` - Card reutilizable para listados
- `MobileForm.tsx` - Wrapper para formularios mobile
- `MobileStockEditor.tsx` - Editor rápido de stock

### Hooks
- `useIsMobile.ts` - Detección de dispositivo mobile
- `useMobileNavigation.ts` - Gestión de navegación mobile

## Estilos

### Breakpoints
- Mobile: `< 768px` (tablets y móviles)
- Desktop: `>= 768px` (mantener diseño actual)

### Colores y Espaciado
- Mantener paleta actual
- Espaciado más generoso en mobile
- Botones mínimo 44x44px (estándar touch)

## Consideraciones Técnicas

### Performance
- Lazy loading de componentes mobile
- Reducir bundle size para mobile
- Optimizar imágenes si se agregan

### Accesibilidad
- Touch targets grandes
- Contraste adecuado
- Navegación por teclado (si aplica)

### Testing
- Probar en dispositivos reales (iOS, Android)
- Diferentes tamaños de pantalla
- Orientación vertical y horizontal

## Prioridades

### Alta
1. Layout base y navegación
2. Listados adaptados
3. Deshabilitar impresión

### Media
1. Formularios adaptados
2. Cambio rápido de stock
3. Dashboard mobile

### Baja
1. Swipe actions
2. Animaciones avanzadas
3. Modo offline (futuro)

## Notas
- Mantener compatibilidad con desktop
- No romper funcionalidad existente
- Progresivo: empezar con lo esencial y mejorar iterativamente

