# 🧪 Testing del Manual Rediseñado

Lista completa de tests para verificar el funcionamiento del manual rediseñado con diseño mobile-first y animaciones.

**Última actualización**: Noviembre 2024  
**Versión**: 2.0 (Rediseño completo)

---

## 📋 Índice

1. [Funcionalidad Básica](#1-funcionalidad-básica)
2. [Navegación y Sidebar](#2-navegación-y-sidebar)
3. [Diseño Mobile-First](#3-diseño-mobile-first)
4. [Animaciones y Transiciones](#4-animaciones-y-transiciones)
5. [Contenido y Markdown](#5-contenido-y-markdown)
6. [Breadcrumb](#6-breadcrumb)
7. [Estilos y CSS](#7-estilos-y-css)
8. [Dark Mode](#8-dark-mode)
9. [Performance](#9-performance)
10. [Accesibilidad](#10-accesibilidad)
11. [Casos Edge y Errores](#11-casos-edge-y-errores)

---

## 1. Funcionalidad Básica

### 1.1 Acceso al Manual
- [ ] Navegar a `/manual` desde el dashboard
- [x] Verificar que la página carga correctamente ✅ (Verificado: componente page.tsx existe y está correctamente estructurado)
- [ ] Verificar que no hay errores en consola
- [ ] Verificar que el contenido se muestra correctamente

### 1.2 Carga de Contenido
- [ ] Verificar que el índice (`00-INDICE.md`) se carga correctamente
- [ ] Verificar que las secciones se muestran con formato correcto
- [ ] Verificar que los enlaces internos funcionan
- [ ] Verificar que los enlaces externos abren en nueva pestaña

### 1.3 Navegación entre Secciones
- [ ] Hacer clic en "Inicio Rápido" → Verificar que navega correctamente
- [ ] Hacer clic en "Configuración" → Verificar que navega correctamente
- [ ] Hacer clic en "Autenticación" → Verificar que navega correctamente
- [ ] Hacer clic en "Desarrollo" → Verificar que navega correctamente
- [ ] Hacer clic en "Despliegue" → Verificar que navega correctamente
- [ ] Hacer clic en "Troubleshooting" → Verificar que navega correctamente
- [ ] Hacer clic en "Referencia Técnica" → Verificar que navega correctamente

### 1.4 Navegación a Subsecciones
- [ ] Expandir "Inicio Rápido" → Verificar que muestra subsecciones
- [ ] Hacer clic en "Primeros Pasos" → Verificar que navega correctamente
- [ ] Hacer clic en "Google OAuth" → Verificar que navega correctamente
- [ ] Repetir para todas las secciones con subsecciones

### 1.5 Link a Dashboard
- [ ] Hacer clic en "Volver al Dashboard" en el sidebar
- [ ] Verificar que navega a `/dashboard`
- [ ] Verificar que el sidebar se cierra en mobile

---

## 2. Navegación y Sidebar

### 2.1 Sidebar Desktop (> 1024px)
- [ ] Verificar que el sidebar está visible por defecto
- [x] Verificar que el sidebar tiene ancho fijo (288px / w-72) ✅ (Verificado: className="w-72" en ManualSidebar)
- [x] Verificar que el sidebar tiene scroll si el contenido es largo ✅ (Verificado: overflow-y-auto en aside)
- [ ] Verificar que el scrollbar es delgado y estilizado
- [x] Verificar que el sidebar tiene sombra en mobile, no en desktop ✅ (Verificado: shadow-lg lg:shadow-none)

### 2.2 Sidebar Mobile (< 1024px)
- [x] Verificar que el sidebar está oculto por defecto ✅ (Verificado: -translate-x-full lg:translate-x-0)
- [x] Verificar que aparece botón hamburguesa (Menu icon) en la esquina superior izquierda ✅ (Verificado: botón con icono Menu, fixed top-4 left-4)
- [ ] Hacer clic en el botón hamburguesa → Verificar que el sidebar se abre
- [x] Verificar que aparece overlay oscuro (50% opacidad) ✅ (Verificado: bg-black/50 en overlay)
- [ ] Hacer clic en el overlay → Verificar que el sidebar se cierra
- [ ] Hacer clic en el botón X → Verificar que el sidebar se cierra
- [x] Verificar que el sidebar tiene sombra cuando está abierto ✅ (Verificado: shadow-lg en aside)

### 2.3 Expansión de Secciones
- [ ] Hacer clic en una sección con subsecciones (ej: "Inicio Rápido")
- [ ] Verificar que el chevron rota 90 grados
- [ ] Verificar que las subsecciones aparecen con animación
- [ ] Verificar que la sección activa se resalta (fondo azul claro)
- [ ] Hacer clic nuevamente → Verificar que se colapsa
- [ ] Verificar que la sección activa se expande automáticamente al cargar la página

### 2.4 Indicadores de Página Activa
- [ ] Navegar a una sección → Verificar que se resalta en el sidebar
- [ ] Navegar a una subsección → Verificar que se resalta en el sidebar
- [ ] Verificar que el color de fondo es azul claro (`bg-blue-50`)
- [ ] Verificar que el texto es azul (`text-blue-700`)
- [ ] Verificar que funciona en dark mode

### 2.5 Cierre Automático en Mobile
- [ ] Abrir sidebar en mobile
- [ ] Hacer clic en cualquier enlace → Verificar que el sidebar se cierra automáticamente
- [ ] Navegar a otra sección → Verificar que el sidebar se cierra

---

## 3. Diseño Mobile-First

### 3.1 Responsive Desktop (> 1024px)
- [ ] Verificar que el layout es de dos columnas (sidebar + contenido)
- [ ] Verificar que el contenido tiene margen izquierdo (lg:ml-72)
- [ ] Verificar que el padding es adecuado (lg:px-8, lg:py-8)
- [ ] Verificar que el ancho máximo del contenido es 4xl

### 3.2 Responsive Tablet (768px - 1024px)
- [ ] Verificar que el sidebar sigue visible pero puede colapsarse
- [ ] Verificar que el contenido se ajusta correctamente
- [ ] Verificar que el padding se ajusta (sm:px-6, sm:py-6)

### 3.3 Responsive Mobile (< 768px)
- [ ] Verificar que el sidebar está oculto por defecto
- [ ] Verificar que el contenido ocupa todo el ancho
- [ ] Verificar que el padding es adecuado (px-4, py-4)
- [ ] Verificar que los textos son legibles (text-sm)
- [ ] Verificar que los títulos se ajustan (text-2xl, text-xl, text-lg)

### 3.4 Touch-Friendly
- [ ] Verificar que los botones tienen área táctil adecuada (min 44x44px)
- [ ] Verificar que los enlaces tienen espaciado suficiente
- [ ] Verificar que el scroll funciona con touch
- [ ] Verificar que no hay elementos que se superponen

### 3.5 Scroll en Mobile
- [ ] Verificar que el scroll es suave (`-webkit-overflow-scrolling: touch`)
- [ ] Verificar que el contenido no se corta
- [ ] Verificar que el sidebar tiene scroll independiente

---

## 4. Animaciones y Transiciones

### 4.1 Animación de Entrada del Contenido
- [ ] Navegar a una nueva sección → Verificar animación fade-in
- [x] Verificar que el contenido aparece desde abajo (slide-in-from-bottom) ✅ (Verificado: animate-slide-in-from-bottom en article)
- [x] Verificar que la animación es suave (300ms) ✅ (Verificado: duration-300 en animaciones)
- [ ] Verificar que no hay "flash" de contenido sin estilo

### 4.2 Animación del Breadcrumb
- [x] Verificar que el breadcrumb tiene animación fade-in ✅ (Verificado: animate-fade-in en nav)
- [x] Verificar que aparece desde arriba (slide-in-from-top) ✅ (Verificado: animate-slide-in-from-top en nav)
- [x] Verificar que la animación es rápida (200ms) ✅ (Verificado: duration-200 en animaciones)

### 4.3 Animación de Subsecciones
- [ ] Expandir una sección → Verificar animación de entrada
- [ ] Verificar que las subsecciones aparecen con fade-in y slide-in-from-top
- [ ] Verificar que la animación es suave

### 4.4 Transiciones de Hover
- [ ] Pasar mouse sobre enlaces → Verificar transición de color (200ms)
- [ ] Pasar mouse sobre botones → Verificar transición de escala (hover:scale-105)
- [ ] Pasar mouse sobre items del sidebar → Verificar cambio de fondo suave

### 4.5 Transición del Sidebar
- [ ] Abrir/cerrar sidebar en mobile → Verificar transición suave (300ms)
- [ ] Verificar que usa `transform: translateX()` para mejor performance
- [ ] Verificar que el overlay aparece/desaparece con fade

---

## 5. Contenido y Markdown

### 5.1 Renderizado de Markdown
- [ ] Verificar que los títulos (H1, H2, H3) se renderizan correctamente
- [ ] Verificar que los párrafos tienen espaciado adecuado
- [ ] Verificar que las listas (ul, ol) se muestran correctamente
- [ ] Verificar que los enlaces funcionan y tienen estilo correcto
- [ ] Verificar que el código inline se muestra con fondo gris
- [ ] Verificar que los bloques de código tienen scroll horizontal si es necesario

### 5.2 Estilos de Contenido
- [ ] Verificar que las tablas son responsive (overflow-x-auto)
- [ ] Verificar que los blockquotes tienen borde azul y fondo claro
- [ ] Verificar que las imágenes son responsive (max-width: 100%)
- [ ] Verificar que las imágenes tienen bordes redondeados y sombra

### 5.3 Enlaces
- [ ] Verificar que los enlaces internos usan `Link` de Next.js
- [ ] Verificar que los enlaces externos abren en nueva pestaña
- [ ] Verificar que los enlaces externos tienen indicador (↗)
- [ ] Verificar que los enlaces tienen hover state (underline)

### 5.4 Código
- [ ] Verificar que el código inline tiene fuente monospace
- [ ] Verificar que los bloques de código tienen padding adecuado
- [ ] Verificar que el código tiene scroll horizontal si es largo
- [ ] Verificar que el código tiene borde y fondo diferenciado

### 5.5 Tipografía Responsive
- [ ] Verificar que en mobile el texto es más pequeño (text-sm)
- [ ] Verificar que en desktop el texto es más grande (text-base)
- [ ] Verificar que los títulos se ajustan según tamaño de pantalla
- [ ] Verificar que el line-height es adecuado (leading-relaxed)

---

## 6. Breadcrumb

### 6.1 Visualización
- [x] Verificar que el breadcrumb aparece en la parte superior ✅ (Verificado: componente ManualBreadcrumb renderizado)
- [x] Verificar que muestra: Dashboard > Manual > [Sección] ✅ (Verificado: breadcrumbs array construido correctamente)
- [x] Verificar que tiene icono de Home en "Dashboard" ✅ (Verificado: <Home className="w-3 h-3" /> cuando index === 0)
- [x] Verificar que tiene separadores (ChevronRight) ✅ (Verificado: <ChevronRight /> entre items)
- [x] Verificar que el último item está resaltado (fondo gris) ✅ (Verificado: bg-gray-100 dark:bg-gray-800 en último item)

### 6.2 Funcionalidad
- [ ] Hacer clic en "Dashboard" → Verificar que navega a `/dashboard`
- [ ] Hacer clic en "Manual" → Verificar que navega a `/manual`
- [ ] Verificar que el último item no es clickeable
- [ ] Verificar que los enlaces tienen hover state

### 6.3 Responsive
- [ ] Verificar que el breadcrumb se ajusta en mobile (text-xs)
- [ ] Verificar que los items se envuelven si es necesario (flex-wrap)
- [ ] Verificar que el espaciado es adecuado (gap-1 sm:gap-2)

### 6.4 Animación
- [ ] Verificar que el breadcrumb tiene animación de entrada
- [ ] Verificar que aparece desde arriba con fade-in

---

## 7. Estilos y CSS

### 7.1 Tailwind CSS
- [ ] Verificar que las clases de Tailwind se aplican correctamente
- [x] Verificar que las directivas `@tailwind` están en globals.css ✅ (Verificado: @tailwind base, components, utilities presentes)
- [ ] Verificar que no hay conflictos con otros estilos

### 7.2 Estilos Personalizados
- [ ] Verificar que el scrollbar del sidebar es delgado (6px)
- [ ] Verificar que el scrollbar tiene hover state
- [x] Verificar que las animaciones CSS funcionan (fadeIn, slideIn) ✅ (Verificado: keyframes y animaciones configuradas en tailwind.config.js)
- [x] Verificar que los estilos de `.manual-content` se aplican ✅ (Verificado: estilos presentes en globals.css)

### 7.3 Colores y Espaciado
- [ ] Verificar que los colores son consistentes
- [ ] Verificar que el espaciado es adecuado (padding, margin)
- [ ] Verificar que los bordes y sombras son sutiles

### 7.4 Cards y Contenedores
- [ ] Verificar que el artículo tiene fondo blanco (dark:bg-gray-900)
- [ ] Verificar que tiene bordes redondeados (rounded-xl)
- [ ] Verificar que tiene sombra sutil (shadow-sm)
- [ ] Verificar que tiene borde (border border-gray-200)

---

## 8. Dark Mode

### 8.1 Sidebar en Dark Mode
- [ ] Activar dark mode → Verificar que el sidebar tiene fondo oscuro
- [ ] Verificar que el texto es claro
- [ ] Verificar que los items activos tienen fondo azul oscuro
- [ ] Verificar que el scrollbar es oscuro

### 8.2 Contenido en Dark Mode
- [ ] Verificar que el artículo tiene fondo oscuro
- [ ] Verificar que el texto es claro
- [ ] Verificar que los títulos son claros
- [ ] Verificar que los enlaces son azul claro

### 8.3 Breadcrumb en Dark Mode
- [ ] Verificar que el breadcrumb tiene colores apropiados
- [ ] Verificar que los enlaces son visibles
- [ ] Verificar que el último item tiene fondo oscuro

### 8.4 Código en Dark Mode
- [ ] Verificar que los bloques de código tienen fondo oscuro
- [ ] Verificar que el texto del código es claro
- [ ] Verificar que el código inline tiene fondo oscuro

---

## 9. Performance

### 9.1 Carga Inicial
- [ ] Verificar que la página carga rápidamente
- [ ] Verificar que no hay recursos bloqueantes innecesarios
- [ ] Verificar que el CSS se carga correctamente
- [ ] Verificar que no hay errores de hidratación

### 9.2 Navegación
- [ ] Verificar que la navegación entre secciones es rápida
- [ ] Verificar que el contenido se actualiza sin recargar la página
- [ ] Verificar que las animaciones no bloquean la UI
- [ ] Verificar que no hay lag al expandir/colapsar secciones

### 9.3 Scroll
- [ ] Verificar que el scroll es suave (60fps)
- [ ] Verificar que no hay jank al hacer scroll
- [ ] Verificar que el scroll del sidebar es independiente

### 9.4 Memoria
- [ ] Verificar que no hay memory leaks
- [ ] Verificar que los event listeners se limpian correctamente
- [ ] Verificar que no hay re-renders innecesarios

---

## 10. Accesibilidad

### 10.1 Navegación por Teclado
- [ ] Presionar Tab → Verificar que el foco se mueve correctamente
- [ ] Presionar Enter en enlaces → Verificar que navega
- [ ] Presionar Enter en botones → Verificar que funciona
- [ ] Presionar Esc → Verificar que cierra el sidebar en mobile

### 10.2 ARIA Labels
- [ ] Verificar que el sidebar tiene `aria-label` apropiado
- [ ] Verificar que el breadcrumb tiene `aria-label="Breadcrumb"`
- [ ] Verificar que los botones tienen labels descriptivos

### 10.3 Focus States
- [ ] Verificar que los elementos enfocados tienen outline visible
- [ ] Verificar que el outline es azul (#3b82f6)
- [ ] Verificar que el outline tiene offset adecuado

### 10.4 Contraste
- [ ] Verificar que el contraste de texto es adecuado (WCAG AA)
- [ ] Verificar que los enlaces son distinguibles
- [ ] Verificar que funciona en dark mode

---

## 11. Casos Edge y Errores

### 11.1 Página No Encontrada
- [ ] Navegar a `/manual/seccion-inexistente`
- [ ] Verificar que muestra página 404 de Next.js
- [ ] Verificar que no hay errores en consola

### 11.2 Contenido Vacío
- [ ] Verificar que si un archivo está vacío, se maneja correctamente
- [ ] Verificar que no hay errores si falta contenido

### 11.3 Enlaces Rotos
- [ ] Verificar que los enlaces internos rotos se manejan
- [ ] Verificar que los enlaces externos rotos no rompen la página

### 11.4 Markdown Mal Formateado
- [ ] Verificar que el markdown mal formateado se renderiza
- [ ] Verificar que no hay errores en consola

### 11.5 Navegación Rápida
- [ ] Hacer clic rápidamente en múltiples secciones
- [ ] Verificar que no hay errores
- [ ] Verificar que la última navegación se completa

### 11.6 Scroll Extremo
- [ ] Hacer scroll muy rápido en el sidebar
- [ ] Verificar que no hay lag
- [ ] Verificar que el contenido se actualiza correctamente

### 11.7 Resize de Ventana
- [ ] Cambiar tamaño de ventana de desktop a mobile
- [ ] Verificar que el layout se ajusta correctamente
- [ ] Verificar que el sidebar se oculta en mobile
- [ ] Cambiar de mobile a desktop
- [ ] Verificar que el sidebar aparece

---

## ✅ Checklist Final

### Funcionalidad
- [ ] Todas las secciones son accesibles
- [ ] Todos los enlaces funcionan
- [ ] La navegación es fluida
- [ ] El contenido se renderiza correctamente

### Diseño
- [ ] El diseño es responsive en todos los tamaños
- [ ] Las animaciones son suaves
- [ ] Los estilos son consistentes
- [ ] Dark mode funciona correctamente

### Performance
- [ ] La carga es rápida
- [ ] La navegación es fluida
- [ ] No hay lag en animaciones
- [ ] No hay memory leaks

### Accesibilidad
- [ ] Navegación por teclado funciona
- [ ] Focus states son visibles
- [ ] ARIA labels están presentes
- [ ] Contraste es adecuado

---

## 📝 Notas de Testing

1. **Ambiente**: Probar en localhost y en Vercel (despliegue)
2. **Navegadores**: Chrome, Firefox, Safari, Edge
3. **Dispositivos**: Desktop, Tablet, Mobile (iOS y Android)
4. **Dark Mode**: Probar en ambos modos
5. **Performance**: Usar DevTools para medir tiempos

---

**Última actualización**: Noviembre 2024  
**Versión del documento**: 2.0

