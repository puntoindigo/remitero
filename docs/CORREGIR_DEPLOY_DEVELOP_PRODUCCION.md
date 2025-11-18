# 🔧 Corregir: Develop Deployando en Producción

## 🚨 Problema

El branch `develop` está deployando en producción cuando debería ir solo a Preview.

## ✅ Solución: Configurar en Vercel Dashboard

### Paso 1: Ir a Settings → Git

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`v0-remitero`)
3. Ve a **Settings** → **Git**

### Paso 2: Configurar Production Branch

1. En la sección **"Production Branch"**, asegúrate de que esté configurado como `main`
2. **IMPORTANTE**: Verifica que **NO** haya configuraciones que permitan que `develop` se despliegue a Production

### Paso 3: Verificar Branch Protection

1. En **Settings** → **Git**, busca **"Branch Protection"** o **"Protected Branches"**
2. Asegúrate de que:
   - ✅ `main` esté marcado como **Production Branch**
   - ❌ `develop` **NO** esté marcado como Production Branch
   - ✅ `develop` solo debe crear **Preview deployments**

### Paso 4: Verificar Deployment Settings

1. Ve a **Settings** → **Deployments**
2. En **"Preview Deployments"**, verifica que:
   - ✅ Están habilitados para branches que **NO** sean `main`
   - ✅ `develop` debe crear **Preview deployments** (no Production)
   - ❌ `main` **NO** debe crear Preview deployments

### Paso 5: Verificar Webhooks

1. Ve a **Settings** → **Git** → **Connected Git Repository**
2. Verifica que el webhook esté configurado correctamente
3. Si es necesario, reconecta el repositorio para resetear la configuración

## 🔍 Verificación

Después de configurar:

1. Haz un push de prueba a `develop`:
   ```bash
   git checkout develop
   git commit --allow-empty -m "Test: Verificar que develop solo va a Preview"
   git push origin develop
   ```

2. Ve a Vercel Dashboard → **Deployments**
3. Deberías ver:
   - ✅ **Un solo deployment** con badge **"Preview"** (no "Production")
   - ✅ Branch: `develop`
   - ❌ **NO** debería haber un deployment con badge "Production" para `develop`

## 📝 Notas Importantes

1. **Production Branch**: En Vercel, solo **un branch** puede ser la "Production Branch". Este debe ser `main`.

2. **Preview Branches**: Todos los demás branches (incluyendo `develop`) se despliegan automáticamente a Preview, **excepto** el Production Branch.

3. **Si `develop` se despliega a Production**: Esto significa que la configuración en Vercel Dashboard no está correcta. El Production Branch debe estar configurado como `main` y `develop` debe estar excluido de Production.

4. **Deploy Manual**: Si necesitas hacer deploy manual, usa:
   - `vercel --prod` para Production (solo desde `main`)
   - `vercel` para Preview (desde cualquier branch que no sea `main`)

## 🎯 Checklist de Verificación

- [ ] En Vercel Dashboard → Settings → Git, **Production Branch** = `main`
- [ ] **NO** hay configuraciones que permitan que `develop` se despliegue a Production
- [ ] Preview Deployments están habilitados solo para branches que **NO** sean `main`
- [ ] Hacer un push de prueba a `develop` y verificar que **solo** se crea un deployment a Preview
- [ ] Verificar que `main` se despliega **solo** a Production

---

**Última actualización**: Noviembre 2024

