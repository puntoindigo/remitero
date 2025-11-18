# 🔧 Configurar Git en Vercel (Instrucciones Actualizadas)

## 📋 Configuración Actual de Vercel

Basado en la interfaz actual de Vercel Dashboard (Settings → Git).

## ✅ Pasos para Configurar

### Paso 1: Ir a Settings → Git

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`v0-remitero`)
3. Ve a **Settings** → **Git**

### Paso 2: Verificar Connected Git Repository

En la sección **"Connected Git Repository"**:

1. Verifica que el repositorio esté conectado: `puntoindigo/remitero`
2. Si no está conectado:
   - Haz clic en **"Connect Git Repository"**
   - Selecciona tu repositorio
   - Autoriza los permisos necesarios

### Paso 3: Configurar Production Branch

**IMPORTANTE**: En la interfaz actual de Vercel, la configuración de Production Branch está en:

1. Ve a **Settings** → **General** (no en Git)
2. Busca la sección **"Production Branch"**
3. Asegúrate de que esté configurado como `main`
4. Si no está configurado o está en otro branch, cámbialo a `main`

**Nota**: Si no encuentras esta opción en General, puede estar en:
- **Settings** → **Git** → **Production Branch** (si está disponible)
- O puede estar en la configuración del proyecto en la página principal

### Paso 4: Configurar Ignored Build Step (Opcional)

En **Settings** → **Git** → **"Ignored Build Step"**:

1. El comportamiento debe estar en **"Automatic"** (por defecto)
2. Si quieres personalizar, puedes agregar un comando que retorne código 1 (nuevo Build) o 0 (no Build)

### Paso 5: Verificar Deploy Hooks (Opcional)

En **Settings** → **Git** → **"Deploy Hooks"**:

- Si no tienes deploy hooks configurados, está bien
- Los deploys automáticos funcionan sin hooks cuando el repositorio está conectado

## 🔍 Verificación

### Verificar que `main` va solo a Production

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

### Verificar que `develop` va solo a Preview

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

## 🚨 Si `develop` se despliega a Production

Si después de configurar, `develop` sigue yendo a Production:

1. **Verifica Production Branch**: Asegúrate de que esté configurado como `main` (no `develop`)
2. **Reconecta el repositorio**: 
   - Ve a **Settings** → **Git** → **Connected Git Repository**
   - Haz clic en **"Disconnect"** (si está disponible)
   - Luego **"Connect Git Repository"** nuevamente
3. **Verifica Branch Protection**: Si hay opciones de Branch Protection, asegúrate de que `main` esté marcado como Production

## 📝 Notas Importantes

1. **Production Branch**: Solo **un branch** puede ser la "Production Branch". Este debe ser `main`.

2. **Preview Branches**: Todos los demás branches (incluyendo `develop`) se despliegan automáticamente a Preview, **excepto** el Production Branch.

3. **Deploy Manual**: Si necesitas hacer deploy manual:
   - `vercel --prod` para Production (solo desde `main`)
   - `vercel` para Preview (desde cualquier branch que no sea `main`)

## 🎯 Checklist de Verificación

- [ ] En Vercel Dashboard → Settings → General, **Production Branch** = `main`
- [ ] **NO** hay configuraciones que permitan que `develop` se despliegue a Production
- [ ] Preview Deployments están habilitados automáticamente para branches que **NO** sean `main`
- [ ] Hacer un push de prueba a `main` y verificar que **solo** se crea un deployment a Production
- [ ] Hacer un push de prueba a `develop` y verificar que **solo** se crea un deployment a Preview

---

**Última actualización**: Noviembre 2024  
**Basado en**: Interfaz actual de Vercel Dashboard

