# FAQ: ¿Funciona OAuth2 en Modo de Prueba?

## ❓ Pregunta: "¿Solo va a funcionar en modo de prueba?"

## ✅ Respuesta: SÍ funciona en PRODUCCIÓN, el "modo de prueba" NO limita el uso

---

## 🎯 ¿Qué significa "Modo de Prueba" en Google Cloud Console?

**IMPORTANTE**: "Modo de prueba" NO significa que solo funcione en desarrollo. Es un término confuso de Google que se refiere a que tu app OAuth2 no está verificada públicamente, pero **SÍ funciona en producción**.

### Diferencia entre "Modo de Prueba" y "Producción":

| Aspecto | Modo de Prueba OAuth2 | Producción Real (Vercel) |
|---------|----------------------|-------------------------|
| ¿Funciona en Vercel? | ✅ **SÍ** | ✅ **SÍ** |
| ¿Funciona en producción? | ✅ **SÍ** | ✅ **SÍ** |
| ¿Hay límites? | ❌ **NO** | ❌ **NO** |
| ¿Expira? | ❌ **NO** | ❌ **NO** |
| ¿Necesitas cambiar algo? | ❌ **NO** | ❌ **NO** |

**Conclusión**: El "modo de prueba" de OAuth2 es solo un estado interno de Google. **NO afecta tu aplicación en producción**.

Cuando seleccionas "Usuarios externos" en Google Cloud Console, tu app OAuth2 empieza en **modo de prueba**. Esto significa:

### ✅ Lo que SÍ funciona en Modo de Prueba:

1. **Envío de emails desde tu cuenta** (`puntoindigo3@gmail.com`)
   - ✅ Funciona perfectamente
   - ✅ Funciona en producción (Vercel)
   - ✅ No hay límites de cantidad de emails
   - ✅ No hay restricciones de tiempo

2. **Usuarios agregados a la lista de prueba**
   - ✅ Puedes agregar hasta 100 usuarios de prueba
   - ✅ Estos usuarios pueden autorizar tu app
   - ✅ Funciona indefinidamente

3. **En producción (Vercel)**
   - ✅ Funciona exactamente igual que en desarrollo
   - ✅ No hay diferencia entre modo prueba y producción para tu caso

---

## ❌ Lo que NO funciona en Modo de Prueba:

1. **Usuarios NO agregados a la lista de prueba**
   - ❌ No pueden autorizar tu app
   - ❌ Verán advertencia de "app no verificada"

**PERO**: Esto NO es un problema para tu caso porque:
- Solo TÚ (`puntoindigo3@gmail.com`) necesitas autorizar la app
- Los usuarios del sistema NO necesitan autorizar nada
- Ellos solo reciben emails, no interactúan con OAuth

---

## 🔍 Para tu Caso Específico

### Tu Situación:
- Quieres enviar emails desde `puntoindigo3@gmail.com`
- Los emails van a usuarios del sistema (invitaciones, etc.)
- Solo necesitas que TU cuenta autorice la app

### ¿Modo de Prueba es suficiente?
**✅ SÍ, 100% suficiente**

**Razones**:
1. Solo necesitas autorizar UNA vez con `puntoindigo3@gmail.com`
2. Una vez autorizado, el refresh token funciona indefinidamente
3. Los usuarios que reciben emails NO necesitan autorizar nada
4. No hay límites de envío en modo de prueba
5. Funciona en producción sin problemas

---

## 🚀 ¿Cuándo Necesitarías Verificación?

Solo necesitarías verificar tu app si:

1. **Quisieras que otros usuarios autoricen tu app**
   - Por ejemplo: si cada usuario del sistema necesitara conectar su Gmail
   - **NO es tu caso**: Solo envías emails desde una cuenta

2. **Quisieras que usuarios externos usen tu app sin estar en lista de prueba**
   - **NO es tu caso**: Solo envías emails, no necesitas que otros autoricen

3. **Quisieras publicar tu app en Google Workspace Marketplace**
   - **NO es tu caso**: Es una app interna

---

## 📋 Resumen

| Aspecto | Modo de Prueba | Tu Necesidad | ¿Funciona? |
|---------|----------------|--------------|------------|
| Enviar emails desde tu cuenta | ✅ Sí | ✅ Sí | ✅ **SÍ** |
| En producción (Vercel) | ✅ Sí | ✅ Sí | ✅ **SÍ** |
| Límite de emails | ❌ No hay | - | ✅ **SÍ** |
| Tiempo de expiración | ❌ No expira | - | ✅ **SÍ** |
| Usuarios externos autorizan | ❌ No | ❌ No necesitas | ✅ **No aplica** |

---

## ✅ Conclusión

**Para tu caso, el modo de prueba es PERFECTO y suficiente.**

- ✅ Funciona en producción
- ✅ No hay límites
- ✅ No expira
- ✅ No necesitas verificación
- ✅ Es más simple y rápido

**Solo asegúrate de**:
1. Agregar `puntoindigo3@gmail.com` a la lista de usuarios de prueba
2. Autorizar la app una vez con esa cuenta
3. Guardar el refresh token de forma segura

---

## 🔄 Si Más Adelante Necesitas Verificación

Si en el futuro necesitas verificar tu app (poco probable para tu caso), el proceso es:

1. Completar la información de la app
2. Agregar políticas de privacidad
3. Agregar términos de servicio
4. Enviar para revisión de Google
5. Esperar aprobación (puede tardar días/semanas)

**Pero esto NO es necesario para enviar emails desde tu cuenta.**

---

**Última actualización**: Noviembre 2024

