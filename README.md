# Sistema de Gestión de Productos y Remitos - Next.js

Un sistema web moderno y completo para la gestión de productos, clientes, categorías y remitos con impresión en formato A4 duplicado, desarrollado con Next.js, TypeScript y Tailwind CSS.

<!-- Deploy test - proyecto v0-remitero -->

## 🚀 Características

### 📦 Gestión Completa
- **ABM de Categorías** - Organiza tus productos por categorías
- **ABM de Clientes** - Gestiona información completa de clientes
- **ABM de Productos** - Productos con categorías, precios y stock
- **ABM de Remitos** - Remitos con numeración automática y cálculos

### 🖨️ Sistema de Impresión Avanzado
- **Formato A4 duplicado** para impresión profesional
- **Línea de corte** claramente marcada
- **Vista previa** antes de imprimir
- **Diseño optimizado** para impresoras estándar

### 💻 Tecnología Moderna
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para diseño responsive
- **LocalStorage** para persistencia de datos
- **Componentes reutilizables** y modulares

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación Local
```bash
# Clonar el repositorio
git clone https://github.com/puntoindigo/remitero.git
cd remitero

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
open http://localhost:3000
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Linter de código
```

## 📋 Funcionalidades Detalladas

### Categorías de Productos
- ✅ Crear, editar y eliminar categorías
- ✅ Descripción opcional para cada categoría
- ✅ Fecha de creación automática
- ✅ Validación de datos

### Gestión de Clientes
- ✅ Información completa: nombre, email, teléfono, dirección
- ✅ Campos opcionales para flexibilidad
- ✅ Validación de email
- ✅ Búsqueda y filtrado visual

### Productos
- ✅ Asociación con categorías
- ✅ Precios con decimales
- ✅ Control de stock opcional
- ✅ Descripción detallada
- ✅ Cálculos automáticos

### Remitos
- ✅ **Numeración automática** (REM-0001, REM-0002...)
- ✅ Selección de cliente desde lista
- ✅ Múltiples productos con cantidades
- ✅ **Cálculos automáticos** de subtotales y total
- ✅ Fecha personalizable
- ✅ Observaciones opcionales

### Sistema de Impresión
- ✅ **Formato A4 duplicado** profesional
- ✅ **Línea de corte** para dividir la hoja
- ✅ **Copia para cliente** y **copia para archivo**
- ✅ Información completa en ambas copias
- ✅ Espacios para firmas y fecha de entrega
- ✅ Vista previa antes de imprimir

## 🎨 Diseño y UX

### Interfaz Moderna
- **Diseño responsive** - Funciona en móviles, tablets y escritorio
- **Navegación por pestañas** - Acceso rápido a cada sección
- **Formularios intuitivos** - Validación en tiempo real
- **Tablas organizadas** - Información clara y accesible

### Experiencia de Usuario
- **Mensajes de confirmación** - Feedback visual para todas las acciones
- **Validaciones inteligentes** - Previene errores comunes
- **Cálculos automáticos** - Sin errores de cálculo manual
- **Persistencia de datos** - Los datos se guardan automáticamente

## 🚀 Deploy en Vercel

### Deploy Automático
1. **Conectar con GitHub** - El repositorio se conecta automáticamente
2. **Deploy automático** - Cada push a main genera un nuevo deploy
3. **URL personalizada** - Acceso directo desde cualquier dispositivo
4. **HTTPS automático** - Seguridad garantizada

### Variables de Entorno
No se requieren variables de entorno para el funcionamiento básico.

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ **Escritorio** - Experiencia completa
- ✅ **Tablet** - Interfaz adaptada
- ✅ **Móvil** - Navegación táctil optimizada

## 🔧 Personalización

### Estilos
- Modifica `src/app/globals.css` para cambios globales
- Usa las clases de Tailwind para personalización rápida
- Componentes modulares para fácil mantenimiento

### Funcionalidad
- Extiende los hooks en `src/hooks/` para nuevas características
- Agrega nuevos tipos en `src/types/index.ts`
- Componentes reutilizables en `src/components/ui/`

## 📊 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes base reutilizables
│   ├── Navigation.tsx    # Navegación principal
│   ├── CategoriasSection.tsx
│   ├── ClientesSection.tsx
│   ├── ProductosSection.tsx
│   └── RemitosSection.tsx
├── hooks/                # Hooks personalizados
│   └── useLocalStorage.ts
├── lib/                  # Utilidades y configuración
│   ├── storage.ts        # Gestión de LocalStorage
│   └── utils.ts          # Utilidades generales
└── types/                # Definiciones de TypeScript
    └── index.ts
```

## 🚀 Próximas Mejoras

- [ ] **Exportación a PDF** - Generar PDFs directamente
- [ ] **Búsqueda avanzada** - Filtros y búsqueda en tiempo real
- [ ] **Reportes de ventas** - Estadísticas y análisis
- [ ] **Backup y sincronización** - Respaldo en la nube
- [ ] **Múltiples usuarios** - Sistema de autenticación
- [ ] **API REST** - Integración con sistemas externos
- [ ] **Notificaciones** - Alertas y recordatorios

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte o consultas:
- Abre un issue en GitHub
- Contacta a través del repositorio

---

**Desarrollado con ❤️ usando Next.js, TypeScript y Tailwind CSS**

*Sistema profesional para la gestión eficiente de productos y remitos*// Force new deployment Tue Sep 23 12:32:52 -03 2025

## Deploy Test - Tue Sep 23 12:37:39 -03 2025
// Force deploy Tue Sep 23 13:14:06 -03 2025
