# 🔧 Configurar Auto-Deploy a Producción en Vercel

## 🚨 Problema

Los pushes a `main` no están generando deploys automáticos a producción, aunque los pushes a `develop` sí generan previews automáticamente.

## ✅ Checklist de Tareas

```task-checkbox
{"taskId":"auto-deploy-1","label":"Ir a Vercel Dashboard → Settings → Git"}
```

```task-checkbox
{"taskId":"auto-deploy-2","label":"Verificar que Production Branch = main"}
```

```task-checkbox
{"taskId":"auto-deploy-3","label":"Verificar que Auto-deploy está habilitado para main"}
```

```task-checkbox
{"taskId":"auto-deploy-4","label":"Verificar que el repositorio está conectado correctamente"}
```

```task-checkbox
{"taskId":"auto-deploy-5","label":"Verificar webhooks de Vercel en GitHub (Settings → Webhooks)"}
```

```task-checkbox
{"taskId":"auto-deploy-6","label":"Hacer push de prueba a main y verificar que se crea un deployment"}
```

---

## 📍 Paso 1: Verificar Production Branch

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`v0-remitero`)
3. Ve a **Settings** → **Git**
4. En la sección **"Production Branch"**, verifica que esté configurado como `main`
5. Si no está configurado o está en otro branch, cámbialo a `main`
6. Guarda los cambios

---

## 📍 Paso 2: Verificar Auto-Deploy

1. En la misma página (Settings → Git)
2. Busca la sección **"Production Branch"** o **"Branch Protection"**
3. Verifica que:
   - ✅ **Production Branch** = `main`
   - ✅ **Auto-deploy** está habilitado para `main`
   - ❌ **Branch Protection** NO está bloqueando los deploys (a menos que quieras aprobaciones manuales)

---

## 📍 Paso 3: Verificar Conexión del Repositorio

1. En la misma página (Settings → Git)
2. Verifica que el repositorio esté conectado correctamente
3. Si no está conectado o parece roto:
   - Haz clic en **"Disconnect"** (si está conectado)
   - Espera unos segundos
   - Haz clic en **"Connect Git Repository"**
   - Selecciona tu repositorio (`puntoindigo/remitero`)
   - Autoriza los permisos necesarios
   - Esto recreará los webhooks automáticamente

---

## 📍 Paso 4: Verificar Webhooks en GitHub

1. Ve a tu repositorio en GitHub: `github.com/puntoindigo/remitero`
2. Ve a **Settings** → **Webhooks**
3. Busca webhooks de Vercel (deberían tener URLs como `https://api.vercel.com/v1/integrations/...`)
4. Verifica que:
   - ✅ Están activos (marcados como "Active")
   - ✅ Están configurados para eventos de `push` en todos los branches
   - ✅ O al menos en `main` y `develop`

Si no hay webhooks o están inactivos:
- Ve a Vercel Dashboard → Settings → Git
- Desconecta y vuelve a conectar el repositorio
- Esto recreará los webhooks automáticamente

---

## 📍 Paso 5: Probar con Commit Vacío

Si todo parece correcto pero no despliega, prueba forzar un deploy:

```bash
git checkout main
git commit --allow-empty -m "chore: trigger production deployment"
git push origin main
```

Luego espera 1-2 minutos y verifica en Vercel Dashboard → Deployments si aparece un nuevo deployment de Production.

---

## 🚀 Solución Rápida: Deploy Manual

Mientras verificas la configuración, puedes hacer deploys manuales:

```bash
# Desde la raíz del proyecto
vercel --prod
```

O desde el dashboard:
1. Ve a **Deployments**
2. Haz clic en **"Deploy"** o **"Redeploy"**
3. Selecciona branch `main`
4. Selecciona el commit más reciente
5. Haz clic en **"Deploy"**

---

## 🔍 Verificar que Funcionó

Después de aplicar las soluciones:

1. **Espera 1-2 minutos** después del push a `main`
2. Ve a Vercel Dashboard → **Deployments**
3. Deberías ver un nuevo deployment con:
   - Badge **"Production"** (no "Preview")
   - Branch `main`
   - Estado "Building" o "Ready"

---

## ⚠️ Problemas Comunes

### Problema: Branch Protection en GitHub

Si tienes **Branch Protection** activado en GitHub para `main`, puede estar bloqueando los webhooks:

1. Ve a GitHub → Tu Repositorio → **Settings** → **Branches**
2. Busca reglas de protección para `main`
3. Verifica que **"Restrict pushes that create files"** NO esté bloqueando webhooks
4. O agrega una excepción para webhooks de Vercel

### Problema: Webhooks Rotos

Si los webhooks están rotos:
1. Ve a Vercel Dashboard → Settings → Git
2. Haz clic en **"Disconnect"**
3. Espera unos segundos
4. Haz clic en **"Connect Git Repository"**
5. Selecciona tu repositorio nuevamente
6. Esto recreará los webhooks

---

## 📝 Configuración Recomendada

Para que funcione correctamente, la configuración debería ser:

### En Vercel Dashboard:
- **Production Branch**: `main`
- **Auto-deploy**: ✅ Habilitado para `main`
- **Preview Branches**: `develop` y otros (automático)

### En GitHub:
- **Webhooks de Vercel**: ✅ Activos
- **Branch Protection**: No debe bloquear webhooks (o tener excepción)

### En `vercel.json`:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

---

**Última actualización**: Noviembre 2024

