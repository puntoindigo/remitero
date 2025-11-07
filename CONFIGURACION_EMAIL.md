# 📧 Configuración de Email para Invitaciones

## Variables de Entorno Requeridas

Para que el sistema pueda enviar emails de invitación a nuevos usuarios, necesitas configurar las siguientes variables de entorno:

### Variables Necesarias

1. **`EMAIL_USER`**: La dirección de email de Gmail desde donde se enviarán los emails
   - Ejemplo: `remitero.invitaciones@gmail.com`

2. **`EMAIL_PASSWORD`**: La contraseña de aplicación de Gmail (no la contraseña normal de la cuenta)
   - Ver instrucciones abajo para obtenerla

## 🔐 Cómo Obtener la Contraseña de Aplicación de Gmail

### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Navega a **Seguridad** → **Verificación en 2 pasos**
3. Activa la verificación en 2 pasos si no está activada

### Paso 2: Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. O navega a: **Seguridad** → **Contraseñas de aplicaciones**
3. Selecciona la aplicación: **Correo**
4. Selecciona el dispositivo: **Otro (nombre personalizado)**
5. Escribe un nombre como: "Sistema de Remitos"
6. Haz clic en **Generar**
7. **Copia la contraseña de 16 caracteres** que aparece (se muestra solo una vez)

### Paso 3: Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Navega a **Settings** → **Environment Variables**
3. Agrega las siguientes variables para cada entorno (Development, Preview, Production):

```
EMAIL_USER=remitero.invitaciones@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Importante**: La contraseña de aplicación tiene espacios, pero puedes copiarla con o sin espacios (ambas funcionan).

## 📝 Configuración Local (.env.local)

Para desarrollo local, agrega estas variables a tu archivo `.env.local`:

```env
EMAIL_USER=remitero.invitaciones@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
NEXTAUTH_URL=http://localhost:8000
```

## ✅ Verificación

Una vez configurado, cuando crees un nuevo usuario:

1. El sistema intentará enviar un email de invitación automáticamente
2. Si hay un error, se registrará en los logs pero **no fallará la creación del usuario**
3. Revisa los logs del servidor para ver si el email se envió correctamente:
   - ✅ `[Email] Email de invitación enviado`
   - ❌ `[Email] Error al enviar email de invitación`

## 🔍 Troubleshooting

### Error: "Invalid login"
- Verifica que `EMAIL_USER` sea correcto
- Verifica que `EMAIL_PASSWORD` sea la contraseña de aplicación (no la contraseña normal)

### Error: "Less secure app access"
- Gmail ya no permite "aplicaciones menos seguras"
- Debes usar **Contraseñas de Aplicación** (ver Paso 2 arriba)

### El email no llega
- Verifica la carpeta de spam
- Verifica que el email de destino sea válido
- Revisa los logs del servidor para ver errores específicos

## 📧 Contenido del Email

El email de invitación incluye:
- Saludo personalizado con el nombre del usuario
- Información de acceso (email y rol)
- Instrucciones para iniciar sesión
- Botón para acceder al sistema
- Link directo al login

