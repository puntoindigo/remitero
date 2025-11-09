# Solución: Error 535 - Credenciales de Gmail Inválidas

## 🔴 Error Actual

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
Code: EAUTH
Response Code: 535
```

Este error indica que las credenciales de Gmail (`EMAIL_USER` y `EMAIL_PASSWORD`) no son válidas o han sido revocadas.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar EMAIL_USER

1. Ve a Vercel → Settings → Environment Variables
2. Busca `EMAIL_USER`
3. Verifica que sea exactamente: `puntoindigo3@gmail.com` (sin espacios, sin mayúsculas innecesarias)
4. Si está mal, corrígelo y guarda

### Paso 2: Generar Nueva Contraseña de Aplicación

**IMPORTANTE**: `EMAIL_PASSWORD` DEBE ser una **contraseña de aplicación** de Gmail, NO la contraseña normal de la cuenta.

#### 2.1 Habilitar Verificación en 2 Pasos (si no está habilitada)

1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos"
3. Si no está habilitada, actívala (es obligatorio para contraseñas de aplicación)

#### 2.2 Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. Si no aparece directamente, busca "Contraseñas de aplicaciones" en la configuración de seguridad
3. Selecciona:
   - **Aplicación**: "Correo"
   - **Dispositivo**: "Otro (nombre personalizado)"
   - **Nombre**: "Sistema de Remitos"
4. Haz clic en "Generar"
5. **Copia la contraseña de 16 caracteres** (aparecerá como: `xxxx xxxx xxxx xxxx`)

**IMPORTANTE**: 
- Puedes copiarla con o sin espacios, ambos funcionan
- Esta contraseña solo se muestra UNA VEZ, guárdala inmediatamente
- Si la pierdes, tendrás que generar una nueva

### Paso 3: Actualizar en Vercel

1. Ve a Vercel → Settings → Environment Variables
2. Busca `EMAIL_PASSWORD`
3. **Elimina el valor actual** (si existe)
4. **Pega la nueva contraseña de aplicación** (los 16 caracteres)
5. Verifica que:
   - No tenga espacios al inicio o final
   - Tenga exactamente 16 caracteres (sin contar espacios si los copiaste con espacios)
   - No tenga saltos de línea
6. Guarda los cambios

### Paso 4: Verificar en Todos los Ambientes

Asegúrate de actualizar `EMAIL_USER` y `EMAIL_PASSWORD` en:
- ✅ **Development**
- ✅ **Preview** 
- ✅ **Production**

### Paso 5: Redesplegar

Después de cambiar las variables de entorno:

1. **NO necesitas hacer commit** (las variables están en Vercel)
2. Ve a Vercel → Deployments
3. Haz clic en "Redeploy" en el último deployment
4. O simplemente haz un push nuevo a `develop` para forzar un nuevo deploy

### Paso 6: Probar

1. Espera a que el deploy termine
2. Prueba el endpoint de test:
   ```
   POST https://remitero-dev.vercel.app/api/email/test
   ```
3. Verifica que recibes el email en `puntoindigo3@gmail.com`

---

## 🔍 Verificación de Configuración

Puedes verificar la configuración sin enviar email usando:

```
GET https://remitero-dev.vercel.app/api/email/test
```

Esto te mostrará:
- Si `EMAIL_USER` está configurado
- Si `EMAIL_PASSWORD` está configurado
- Longitud de cada variable (sin mostrar el valor)
- Preview del email (primeros 3 caracteres)

---

## ⚠️ Problemas Comunes

### Problema 1: "La opción de configuración que buscas no está disponible para tu cuenta"
**Este es el problema que estás experimentando**

**Causas posibles**:
1. La cuenta no tiene Verificación en 2 pasos habilitada
2. La cuenta es una cuenta de Google Workspace (empresarial) con restricciones
3. La cuenta tiene restricciones de seguridad activadas
4. La cuenta es muy nueva o tiene limitaciones

**Soluciones**:

#### Solución A: Habilitar Verificación en 2 Pasos (Recomendado)
1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos"
3. Si dice "Desactivada", haz clic y actívala
4. Sigue el proceso de configuración (puede requerir teléfono)
5. Una vez activada, espera 5-10 minutos
6. Intenta generar la contraseña de aplicación nuevamente

#### Solución B: Usar OAuth2 (Más Moderno y Mejor)
Si las contraseñas de aplicación no están disponibles, puedes usar OAuth2:

1. **Crear proyecto en Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/
   - Crea un nuevo proyecto o usa uno existente
   - Habilita "Gmail API"

2. **Crear credenciales OAuth2**:
   - Ve a: APIs & Services → Credentials
   - Crea "OAuth 2.0 Client ID"
   - Tipo: "Desktop app" o "Web application"
   - Descarga el archivo JSON de credenciales

3. **Configurar Nodemailer con OAuth2**:
   - Usa `nodemailer-google-oauth2` o configura OAuth2 manualmente
   - Requiere `refresh_token` en lugar de contraseña

**Nota**: Esta solución requiere cambios en el código. Si prefieres, puedo implementarla.

#### Solución C: Usar Otra Cuenta de Google
Si tienes otra cuenta de Google que SÍ permite contraseñas de aplicación:
1. Genera la contraseña desde esa cuenta
2. Usa esa cuenta como `EMAIL_USER` en Vercel
3. Actualiza `EMAIL_USER` y `EMAIL_PASSWORD` en Vercel

**IMPORTANTE**: Asegúrate de que esa cuenta tenga acceso para enviar emails en nombre del sistema.

#### Solución D: Usar Servicio de Email Alternativo
Si ninguna cuenta de Google funciona, considera:
- **SendGrid** (tier gratuito: 100 emails/día)
- **Resend** (tier gratuito: 3,000 emails/mes)
- **AWS SES** (muy económico)
- **Mailgun** (tier gratuito: 5,000 emails/mes)

### Problema 2: "No puedo ver contraseñas de aplicaciones"
**Solución**: 
- Asegúrate de tener Verificación en 2 pasos habilitada
- Ve directamente a: https://myaccount.google.com/apppasswords
- Si no aparece, busca "Contraseñas de aplicaciones" en la búsqueda de Google Account
- Si es cuenta de Google Workspace, puede requerir permisos del administrador

### Problema 2: "La contraseña tiene más/menos de 16 caracteres"
**Solución**:
- Las contraseñas de aplicación siempre tienen 16 caracteres
- Si copiaste con espacios, elimínalos antes de pegar en Vercel
- Verifica que no agregaste caracteres extra

### Problema 3: "Sigue dando error después de actualizar"
**Solución**:
1. Verifica que hiciste redeploy después de cambiar las variables
2. Espera 1-2 minutos después del deploy (puede tardar en propagarse)
3. Verifica que actualizaste en el ambiente correcto (Development/Preview/Production)
4. Genera una NUEVA contraseña de aplicación (la anterior puede estar revocada)

### Problema 4: "No recibo el email de prueba"
**Solución**:
1. Revisa la carpeta de Spam/Correo no deseado
2. Verifica que el email de destino sea correcto
3. Revisa los logs en Vercel para ver si hay otros errores
4. Prueba con otro email de destino

---

## 📋 Checklist de Verificación

Antes de reportar que sigue sin funcionar, verifica:

- [ ] `EMAIL_USER` es exactamente `puntoindigo3@gmail.com` (sin espacios)
- [ ] `EMAIL_PASSWORD` es una contraseña de aplicación de 16 caracteres
- [ ] Verificación en 2 pasos está habilitada en la cuenta de Google
- [ ] La contraseña de aplicación fue generada DESPUÉS de habilitar 2FA
- [ ] Las variables están actualizadas en TODOS los ambientes (Development, Preview, Production)
- [ ] Se hizo redeploy después de cambiar las variables
- [ ] Esperaste al menos 1-2 minutos después del deploy
- [ ] Probaste el endpoint de test: `POST /api/email/test`

---

## 🔄 Solución Alternativa: OAuth2

Si las contraseñas de aplicación no están disponibles para tu cuenta (`puntoindigo3@gmail.com`), puedes usar **OAuth2** que es más moderno y funciona con todas las cuentas de Google.

**Ver documentación completa**: [OAuth2 para Emails](./oauth2-email.md)

**Ventajas**:
- ✅ Funciona con cuentas que no permiten contraseñas de aplicación
- ✅ Más seguro
- ✅ Funciona con Google Workspace
- ✅ Tokens se renuevan automáticamente

**Si prefieres que lo implemente**: Solo necesito que me proporciones:
1. Client ID y Client Secret (de Google Cloud Console)
2. Refresh Token (obtenido del flujo OAuth2)

---

## 🔄 Si Nada Funciona

Si después de seguir todos los pasos sigue sin funcionar:

1. **Usa OAuth2** (ver documentación arriba)
2. **Usa otra cuenta de Google** que sí permita contraseñas de aplicación
3. **Considera usar un servicio alternativo**:
   - SendGrid (tiene tier gratuito: 100 emails/día)
   - Resend (tier gratuito: 3,000 emails/mes)
   - AWS SES (muy económico)
   - Mailgun (tier gratuito: 5,000 emails/mes)

---

## 📞 Información de Soporte

- **Error Code**: `535`
- **Error Type**: `EAUTH` (Authentication Error)
- **Google Support**: https://support.google.com/mail/?p=BadCredentials
- **Documentación Nodemailer**: https://nodemailer.com/about/

---

**Última actualización**: Noviembre 2024

