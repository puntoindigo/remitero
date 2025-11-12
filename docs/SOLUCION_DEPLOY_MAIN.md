# 🔧 Solución: Deploy Manual a Producción (main)

## 📋 Problema

El push a `main` se hizo correctamente, pero Vercel no desplegó automáticamente a producción.

## ✅ Verificación

El commit está en `main`:
```
3ab01e1 Merge develop into main: Separación Dev/Prod con schemas PostgreSQL
```

## 🚀 Soluciones

### Opción 1: Deploy Manual desde Vercel Dashboard (Recomendado)

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña **Deployments**
4. Busca el deployment más reciente de `main` (o el commit `3ab01e1`)
5. Si no existe, haz clic en **"Redeploy"** o **"Deploy"**
6. Selecciona el branch `main` y el commit `3ab01e1`
7. Haz clic en **"Deploy"**

### Opción 2: Deploy Manual desde CLI

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login en Vercel
vercel login

# Deploy a producción desde main
vercel --prod
```

### Opción 3: Forzar Deploy con Empty Commit

```bash
# Crear un commit vacío para forzar el deploy
git commit --allow-empty -m "chore: trigger production deployment"

# Push a main
git push origin main
```

### Opción 4: Verificar Configuración de Vercel

1. Ve a Vercel Dashboard → Tu Proyecto → **Settings** → **Git**
2. Verifica que:
   - El repositorio está conectado correctamente
   - El branch `main` está habilitado para Production
   - Los webhooks de GitHub están funcionando

## 🔍 Verificar que el Deploy Funcionó

1. Ve a Vercel Dashboard → **Deployments**
2. Busca el deployment más reciente de `main`
3. Verifica que el commit es `3ab01e1`
4. Verifica que el status es "Ready" o "Building"
5. Una vez completado, accede a la URL de producción

## ⚠️ Importante

Después del deploy, **verifica que producción usa schema `public`**:

1. Accede a la URL de producción
2. Inicia sesión
3. Crea un registro de prueba
4. Verifica en Supabase que aparece en `public`, NO en `dev`:
   ```sql
   SELECT * FROM public.clients ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM dev.clients WHERE name = 'Tu Cliente de Prueba';
   -- Debería estar vacío
   ```

## 📝 Nota sobre Auto-Deploy

Si Vercel no está desplegando automáticamente desde `main`, puede ser porque:

1. **Webhook de GitHub no está configurado**: Vercel necesita recibir notificaciones de GitHub cuando hay push a `main`
2. **Branch no está habilitado**: Verifica en Settings → Git que `main` está habilitado para Production
3. **Problema temporal**: A veces Vercel tiene delays, espera unos minutos

---

**Recomendación**: Usa la **Opción 1** (Deploy Manual desde Dashboard) que es la más rápida y confiable.

