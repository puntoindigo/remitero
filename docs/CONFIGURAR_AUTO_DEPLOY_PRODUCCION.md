# 🔧 Configurar Auto-Deploy a Producción en Vercel

## 🚨 Problema

Los pushes a `main` no están generando deploys automáticos a producción, aunque los pushes a `develop` sí generan previews automáticamente.

## 🔍 Verificación de Configuración Actual

### 1. Verificar `vercel.json`

El archivo `vercel.json` ya tiene la configuración correcta:

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

✅ Esto está bien configurado.

### 2. Verificar Configuración en Vercel Dashboard

El problema probablemente está en la configuración del dashboard de Vercel. Sigue estos pasos:

#### Paso 1: Ir a Settings → Git

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`v0-remitero`)
3. Ve a **Settings** → **Git**

#### Paso 2: Verificar Branch Configuration

1. En la sección **"Production Branch"**, verifica que esté configurado como `main`
2. Si no está configurado o está en otro branch, cámbialo a `main`
3. Guarda los cambios

#### Paso 3: Verificar Production Branch Settings

1. En la misma página, busca la sección **"Production Branch"** o **"Branch Protection"**
2. Verifica que:
   - ✅ **Production Branch** = `main`
   - ✅ **Auto-deploy** está habilitado para `main`
   - ❌ **Branch Protection** NO está bloqueando los deploys (a menos que quieras aprobaciones manuales)

#### Paso 4: Verificar Webhooks de GitHub

1. Ve a **Settings** → **Git** → **Connected Git Repository**
2. Verifica que el repositorio esté conectado correctamente
3. Si no está conectado, conéctalo:
   - Haz clic en **"Connect Git Repository"**
   - Selecciona tu repositorio (`puntoindigo/remitero`)
   - Autoriza los permisos necesarios

#### Paso 5: Verificar Webhooks en GitHub

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

## 🚀 Soluciones

### Solución 1: Forzar Reconexión del Repositorio

1. Ve a Vercel Dashboard → Tu Proyecto → **Settings** → **Git**
2. Haz clic en **"Disconnect"** (si está conectado)
3. Espera unos segundos
4. Haz clic en **"Connect Git Repository"**
5. Selecciona tu repositorio nuevamente
6. Autoriza los permisos
7. Esto recreará los webhooks y debería activar el auto-deploy

### Solución 2: Verificar Branch Protection en GitHub

Si tienes **Branch Protection** activado en GitHub para `main`, puede estar bloqueando los webhooks:

1. Ve a GitHub → Tu Repositorio → **Settings** → **Branches**
2. Busca reglas de protección para `main`
3. Verifica que **"Restrict pushes that create files"** NO esté bloqueando webhooks
4. O agrega una excepción para webhooks de Vercel

### Solución 3: Hacer Deploy Manual (Temporal)

Mientras solucionas el auto-deploy, puedes hacer deploys manuales:

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

### Solución 4: Crear Empty Commit para Forzar Deploy

A veces un commit vacío puede activar el webhook:

```bash
# Crear un commit vacío
git checkout main
git commit --allow-empty -m "chore: trigger production deployment"
git push origin main
```

## 🔍 Verificar que Funcionó

Después de aplicar las soluciones:

1. **Espera 1-2 minutos** después del push a `main`
2. Ve a Vercel Dashboard → **Deployments**
3. Deberías ver un nuevo deployment con:
   - Badge **"Production"** (no "Preview")
   - Branch `main`
   - Estado "Building" o "Ready"

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

## ⚠️ Notas Importantes

1. **Primera vez**: Si es la primera vez que conectas el repositorio, Vercel puede tardar unos minutos en configurar los webhooks
2. **Webhooks rotos**: Si los webhooks están rotos, desconecta y vuelve a conectar el repositorio
3. **Branch Protection**: Si tienes Branch Protection en GitHub, puede estar bloqueando los webhooks. Considera agregar una excepción para Vercel
4. **Deploy manual**: Siempre puedes hacer deploy manual con `vercel --prod` mientras solucionas el auto-deploy

## 🎯 Checklist de Verificación

- [ ] `vercel.json` tiene `"deploymentEnabled": { "main": true }`
- [ ] En Vercel Dashboard → Settings → Git, Production Branch = `main`
- [ ] Auto-deploy está habilitado para `main`
- [ ] El repositorio está conectado en Vercel
- [ ] Los webhooks de Vercel están activos en GitHub
- [ ] Branch Protection en GitHub no está bloqueando webhooks
- [ ] Hacer un push de prueba a `main` y verificar que se crea un deployment

---

**Última actualización**: Noviembre 2024

