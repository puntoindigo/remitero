# 🔧 Configurar Auto-Deploy a Producción en Vercel

## 🚨 Problema

Los pushes a `main` no están generando deploys automáticos a producción, aunque los pushes a `develop` sí generan previews automáticamente.

## ✅ Checklist de Tareas

```task-checkbox
{"taskId":"auto-deploy-1","label":"Verificar que el repositorio está conectado en Settings → Git"}
```

```task-checkbox
{"taskId":"auto-deploy-2","label":"Verificar que los webhooks de Vercel están activos en GitHub"}
```

```task-checkbox
{"taskId":"auto-deploy-3","label":"Verificar que el branch main existe y tiene commits recientes"}
```

```task-checkbox
{"taskId":"auto-deploy-4","label":"Hacer un push de prueba a main y verificar que se crea un deployment"}
```

---

## 📍 Paso 1: Verificar Conexión del Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`v0-remitero`)
3. Ve a **Settings** → **Git**
4. Verifica que el repositorio esté conectado:
   - Deberías ver: `puntoindigo/remitero`
   - Estado: **"Connected"** con fecha
5. Si no está conectado o parece roto:
   - Haz clic en **"Disconnect"** (si está conectado)
   - Espera unos segundos
   - Haz clic en **"Connect Git Repository"**
   - Selecciona tu repositorio (`puntoindigo/remitero`)
   - Autoriza los permisos necesarios
   - Esto recreará los webhooks automáticamente

---

## 📍 Paso 2: Verificar Webhooks en GitHub

Los webhooks son los que notifican a Vercel cuando hay un push a `main`.

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

## 📍 Paso 3: Verificar Branch Protection en GitHub

Si tienes **Branch Protection** activado en GitHub para `main`, puede estar bloqueando los webhooks:

1. Ve a GitHub → Tu Repositorio → **Settings** → **Branches**
2. Busca reglas de protección para `main`
3. Verifica que **"Restrict pushes that create files"** NO esté bloqueando webhooks
4. O agrega una excepción para webhooks de Vercel

---

## 📍 Paso 4: Cómo Funciona el Auto-Deploy en Vercel

En Vercel, el **branch de producción se detecta automáticamente**:

- Si tu repositorio tiene un branch llamado `main` o `master`, Vercel lo usa como producción
- Los pushes a `main` deberían generar deployments de **Production** automáticamente
- Los pushes a otros branches (como `develop`) generan deployments de **Preview**

**No hay una opción explícita de "Production Branch" en Settings → Git** porque Vercel lo detecta automáticamente.

---

## 📍 Paso 5: Verificar que Main es el Branch de Producción

1. Ve a Vercel Dashboard → **Deployments**
2. Busca deployments del branch `main`
3. Verifica que tengan el badge **"Production"** (no "Preview")
4. Si los deployments de `main` aparecen como "Preview", hay un problema de configuración

---

## 📍 Paso 6: Probar con Commit Vacío

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

### Problema: Los deployments de `main` aparecen como "Preview"

**Causa**: Vercel no está detectando `main` como branch de producción.

**Solución**:
1. Verifica que el branch se llama exactamente `main` (no `master` ni otro nombre)
2. Verifica que hay commits recientes en `main`
3. Intenta desconectar y volver a conectar el repositorio en Vercel

### Problema: No se crean deployments automáticamente

**Causa**: Los webhooks no están funcionando o están bloqueados.

**Solución**:
1. Verifica los webhooks en GitHub (Settings → Webhooks)
2. Si no hay webhooks, reconecta el repositorio en Vercel
3. Verifica que Branch Protection no esté bloqueando webhooks

### Problema: Deployments se crean pero fallan

**Causa**: Problema con el build o variables de entorno.

**Solución**:
1. Ve a Vercel Dashboard → Deployments → Selecciona el deployment fallido
2. Haz clic en **"Build Logs"** para ver el error
3. Verifica las variables de entorno en Settings → Environment Variables

---

## 📝 Configuración Recomendada

Para que funcione correctamente:

### En Vercel:
- ✅ Repositorio conectado en Settings → Git
- ✅ Webhooks activos (se crean automáticamente al conectar)
- ✅ Branch `main` existe y tiene commits

### En GitHub:
- ✅ Webhooks de Vercel activos (Settings → Webhooks)
- ✅ Branch Protection no bloquea webhooks (o tiene excepción)

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

## 🎯 Resumen

**Vercel detecta automáticamente `main` como branch de producción**. No hay una opción explícita en Settings → Git para configurarlo. Si los pushes a `main` no generan deployments automáticos, el problema suele ser:

1. **Webhooks rotos o inactivos** → Reconectar repositorio
2. **Branch Protection bloqueando webhooks** → Agregar excepción
3. **Branch no se llama `main`** → Verificar nombre del branch

---

**Última actualización**: Noviembre 2024
