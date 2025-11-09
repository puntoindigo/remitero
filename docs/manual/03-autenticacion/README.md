# 🔐 Autenticación

Todo sobre autenticación, OAuth y emails.

## 📋 Guías Disponibles

### [Google OAuth Setup](./google-oauth-setup.md)
Configuración completa de Google OAuth para desarrollo local y producción.

### [Error Email 535](./error-email-535.md)
Solución completa para el error de credenciales Gmail inválidas.

### [OAuth2 para Emails](./oauth2-email.md)
Guía paso a paso para configurar envío de emails usando OAuth2 (alternativa a contraseñas de aplicación).

### [FAQ OAuth2 Modo Prueba](./faq-oauth2-modo-prueba.md)
Preguntas frecuentes sobre el modo de prueba de OAuth2 y si funciona en producción.

---

## 🎯 Inicio Rápido

Si solo necesitas configurar OAuth rápidamente:
- [Inicio Rápido OAuth](../01-inicio-rapido/google-oauth.md)

---

## ⚠️ Problemas Comunes

### Error 535 - Credenciales inválidas
- Ver: [Error Email 535](./error-email-535.md)

### "redirect_uri_mismatch"
- Verifica que `NEXTAUTH_URL` sea correcto
- Verifica que las URIs estén en Google Cloud Console

### No puedo generar contraseña de aplicación
- Ver: [OAuth2 para Emails](./oauth2-email.md)

---

**Siguiente paso**: [Desarrollo](../04-desarrollo/README.md)

