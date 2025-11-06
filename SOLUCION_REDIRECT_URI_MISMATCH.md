# ✅ SOLUCIÓN DEFINITIVA: redirect_uri_mismatch

## ✅ Estado actual - VERIFICADO

Tu `.env.local` está correctamente configurado:
- ✅ `NEXTAUTH_URL="http://localhost:8000"` (correcto, sin barra final)
- ✅ `GOOGLE_CLIENT_ID` (correcto)
- ✅ `GOOGLE_CLIENT_SECRET` (correcto)

## ❌ PROBLEMA: Falta la URI en Google Cloud Console

El error `redirect_uri_mismatch` significa que **la URI que NextAuth está enviando a Google NO está en la lista de URIs autorizadas**.

## 🔧 SOLUCIÓN: Agregar URI en Google Cloud Console

### Paso 1: Ir a Google Cloud Console

1. Abre: https://console.cloud.google.com/apis/credentials
2. Busca tu cliente OAuth llamado **"remitero"**
3. **Haz clic en el nombre** para editarlo

### Paso 2: Agregar URI de redireccionamiento

**En la sección "URIs de redireccionamiento autorizados":**

1. Haz clic en **"+ Agregar URI"** (botón que está al lado de la lista)
2. En el campo de texto que aparece, escribe EXACTAMENTE:
   ```
   http://localhost:8000/api/auth/callback/google
   ```
   - **Sin espacios**
   - **Sin barra final**
   - **Con el protocolo `http://` (no `https://`)**
   - **Con el puerto `:8000`**

### Paso 3: Agregar origen autorizado

**En la sección "Orígenes autorizados de JavaScript":**

1. Haz clic en **"+ Agregar URI"**
2. Escribe EXACTAMENTE:
   ```
   http://localhost:8000
   ```
   - **Sin barra final**
   - **Sin espacios**

### Paso 4: Guardar

1. **Desplázate hasta el final de la página**
2. Haz clic en **"Guardar"** (botón azul en la parte inferior)
3. **Espera 2-3 minutos** para que Google actualice las URIs

### Paso 5: Reiniciar servidor

```bash
# En la terminal donde está corriendo npm run dev
# Presiona Ctrl+C para detenerlo
# Luego reinicia:
npm run dev
```

### Paso 6: Probar

1. Abre `http://localhost:8000/auth/login`
2. Haz clic en "Continuar con Google"
3. **Debería funcionar** sin el error `redirect_uri_mismatch`

## 🔍 Verificación visual

Cuando veas la página de edición de tu cliente OAuth en Google Cloud Console, deberías ver algo así:

**URIs de redireccionamiento autorizados:**
```
https://remitero-dev.vercel.app/api/auth/callback/google
https://v0-remitero.vercel.app/api/auth/callback/google
http://localhost:8000/api/auth/callback/google  ← ESTA ES LA QUE FALTA
```

**Orígenes autorizados de JavaScript:**
```
https://remitero-dev.vercel.app
https://v0-remitero.vercel.app
http://localhost:8000  ← ESTA ES LA QUE FALTA
```

## ⚠️ Errores comunes

### Error: "La URI ya existe"
- **Solución:** Verifica que no la hayas agregado dos veces. Si ya existe, no necesitas agregarla de nuevo.

### Error: Persiste después de agregar
- **Solución:** Espera 2-3 minutos. Google puede tardar en actualizar las URIs.

### Error: "Formato inválido"
- **Solución:** Asegúrate de que:
  - No tenga espacios al inicio o final
  - Use `http://` (no `https://`) para localhost
  - Tenga el puerto correcto (`:8000`)

## 📸 Cómo se ve en Google Cloud Console

Cuando agregues la URI, deberías verla en la lista así:

```
http://localhost:8000/api/auth/callback/google
```

Si no la ves, significa que no se guardó correctamente. Intenta de nuevo.

