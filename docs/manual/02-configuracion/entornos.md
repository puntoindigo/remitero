# 🌐 Entornos

Documentación de los diferentes entornos del proyecto.

## 📋 Resumen

Este proyecto está configurado con **dos entornos separados** para permitir desarrollo y testing independiente de la producción.

## 🌐 Entornos Disponibles

### 🔧 **Desarrollo/Testing**
- **URL**: `https://remitero-dev.vercel.app`
- **Branch**: `develop`
- **Base de datos**: Desarrollo/Testing
- **Uso**: Para desarrollo, testing y nuevas funcionalidades

### 🏭 **Producción**
- **URL**: `https://remitero-prod.vercel.app` (o `https://v0-remitero.vercel.app`)
- **Branch**: `main`
- **Base de datos**: Producción
- **Uso**: Para usuarios finales

## 🛠️ Comandos de Despliegue

### Desplegar a Desarrollo
```bash
git push origin develop
# Vercel automáticamente despliega a Preview
```

### Desplegar a Producción
```bash
git checkout main
git merge develop --no-ff -m "Merge develop into main"
git push origin main
# Vercel automáticamente despliega a Production
```

## 📝 Flujo de Trabajo

1. **Desarrollo**: Trabajar en branch `develop`
2. **Testing**: Probar en `remitero-dev.vercel.app` (Preview)
3. **Producción**: Merge a `main` y desplegar a producción

## 🔧 Configuración de Vercel

### Variables de Entorno

#### Desarrollo/Preview
- `NODE_ENV=development`
- `NEXTAUTH_URL=https://remitero-dev.vercel.app`
- Base de datos de desarrollo

#### Producción
- `NODE_ENV=production`
- `NEXTAUTH_URL=https://remitero-prod.vercel.app`
- Base de datos de producción

## 🚨 Importante

- **Nunca** trabajar directamente en `main` para desarrollo
- **Siempre** probar en desarrollo antes de producción
- **Verificar** que las migraciones se ejecuten correctamente
- **Backup** de la base de datos de producción antes de cambios importantes

---

**Siguiente paso**: [Autenticación](../03-autenticacion/README.md)

