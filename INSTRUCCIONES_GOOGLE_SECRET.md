# 🔐 Cómo obtener GOOGLE_CLIENT_SECRET

## ⚠️ Situación Actual

Google **ya no permite ver secretos existentes** por seguridad. Si ves `****mgTl` en la consola, ese es el secreto enmascarado y **no puedes verlo completo**.

## ✅ Solución: Crear un Nuevo Secreto

### Paso 1: Ir a Google Cloud Console
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Selecciona tu proyecto "remitero"
3. Haz clic en tu cliente OAuth "remitero"

### Paso 2: Crear Nuevo Secreto
1. En la **columna derecha**, busca la sección **"Secretos del cliente"**
2. Haz clic en el botón **"+ Add secret"** (Agregar secreto)
3. Google te mostrará el nuevo secreto completo **UNA SOLA VEZ**
4. ⚠️ **COPIA EL VALOR INMEDIATAMENTE** - Empieza con `GOCSPX-`
5. Guárdalo de forma segura (gestor de contraseñas, notas seguras, etc.)

### Paso 3: Agregar en Vercel
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - **Key**: `GOOGLE_CLIENT_SECRET`
   - **Value**: El secreto que copiaste (empieza con `GOCSPX-`)
   - **Environment**: Selecciona **Development**, **Preview** y **Production**
4. Haz clic en **"Save"**

### Paso 4: Redeploy en Vercel
1. Después de guardar las variables, Vercel te ofrecerá hacer un redeploy
2. O ve a la pestaña **"Deployments"**
3. Haz clic en los **3 puntos** del último deployment
4. Selecciona **"Redeploy"**
5. ⚠️ **NO necesitas hacer commit** - Solo redeploy

## ✅ Verificación

Después del redeploy, prueba el login con Gmail:
- Ve a: https://remitero-dev.vercel.app/auth/login
- Haz clic en "Acceder con Gmail"
- Debería funcionar correctamente

## 📝 Notas

- El secreto antiguo (`****mgTl`) seguirá funcionando hasta que lo deshabilites
- Puedes tener múltiples secretos activos al mismo tiempo
- Si quieres deshabilitar el secreto antiguo, puedes hacerlo desde la misma página

