# 🧪 Pruebas en Consola - Envío de Email

## 1. Verificar Configuración Actual

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar configuración
fetch('/api/email/test')
  .then(r => r.json())
  .then(data => {
    console.log('📋 Configuración:', data);
    console.log('✅ Método:', data.method);
    console.log('✅ Listo:', data.ready);
  })
  .catch(console.error);
```

Esto te mostrará:
- Si tienes OAuth2 configurado
- Si tienes contraseña de aplicación configurada
- Qué método se usará

---

## 2. Probar Envío de Email

```javascript
// Probar envío de email
fetch('/api/email/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Email enviado:', data.message);
    } else {
      console.error('❌ Error:', data.error);
      console.error('📝 Detalles:', data.details);
    }
  })
  .catch(error => {
    console.error('❌ Error de red:', error);
  });
```

---

## 3. Ver Logs del Servidor

Si estás en localhost, revisa la terminal donde corre `npm run dev`.

Si estás en Vercel, ve a:
- Vercel Dashboard → Tu proyecto → Logs
- Filtra por "Email" o "Resend Invitation"

---

## 4. Diagnóstico Rápido

Ejecuta esto para ver qué está fallando:

```javascript
// Diagnóstico completo
Promise.all([
  fetch('/api/email/test').then(r => r.json()),
  fetch('/api/users/6a8ed0c0-ebc3-43eb-956d-5ae685f2138d/resend-invitation', {
    method: 'POST'
  }).then(r => r.json()).catch(e => ({ error: e.message }))
])
  .then(([config, test]) => {
    console.log('📋 Configuración:', config);
    console.log('📧 Test de envío:', test);
  });
```

---

## Errores Comunes

### Error: "No se pudo obtener access token"
**Causa**: Refresh token inválido o expirado  
**Solución**: Obtén un nuevo refresh token desde OAuth Playground

### Error: "Variables de entorno no configuradas"
**Causa**: Faltan variables en Vercel  
**Solución**: Agrega las variables OAuth2 en Vercel

### Error: "EAUTH" o "535"
**Causa**: Credenciales incorrectas  
**Solución**: Verifica que el Client ID, Secret y Refresh Token sean correctos

