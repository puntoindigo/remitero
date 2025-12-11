# 🧪 Cómo Probar un Deployment en "Production: Staged"

Cuando un deployment está en estado **"Production: Staged"** en Vercel, significa que está listo para producción pero aún no está activo. Puedes probarlo sin promoverlo usando su URL única.

## 📍 Método 1: Usar la URL del Deployment (Recomendado)

Cada deployment en Vercel tiene su propia URL única que puedes usar para probarlo:

1. **Ve a Vercel Dashboard:**
   - Abre https://vercel.com/dashboard
   - Selecciona tu proyecto
   - Ve a la pestaña **"Deployments"**

2. **Encuentra el deployment "Staged":**
   - Busca el deployment que dice **"Production: Staged"**
   - Haz click en el deployment para ver sus detalles

3. **Copia la URL del deployment:**
   - En la página de detalles del deployment, verás una URL única
   - Típicamente tiene el formato: `https://[tu-proyecto]-[hash].vercel.app`
   - O puedes verla en el badge/etiqueta del deployment en la lista

4. **Abre la URL en tu navegador:**
   - Copia y pega la URL en tu navegador
   - Esta URL te mostrará exactamente cómo se verá el deployment cuando se promueva a producción
   - **No afecta** el dominio de producción hasta que lo promuevas

## 🔍 Método 2: Desde la Lista de Deployments

1. En la lista de deployments, cada uno tiene un icono de "link" o "visitar"
2. Haz click en ese icono para abrir la URL del deployment staged
3. La URL aparecerá en la barra de direcciones del navegador

## 🎯 Método 3: Usar Vercel CLI

Si tienes Vercel CLI instalado:

```bash
# Ver todos los deployments
vercel ls

# Obtener la URL de un deployment específico
vercel inspect [deployment-url]
```

## ⚠️ Notas Importantes

- **La URL del deployment es única y permanente** - puedes compartirla con tu equipo para testing
- **No afecta producción** - hasta que hagas "Promote to Production", el dominio de producción seguirá apuntando al deployment anterior
- **Variables de entorno** - El deployment staged usa las mismas variables de entorno de producción
- **Base de datos** - Si tu app usa diferentes schemas por entorno, verifica que el deployment staged esté usando el schema correcto

## 🚀 Después de Probar

Una vez que hayas verificado que todo funciona correctamente:

1. Ve al deployment en Vercel Dashboard
2. Haz click en **"Promote to Production"**
3. El deployment se activará en el dominio de producción

## 🔄 Alternativa: Preview Deployment

Si quieres probar cambios antes de que lleguen a "Staged", puedes:

1. Crear un branch de prueba
2. Hacer push al branch
3. Vercel creará automáticamente un Preview Deployment
4. Usar la URL del preview para probar

---

**Última actualización**: Enero 2025
