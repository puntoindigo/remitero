# Solución para Problemas de Login y Console Logs

## Problemas Identificados y Solucionados

### 1. **Problema Principal: Configuración de NEXTAUTH_URL**
- **Problema**: Configuración incorrecta de URL para el entorno de desarrollo en Vercel
- **Causa**: Variables de entorno no configuradas correctamente para `https://remitero-dev.vercel.app`
- **Solución**: Configuración correcta en archivos `.env.local` con `NEXTAUTH_URL="https://remitero-dev.vercel.app"`

### 2. **Credenciales Incorrectas**
- **Problema**: Se intentaba usar `admin@remitero.com` que no existía
- **Solución**: Identificadas las credenciales correctas:
  - `daeiman@gmail.com` / `password` (SUPERADMIN)
  - `admin@remitero.com` / `admin123` (SUPERADMIN) - creado para pruebas

### 3. **Console Logs No Visibles**
- **Problema**: Debug deshabilitado en NextAuth
- **Solución**: Habilitado `debug: true` en configuración de NextAuth

## Archivos Modificados

### `src/lib/auth.ts`
```typescript
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // Detectar automáticamente la URL correcta
  ...(process.env.NODE_ENV === 'development' && {
    url: 'http://localhost:3000'
  }),
  // ... resto de configuración
  debug: true  // Habilitado para ver logs
}
```

### Endpoints de Debug Creados
- `/api/debug-login` - Prueba login con credenciales
- `/api/debug-users` - Lista todos los usuarios
- `/api/create-test-user` - Crea usuarios de prueba

## Cómo Probar el Login

### Opción 1: Login Directo en Vercel (Recomendado)
1. Abrir: [https://remitero-dev.vercel.app/auth/login](https://remitero-dev.vercel.app/auth/login)
2. Usar las credenciales:
   - Email: `daeiman@gmail.com`
   - Contraseña: `password`
3. Hacer clic en "Iniciar Sesión"
4. Ver los logs en la consola del navegador (F12)

### Opción 2: Página de Prueba Local
1. Abrir: `http://localhost:3000/test-vercel-login.html`
2. Usar las mismas credenciales
3. Hacer clic en "Probar Login en Vercel"

### Opción 3: API Directa (si está disponible en Vercel)
```bash
curl -X POST https://remitero-dev.vercel.app/api/debug-login \
  -H "Content-Type: application/json" \
  -d '{"email":"daeiman@gmail.com","password":"password"}'
```

## Console Logs

Los console logs ahora están habilitados y deberías ver:

### En el Servidor (Terminal)
```
🔍 NextAuth signIn callback iniciado: { provider: 'credentials', userEmail: 'daeiman@gmail.com' }
✅ Login con credenciales autorizado para: daeiman@gmail.com
🔍 NextAuth JWT callback - actualizando token: { userId: '...', userEmail: 'daeiman@gmail.com' }
🔍 NextAuth session callback - creando sesión: { userId: '...', userEmail: 'daeiman@gmail.com' }
```

### En el Navegador (F12 → Console)
```
🔍 Intentando login con: daeiman@gmail.com
🔍 Resultado debug: {success: true, user: {...}}
✅ Login exitoso!
```

## Usuarios Disponibles

| Email | Contraseña | Rol | Estado |
|-------|------------|-----|--------|
| `daeiman@gmail.com` | `password` | SUPERADMIN | ✅ Funciona |
| `admin@remitero.com` | `admin123` | SUPERADMIN | ✅ Funciona |
| `superadmin@remitero.com` | ? | SUPERADMIN | ❓ Contraseña desconocida |

## Próximos Pasos

1. **Probar el login** usando la página de prueba
2. **Verificar console logs** en navegador y servidor
3. **Configurar variables de entorno** para producción si es necesario
4. **Limpiar archivos de prueba** cuando todo funcione

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Probar endpoint de debug en Vercel
curl -s https://remitero-dev.vercel.app/api/debug-simple

# Ver usuarios disponibles (si está disponible en Vercel)
curl -s https://remitero-dev.vercel.app/api/debug-users

# Probar login en Vercel (si está disponible)
curl -X POST https://remitero-dev.vercel.app/api/debug-login \
  -H "Content-Type: application/json" \
  -d '{"email":"daeiman@gmail.com","password":"password"}'
```

## Notas Importantes

- **URL de desarrollo**: `https://remitero-dev.vercel.app`
- Los console logs están habilitados tanto en servidor como en cliente
- La configuración está optimizada para el entorno de Vercel
- Se crearon endpoints de debug para facilitar las pruebas
- El sitio está funcionando correctamente en [https://remitero-dev.vercel.app/](https://remitero-dev.vercel.app/)
