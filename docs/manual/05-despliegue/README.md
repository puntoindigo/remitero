# 🚀 Despliegue

Despliegue en Vercel, producción y gestión de releases.

## 📋 Guías Disponibles

### [Vercel Setup](./vercel-setup.md)
Configuración inicial de Vercel, variables de entorno y primeros pasos.

### [Flujo Develop → Main](./flujo-despliegue.md)
Proceso completo para mover cambios de desarrollo a producción.

### [Reiniciar Servidor](./reiniciar-servidor.md)
Cómo reiniciar el servidor en Vercel.

---

## ⚡ Despliegue Rápido

### Desarrollo/Preview
```bash
git push origin develop
# Vercel automáticamente despliega a Preview
```

### Producción
```bash
git checkout main
git merge develop --no-ff -m "Merge develop into main"
git push origin main
# Vercel automáticamente despliega a Production
```

---

## 🔧 Configuración Requerida

- Variables de entorno configuradas en Vercel
- Base de datos accesible desde Vercel
- Migraciones ejecutadas

**Ver detalles**: [Vercel Setup](./vercel-setup.md)

---

**Siguiente paso**: [Troubleshooting](../06-troubleshooting/README.md)

