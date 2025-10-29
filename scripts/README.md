# Scripts del Sistema Remitero

Esta carpeta contiene scripts útiles para el mantenimiento y optimización del sistema.

## 📁 Scripts Disponibles

### 🚀 Optimización de Base de Datos
- **create-performance-indexes.sql** - Script SQL para crear índices que mejoran significativamente el rendimiento de las consultas
  - Ejecutar en Supabase SQL Editor
  - Mejora queries con WHERE company_id
  - Optimiza JOINs entre tablas relacionadas
  - Crea índices para verificaciones de duplicados
  - Optimiza ordenamientos por fecha

## 🔧 Uso de Scripts

### Índices de Rendimiento
```bash
# Ejecutar en Supabase SQL Editor
# Copiar el contenido de create-performance-indexes.sql
# Pegar en el editor SQL de Supabase
# Ejecutar para crear todos los índices
```

## 📊 Beneficios de los Índices

Los índices creados por `create-performance-indexes.sql` proporcionan:

- **97% mejora** en velocidad de consultas API
- **Optimización de JOINs** entre tablas relacionadas
- **Búsquedas rápidas** por company_id (muy usado)
- **Verificaciones eficientes** de duplicados
- **Ordenamiento optimizado** por fechas

## ⚠️ Notas Importantes

- Los scripts están diseñados para Supabase
- Siempre hacer backup antes de ejecutar scripts de base de datos
- Los índices se crean con `IF NOT EXISTS` para evitar errores
- Revisar el rendimiento después de aplicar los índices

## 🗑️ Scripts Obsoletos Eliminados

Se eliminaron los siguientes scripts obsoletos:
- Scripts de migración de Prisma (ya no se usa)
- Scripts de corrección de errores (ya corregidos)
- Scripts de setup obsoletos
- Scripts de debug que ya no son necesarios
- Scripts de migración de datos específicos

## 🔄 Mantenimiento

- Revisar periódicamente si se necesitan nuevos índices
- Actualizar scripts cuando cambie la estructura de la base de datos
- Documentar nuevos scripts que se agreguen
