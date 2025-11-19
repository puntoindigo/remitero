# 🚀 Configurar Production Branch en Vercel

## ⚠️ Problema Actual

Los deployments de `main` están yendo a **Preview** en lugar de **Production**.

## ✅ Solución: Configurar Production Branch

### Paso 1: Ir a Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `v0-remitero`
3. Ve a **Settings** → **General**

### Paso 2: Configurar Production Branch

1. Busca la sección **"Production Branch"**
2. Cambia el valor a: `main`
3. Guarda los cambios

### Paso 3: Verificar

1. Ve a **Deployments**
2. Haz un nuevo push a `main` o espera al próximo
3. El deployment debe mostrar badge **"Production"** (verde), NO "Preview"

## 🔄 Deploy Manual (Alternativa)

Si necesitas hacer un deploy inmediato sin esperar a la configuración:

```bash
git checkout main
vercel --prod
```

Esto fuerza un deploy a producción independientemente de la configuración.

## 📝 Nota

- `main` → **Production** (producción)
- `develop` → **Preview** (preview/testing)

---

**Última actualización**: Diciembre 2024

