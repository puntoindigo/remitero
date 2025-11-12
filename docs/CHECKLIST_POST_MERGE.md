# ✅ Checklist Post-Merge: Separación Dev/Prod

## 🎯 Estado Actual

- ✅ Merge `develop` → `main` completado
- ✅ Código pusheado a `main`
- ✅ Schema `dev` creado en Supabase
- ✅ Estructura de tablas duplicada en `dev`
- ✅ Código detecta automáticamente el entorno

## 🔍 Verificaciones Post-Merge

### 1. Verificar que el Código Está Correcto

El código en `src/lib/supabase.ts` ya detecta automáticamente:
- Si `VERCEL_ENV === 'production'` → usa schema `public`
- Si no → usa schema `dev` (o `DATABASE_SCHEMA` si está configurado)

**✅ Estado**: Correcto - No requiere cambios adicionales

### 2. Configuración en Vercel (OPCIONAL pero Recomendado)

Aunque el código detecta automáticamente el entorno, es recomendable configurar explícitamente:

#### En Vercel Dashboard:
1. Ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega para **Production**:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `public`
   - **Environment**: ✅ Production (solo)
3. Para **Preview/Development** (opcional):
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `dev`
   - **Environment**: ✅ Preview, ✅ Development

**Nota**: Esto es opcional porque el código ya detecta `VERCEL_ENV=production` automáticamente, pero es más explícito y claro.

### 3. Verificar Deploy Automático

- [ ] Vercel debería detectar el push a `main` y desplegar automáticamente
- [ ] Revisar el dashboard de Vercel para ver el progreso del deploy
- [ ] Esperar a que el deploy termine (puede tomar 2-5 minutos)

### 4. Verificar Producción (Después del Deploy)

Una vez que el deploy termine:

- [ ] **Acceder a la URL de producción**
- [ ] **Iniciar sesión** con un usuario de producción
- [ ] **Verificar que los datos están intactos**:
  - Lista de clientes
  - Lista de remitos
  - Lista de productos
  - Lista de usuarios
- [ ] **Crear un registro de prueba** (ej: un cliente nuevo)
- [ ] **Verificar en Supabase** que aparece en `public`, NO en `dev`:
  ```sql
  -- Debería aparecer en public
  SELECT * FROM public.clients ORDER BY created_at DESC LIMIT 1;
  
  -- NO debería aparecer en dev
  SELECT * FROM dev.clients WHERE name = 'Tu Cliente de Prueba';
  -- Debería estar vacío
  ```

### 5. Verificar que Develop Sigue Funcionando

- [ ] Acceder a la URL de preview de `develop`
- [ ] Crear un registro de prueba
- [ ] Verificar en Supabase que aparece en `dev`, NO en `public`

## 🎯 Resultado Esperado

Después de todas las verificaciones:

- ✅ **Production (main)**: Usa schema `public` → Datos de producción intactos
- ✅ **Preview/Development (develop)**: Usa schema `dev` → Datos de desarrollo separados
- ✅ **Localhost**: Usa schema `dev` por defecto → Desarrollo local sin afectar producción

## ⚠️ Si Algo Sale Mal

### Problema: Producción usa schema dev
**Solución**: 
1. Verifica que `VERCEL_ENV=production` está configurado en Vercel (debería estar automáticamente)
2. Opcionalmente, agrega `DATABASE_SCHEMA=public` explícitamente en Vercel Production

### Problema: Los datos de producción desaparecieron
**Solución**: 
1. Verifica que están en schema `public`:
   ```sql
   SELECT COUNT(*) FROM public.users;
   SELECT COUNT(*) FROM public.remitos;
   ```
2. Si están ahí, el problema es que la app está usando el schema incorrecto
3. Verifica la variable `VERCEL_ENV` en Vercel (debería ser `production`)

### Problema: No puedo iniciar sesión en producción
**Solución**: 
1. Verifica que los usuarios están en schema `public`:
   ```sql
   SELECT * FROM public.users WHERE email = 'tu-email@example.com';
   ```
2. Verifica que `VERCEL_ENV=production` en Vercel
3. Revisa los logs de Vercel para ver errores

## 📝 Próximos Pasos

1. **Esperar el deploy automático** de Vercel (2-5 minutos)
2. **Verificar producción** siguiendo el checklist arriba
3. **Configurar `DATABASE_SCHEMA` en Vercel** (opcional pero recomendado)
4. **Continuar desarrollando en `develop`** con schema `dev` separado

## 🎉 ¡Todo Listo!

Si todas las verificaciones pasan, la separación Dev/Prod está funcionando correctamente. Ahora puedes:

- ✅ Desarrollar en `develop` sin afectar producción
- ✅ Modificar/eliminar datos en `dev` sin preocuparte
- ✅ Deployar a producción con confianza sabiendo que los datos están separados

---

**Fecha del merge**: $(date)
**Commit**: $(git log -1 --oneline)

