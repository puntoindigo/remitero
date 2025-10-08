# Configuración de Google Auth

## 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ (o Google Identity)
4. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente OAuth 2.0"
5. Configura la pantalla de consentimiento OAuth
6. Agrega los siguientes URIs autorizados:
   - **URI de redirección autorizada**: `https://remitero-dev.vercel.app/api/auth/callback/google`
   - **URI de redirección autorizada (desarrollo)**: `http://localhost:3000/api/auth/callback/google`

## 2. Variables de entorno

Agrega estas variables a tu archivo `.env.local` y a Vercel:

```env
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
```

## 3. Ejecutar SQL para crear SUPERADMIN

Ejecuta el archivo `scripts/make-daeiman-superadmin.sql` en Supabase SQL Editor.

## 4. Probar la integración

1. Ve a `/auth/login`
2. Deberías ver un botón "Sign in with Google"
3. Haz clic y autentícate con tu Gmail
4. Deberías entrar como SUPERADMIN

## 5. Verificar permisos

Una vez logueado, deberías poder:
- Ver la sección "Usuarios" en el menú
- Ver la sección "Empresas" en el menú
- Impersonar otros usuarios
- Gestionar todos los datos del sistema

## Notas importantes

- Solo los usuarios que existan en la tabla `users` pueden hacer login con Google
- El rol se toma de la base de datos, no de Google
- Si un usuario no existe en la base de datos, el login será rechazado
- La contraseña no es necesaria para usuarios de Google
