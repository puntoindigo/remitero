# 🔧 Configuración de Entornos Separados

## 📋 Estado Actual

**⚠️ PROBLEMA**: Ambas URLs comparten la misma base de datos:
- **Producción**: `https://v0-remitero.vercel.app/`
- **Preview**: `https://remitero-dev.vercel.app/`
- **Base de datos**: COMPARTIDA

## 🎯 Solución: Entornos Separados

### 1. **Base de Datos de Producción**
- **URL**: `https://v0-remitero.vercel.app/`
- **Base de datos**: PostgreSQL de producción
- **Datos**: Datos reales de clientes

### 2. **Base de Datos de Desarrollo**
- **URL**: `https://remitero-dev.vercel.app/`
- **Base de datos**: PostgreSQL de desarrollo
- **Datos**: Datos de prueba

## 🔧 Configuración en Vercel

### Variables de Entorno para Producción:
```bash
DATABASE_URL="postgresql://user:pass@prod-host:5432/remitero_prod"
NEXTAUTH_URL="https://v0-remitero.vercel.app"
NEXTAUTH_SECRET="secret-prod"
```

### Variables de Entorno para Preview:
```bash
DATABASE_URL="postgresql://user:pass@dev-host:5432/remitero_dev"
NEXTAUTH_URL="https://remitero-dev.vercel.app"
NEXTAUTH_SECRET="secret-dev"
```

## 📝 Pasos para Configurar

1. **Ir a Vercel Dashboard**: https://vercel.com/daeiman0/v0-remitero/settings/environment-variables

2. **Configurar Producción**:
   - Agregar `DATABASE_URL` para Production
   - Agregar `NEXTAUTH_URL` para Production
   - Agregar `NEXTAUTH_SECRET` para Production

3. **Configurar Preview**:
   - Agregar `DATABASE_URL` para Preview
   - Agregar `NEXTAUTH_URL` para Preview
   - Agregar `NEXTAUTH_SECRET` para Preview

4. **Crear Base de Datos de Desarrollo**:
   - Crear nueva base de datos PostgreSQL
   - Ejecutar migraciones
   - Poblar con datos de prueba

## 🚀 Beneficios

- ✅ **Datos separados**: Producción vs Desarrollo
- ✅ **Pruebas seguras**: No afectar datos reales
- ✅ **Desarrollo independiente**: Cambios sin riesgo
- ✅ **Rollback fácil**: Revertir cambios de desarrollo

## ⚠️ Importante

- **NO** hacer cambios en la base de datos de producción desde desarrollo
- **SIEMPRE** probar en desarrollo antes de producción
- **BACKUP** regular de la base de datos de producción
