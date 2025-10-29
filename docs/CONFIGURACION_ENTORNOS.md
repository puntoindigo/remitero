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

### Variables de Entorno para Preview/Desarrollo:
```bash
# URL directa de PostgreSQL
dev_POSTGRES_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

# URL de Prisma Accelerate (recomendada para producción)
dev_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19oeFJWWDhQNjlMWEgyN3AzSFVhbWQiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI2MmQ4NjkxYzBiY2EwNGE1ZmNiMGE4ZWU5MjQzNWUxZGU0ZDhlZDYwOGYxMGZiMmE4ZWM1OTdmNDU4M2U1Y2IxIiwiaW50ZXJuYWxfc2VjcmV0IjoiOGNiZDNmNzQtNmE4Yi00Njk3LTg0NTktYWJlMmNkN2Q5NDlkIn0._6KDiMWwgiOHO65UkNvss0xDdQFTh7OVkB_cRzYfI-c"

# URL directa de PostgreSQL (alternativa)
DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

NEXTAUTH_URL="https://remitero-dev.vercel.app"
NEXTAUTH_SECRET="secret-dev"
```

## 📝 Pasos para Configurar

1. **Ir a Vercel Dashboard**: https://vercel.com/daeiman0/v0-remitero/settings/environment-variables

2. **Configurar Producción**:
   - Agregar `DATABASE_URL` para Production
   - Agregar `NEXTAUTH_URL` para Production
   - Agregar `NEXTAUTH_SECRET` para Production

3. **Configurar Preview/Desarrollo**:
   - Agregar `dev_POSTGRES_URL` para Preview/Development
   - Agregar `dev_PRISMA_DATABASE_URL` para Preview/Development (recomendado)
   - Agregar `DATABASE_URL` para Preview/Development (alternativa)
   - Agregar `NEXTAUTH_URL` para Preview/Development
   - Agregar `NEXTAUTH_SECRET` para Preview/Development

4. **Configurar Base de Datos de Desarrollo**:
   - ✅ Base de datos PostgreSQL ya creada en Prisma
   - ✅ URLs de conexión configuradas
   - Ejecutar migraciones: `npx prisma migrate dev`
   - Poblar con datos de prueba: `npx prisma db seed`

## 🔗 URLs de Conexión Actualizadas

### Para Desarrollo:
- **Prisma Accelerate** (recomendado): `dev_PRISMA_DATABASE_URL`
- **PostgreSQL directo**: `dev_POSTGRES_URL` o `DATABASE_URL`
- **Host**: `db.prisma.io:5432`
- **SSL**: Requerido (`sslmode=require`)

## 🚀 Beneficios

- ✅ **Datos separados**: Producción vs Desarrollo
- ✅ **Pruebas seguras**: No afectar datos reales
- ✅ **Desarrollo independiente**: Cambios sin riesgo
- ✅ **Rollback fácil**: Revertir cambios de desarrollo

## ⚠️ Importante

- **NO** hacer cambios en la base de datos de producción desde desarrollo
- **SIEMPRE** probar en desarrollo antes de producción
- **BACKUP** regular de la base de datos de producción
