# 🔧 Configurar: Main → Production, Develop → Preview

## 🚨 Problema Actual

El branch `main` está deployando a **Preview** cuando debería ir a **Production**.
- ❌ `main` → Preview (INCORRECTO)
- ✅ `main` → Production (CORRECTO)
- ✅ `develop` → Preview (CORRECTO)

## ✅ Solución: Configurar en Vercel Dashboard

### Paso 1: Ir a Settings → General

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **General**

### Paso 2: Configurar Production Branch

1. En la sección **"Production Branch"**, busca el campo que dice **"Production Branch"**
2. **IMPORTANTE**: Debe estar configurado como `main`
3. Si está en otro branch o vacío:
   - Selecciona `main` del dropdown
   - Guarda los cambios

### Paso 3: Verificar Preview Deployments

1. Ve a **Settings** → **Git**
2. En la sección **"Preview Deployments"**:
   - ✅ Debe estar **habilitado** (ON)
   - Esto permite que branches que NO sean `main` se desplieguen a Preview

### Paso 4: Verificar Deployment Settings

1. Ve a **Deployments** en el menú lateral
2. Verifica los últimos deployments:
   - Los deployments de `main` deben tener badge **"Production"** (verde)
   - Los deployments de `develop` deben tener badge **"Preview"** (azul)

## 🔍 Verificación

### Test 1: Verificar que `main` va a Production

1. Ve a **Deployments** en Vercel Dashboard
2. Busca el último deployment de `main` (commit `079c4af`)
3. Debe mostrar:
   - ✅ Badge: **"Production"** (verde)
   - ✅ Branch: `main`
   - ❌ NO debe mostrar badge "Preview"

### Test 2: Verificar que `develop` va a Preview

1. Ve a **Deployments** en Vercel Dashboard
2. Busca el último deployment de `develop` (commit `27e12e6`)
3. Debe mostrar:
   - ✅ Badge: **"Preview"** (azul)
   - ✅ Branch: `develop`
   - ❌ NO debe mostrar badge "Production"

## 🚨 Si `main` sigue yendo a Preview

Si después de configurar, `main` sigue yendo a Preview:

1. **Reconecta el repositorio**:
   - Ve a **Settings** → **Git** → **Connected Git Repository**
   - Haz clic en **"Disconnect"**
   - Luego **"Connect Git Repository"** nuevamente
   - Selecciona el mismo repositorio

2. **Verifica que Production Branch = `main`**:
   - Ve a **Settings** → **General**
   - Confirma que **Production Branch** = `main`

3. **Haz un deploy manual a Production**:
   ```bash
   git checkout main
   vercel --prod
   ```

## 📝 Configuración Esperada

### En Vercel Dashboard:

- **Settings → General → Production Branch**: `main`
- **Settings → Git → Preview Deployments**: Habilitado (ON)

### Comportamiento Esperado:

- ✅ Push a `main` → Deploy automático a **Production**
- ✅ Push a `develop` → Deploy automático a **Preview**
- ✅ Push a cualquier otro branch → Deploy automático a **Preview**

## 🎯 Checklist Final

- [ ] En Vercel Dashboard → Settings → General, **Production Branch** = `main`
- [ ] En Vercel Dashboard → Settings → Git, **Preview Deployments** = Habilitado
- [ ] Último deployment de `main` muestra badge **"Production"** (verde)
- [ ] Último deployment de `develop` muestra badge **"Preview"** (azul)
- [ ] NO hay deployments de `main` con badge "Preview"

---

**Última actualización**: Diciembre 2024

