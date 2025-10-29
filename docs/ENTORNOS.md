# 🚀 Configuración de Entornos

## 📋 Resumen

Este proyecto está configurado con **dos entornos separados** para permitir desarrollo y testing independiente de la producción.

## 🌐 Entornos Disponibles

### 🔧 **Desarrollo/Testing**
- **URL**: `https://remitero-dev.vercel.app`
- **Branch**: `develop`
- **Base de datos**: Desarrollo/Testing
- **Uso**: Para desarrollo, testing y nuevas funcionalidades

### 🏭 **Producción**
- **URL**: `https://remitero-prod.vercel.app`
- **Branch**: `main`
- **Base de datos**: Producción
- **Uso**: Para usuarios finales

## 🛠️ Comandos de Despliegue

### Desplegar a Desarrollo
```bash
./scripts/deploy-dev.sh
```

### Desplegar a Producción
```bash
./scripts/deploy-prod.sh
```

## 📝 Flujo de Trabajo

1. **Desarrollo**: Trabajar en branch `develop`
2. **Testing**: Probar en `remitero-dev.vercel.app`
3. **Producción**: Merge a `main` y desplegar a `remitero-prod.vercel.app`

## 🔧 Configuración de Vercel

### Variables de Entorno

#### Desarrollo
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://dev-db-url`
- `NEXTAUTH_URL=https://remitero-dev.vercel.app`

#### Producción
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://prod-db-url`
- `NEXTAUTH_URL=https://remitero-prod.vercel.app`

## 📊 Migración de Base de Datos

El script `scripts/migrate-vercel.js` se ejecuta automáticamente en cada despliegue para:
- Crear el enum `StockStatus` si no existe
- Agregar la columna `stock` a la tabla `Product` si no existe
- Verificar la estructura de la base de datos

## 🚨 Importante

- **Nunca** trabajar directamente en `main` para desarrollo
- **Siempre** probar en desarrollo antes de producción
- **Verificar** que las migraciones se ejecuten correctamente
- **Backup** de la base de datos de producción antes de cambios importantes
