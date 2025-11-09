# 🔧 Troubleshooting

Solución de problemas comunes y errores.

## 📋 Guías Disponibles

### [Error Email 535](./error-email-535.md)
Solución completa para el error de credenciales Gmail inválidas (535-5.7.8).

**También disponible en**: [Autenticación - Error Email 535](../03-autenticacion/error-email-535.md)

### [Error Remitos](./error-remitos.md)
Diagnóstico y solución de errores específicos en el módulo de remitos.

### [Error Handling](./error-handling.md)
Corrección de errores generales y mejoras en el manejo de errores.

---

## 🔍 Búsqueda Rápida por Error

### Error 535 - Credenciales Gmail
- **Solución**: [Error Email 535](./error-email-535.md)
- **Alternativa**: [OAuth2 para Emails](../03-autenticacion/oauth2-email.md)

### Error "redirect_uri_mismatch"
- Verifica `NEXTAUTH_URL` en variables de entorno
- Verifica URIs en Google Cloud Console
- Ver: [Configuración Localhost](../02-configuracion/localhost.md)

### Error "Invalid client"
- Verifica `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- Ver: [Google OAuth Setup](../03-autenticacion/google-oauth-setup.md)

### Error en Remitos
- Ver: [Error Remitos](./error-remitos.md)

---

## 📞 Información de Soporte

Si no encuentras la solución aquí:
1. Revisa los logs en Vercel
2. Consulta [AGENTS.md](../../AGENTS.md) si eres un agente IA
3. Revisa los commits recientes en Git

---

**Siguiente paso**: [Referencia Técnica](../07-referencia-tecnica/README.md)

