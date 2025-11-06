# 🔍 Verificación del Error redirect_uri_mismatch

## ✅ Verificación rápida

### 1. Verifica que NEXTAUTH_URL esté correcto

Ejecuta esto en la terminal para ver qué valor tiene:

```bash
cd /Users/daeiman/Documents/remitero-nextjs
cat .env.local | grep NEXTAUTH_URL
```

**Debe mostrar:**
```
NEXTAUTH_URL="http://localhost:8000"
```

**NO debe tener:**
- ❌ Barra final: `http://localhost:8000/`
- ❌ Espacios: `http://localhost:8000 `
- ❌ Puerto diferente: `http://localhost:3000`

### 2. Verifica que la URI esté en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Haz clic en tu cliente OAuth "remitero"
3. Desplázate hasta "URIs de redireccionamiento autorizados"
4. **DEBE tener exactamente:**
   ```
   http://localhost:8000/api/auth/callback/google
   ```

### 3. Verifica la URI que NextAuth está enviando

Abre la consola del navegador (F12) y busca la URL de redirección en la petición a Google. Debería ser exactamente:
```
http://localhost:8000/api/auth/callback/google
```

## 🐛 Posibles problemas

### Problema 1: La URI no está en Google Cloud Console
**Solución:** Agrega `http://localhost:8000/api/auth/callback/google` en "URIs de redireccionamiento autorizados"

### Problema 2: NEXTAUTH_URL tiene espacios o barra final
**Solución:** Asegúrate de que sea exactamente `NEXTAUTH_URL="http://localhost:8000"` (sin espacios, sin barra final)

### Problema 3: NextAuth no está leyendo NEXTAUTH_URL
**Solución:** Reinicia el servidor completamente:
```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

### Problema 4: Google aún no actualizó las URIs
**Solución:** Espera 2-3 minutos después de guardar en Google Cloud Console

## 🔧 Debug avanzado

Para ver exactamente qué URI está enviando NextAuth, puedes agregar un log temporal en `src/lib/auth.ts`:

```typescript
// En el callback redirect, agrega:
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('Redirect URL:', url);
```

Esto te mostrará en los logs del servidor qué URI está usando.

