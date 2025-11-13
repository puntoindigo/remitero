# 🔧 Configurar Main Solo para Production (No Preview)

## 🚨 Problema

Cuando se hace push a `main`, Vercel está desplegando tanto a **Production** como a **Preview**. Esto no es deseable porque:
- `main` debe ir **solo** a Production
- `develop` debe ir **solo** a Preview
- Nunca debemos desplegar `main` a Preview

## ✅ Solución: Configurar en Vercel Dashboard

### Paso 1: Ir a Settings → Git

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`v0-remitero`)
3. Ve a **Settings** → **Git**

### Paso 2: Configurar Production Branch

1. En la sección **"Production Branch"**, asegúrate de que esté configurado como `main`
2. Verifica que **"Automatically deploy production branch"** esté habilitado
3. **IMPORTANTE**: Asegúrate de que **NO** haya configuraciones adicionales que permitan que `main` se despliegue a Preview

### Paso 3: Configurar Ignore Build Step (Opcional pero Recomendado)

1. Ve a **Settings** → **Git** → **Ignored Build Step**
2. Puedes agregar una condición para evitar builds innecesarios:
   ```
   git diff HEAD^ HEAD --quiet ./
   ```
   Esto solo construye si hay cambios en los archivos del proyecto.

### Paso 4: Verificar Branch Protection Rules

1. En **Settings** → **Git**, busca **"Branch Protection"** o **"Protected Branches"**
2. Asegúrate de que `main` esté marcado como **Production Branch**
3. Verifica que **NO** esté configurado para crear Preview deployments

### Paso 5: Verificar Deployment Settings

1. Ve a **Settings** → **Deployments**
2. En **"Preview Deployments"**, verifica que:
   - ✅ Están habilitados para branches que **NO** sean `main`
   - ❌ `main` **NO** debe estar en la lista de branches para Preview

### Paso 6: Verificar Webhooks

1. Ve a **Settings** → **Git** → **Connected Git Repository**
2. Verifica que el webhook esté configurado correctamente
3. Si es necesario, reconecta el repositorio para resetear la configuración

## 🔍 Verificación

Después de configurar:

1. Haz un push de prueba a `main`:
   ```bash
   git checkout main
   git commit --allow-empty -m "Test: Verificar que main solo va a Production"
   git push origin main
   ```

2. Ve a Vercel Dashboard → **Deployments**
3. Deberías ver:
   - ✅ **Un solo deployment** con badge **"Production"** (no "Preview")
   - ✅ Branch: `main`
   - ❌ **NO** debería haber un deployment con badge "Preview" para `main`

## 📝 Configuración Actual en `vercel.json`

El `vercel.json` actual es:

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

Esta configuración está **correcta** y permite que ambos branches se desplieguen. El problema está en la configuración del Dashboard de Vercel, que determina **a dónde** se despliega cada branch.

## ⚠️ Notas Importantes

1. **Production Branch**: En Vercel, solo **un branch** puede ser la "Production Branch". Este debe ser `main`.

2. **Preview Branches**: Todos los demás branches (incluyendo `develop`) se despliegan automáticamente a Preview, **excepto** el Production Branch.

3. **Si `main` se despliega a Preview**: Esto significa que la configuración en Vercel Dashboard no está correcta. El Production Branch debe estar configurado como `main`.

4. **Deploy Manual**: Si necesitas hacer deploy manual, usa:
   - `vercel --prod` para Production (desde `main`)
   - `vercel` para Preview (desde cualquier branch que no sea `main`)

## 🎯 Checklist de Verificación

- [ ] En Vercel Dashboard → Settings → Git, **Production Branch** = `main`
- [ ] **NO** hay configuraciones que permitan que `main` se despliegue a Preview
- [ ] Preview Deployments están habilitados solo para branches que **NO** sean `main`
- [ ] Hacer un push de prueba a `main` y verificar que **solo** se crea un deployment a Production
- [ ] Verificar que `develop` se despliega **solo** a Preview

---

**Última actualización**: Noviembre 2024

