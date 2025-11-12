# 🔧 Solución: Cliente OAuth Deshabilitado

## ⚠️ Error
```
The OAuth client was disabled.
```

Este error significa que el cliente OAuth en Google Cloud Console está **deshabilitado**.

## ✅ Solución: Habilitar el Cliente OAuth

### Paso 1: Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Asegúrate de estar en el proyecto correcto

### Paso 2: Encontrar y Habilitar el Cliente

1. Busca el cliente OAuth con ID: `442455029183-52a0dpfgs10d0a0nv3i00snep247tdrc.apps.googleusercontent.com`
2. Haz clic en el nombre del cliente para editarlo
3. En la parte superior, verás un toggle o botón que dice **"Estado"** o **"Enabled/Disabled"**
4. **Habilita el cliente** cambiando el toggle a "Enabled" o haciendo clic en "Enable"
5. Haz clic en **"Guardar"** al final de la página

### Paso 3: Verificar URIs de Redirección

Mientras estás en la configuración del cliente, verifica que tengas estas URIs configuradas:

**URIs de redireccionamiento autorizados:**
```
http://localhost:8000/api/auth/callback/google
https://remitero-dev.vercel.app/api/auth/callback/google
```

**Orígenes autorizados de JavaScript:**
```
http://localhost:8000
https://remitero-dev.vercel.app
```

### Paso 4: Reiniciar el Servidor

Después de habilitar el cliente:

```bash
# Detén el servidor (Ctrl+C)
# Reinícialo
npm run dev
```

### Paso 5: Probar

1. Ve a `http://localhost:8000/auth/login`
2. Haz clic en "Continuar con Google"
3. Debería funcionar ahora

---

## 🔄 Alternativa: Usar Otro Cliente OAuth

Si no puedes habilitar este cliente o prefieres usar otro, puedes:

1. **Crear un nuevo cliente OAuth** en Google Cloud Console
2. **Actualizar `.env.local`** con el nuevo `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
3. **Agregar las URIs de redirección** al nuevo cliente

### Cliente Alternativo Disponible

Hay referencias a otro cliente OAuth con ID:
```
117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com
```

Si este cliente está habilitado, puedes usarlo actualizando `.env.local`:

```bash
GOOGLE_CLIENT_ID="117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[el secret correspondiente]"
```

---

## ⚠️ Notas Importantes

- Los cambios en Google Cloud Console pueden tardar **1-2 minutos** en propagarse
- Asegúrate de que el cliente OAuth esté en el **mismo proyecto** que el resto de tus servicios
- Si el cliente fue deshabilitado por seguridad, verifica que no haya problemas de seguridad antes de habilitarlo

