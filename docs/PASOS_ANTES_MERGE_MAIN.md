# 🚀 Pasos ANTES del Merge a Main

## ✅ Checklist Pre-Merge

Antes de hacer el merge a `main`, verifica que:

- [x] Schema `dev` creado en Supabase
- [x] Estructura de tablas duplicada en schema `dev`
- [x] Código actualizado en `develop` (schema dinámico)
- [x] Variables de entorno configuradas en Vercel Preview/Development
- [ ] **VERIFICAR que develop funciona correctamente con schema `dev`**
- [ ] **VERIFICAR que los datos de producción siguen en schema `public`**

## 🔍 Verificaciones Críticas ANTES del Merge

### 1. Verificar que Develop Usa Schema Dev

En Supabase SQL Editor, ejecuta:
```sql
-- Verificar que hay datos en dev (debería haber datos de prueba)
SELECT COUNT(*) as total_users FROM dev.users;
SELECT COUNT(*) as total_remitos FROM dev.remitos;

-- Verificar que los datos de producción NO están en dev
-- (a menos que hayas copiado datos intencionalmente)
```

### 2. Verificar que Producción Usa Schema Public

```sql
-- Verificar que los datos de producción están en public
SELECT COUNT(*) as total_users FROM public.users;
SELECT COUNT(*) as total_remitos FROM public.remitos;
```

### 3. Probar en Develop (Vercel Preview)

1. Accede a la URL de preview de develop
2. Crea un registro de prueba (ej: un cliente)
3. Verifica en Supabase que aparece en `dev`, NO en `public`:
   ```sql
   SELECT * FROM dev.clients ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM public.clients WHERE name = 'Cliente de Prueba';
   -- Debería estar vacío
   ```

## 📋 Pasos para el Merge

### Paso 1: Verificar Estado Actual

```bash
# Asegúrate de estar en develop y todo está commiteado
git status
# Debería decir "nothing to commit, working tree clean"

# Ver los últimos commits
git log --oneline -5
```

### Paso 2: Hacer Merge a Main

```bash
# Cambiar a main
git checkout main

# Actualizar main con los últimos cambios
git pull origin main

# Hacer merge de develop
git merge develop

# Si hay conflictos, resolverlos y luego:
# git add .
# git commit -m "Merge develop into main: Separación Dev/Prod con schemas"

# Push a main
git push origin main
```

### Paso 3: Configurar Vercel Production

**⚠️ CRÍTICO: Esto debe hacerse ANTES de que Vercel despliegue automáticamente**

1. Ve a [Vercel Dashboard](https://vercel.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Busca o crea la variable para **Production**:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `public`
   - **Environment**: ✅ Production (solo)
5. **Guarda los cambios**

### Paso 4: Verificar Deploy Automático

- Vercel debería detectar el push a `main` y desplegar automáticamente
- Puedes ver el progreso en el dashboard de Vercel
- Espera a que el deploy termine

### Paso 5: Verificar Producción

1. **Accede a la URL de producción**
2. **Inicia sesión** con un usuario de producción
3. **Verifica que los datos están intactos**:
   - Lista de clientes
   - Lista de remitos
   - Lista de productos
4. **Crea un registro de prueba** (ej: un cliente)
5. **Verifica en Supabase** que aparece en `public`, NO en `dev`:
   ```sql
   SELECT * FROM public.clients ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM dev.clients WHERE name = 'Cliente de Prueba';
   -- Debería estar vacío
   ```

## 🎯 Resultado Esperado

Después del merge y deploy:

- ✅ **Production (main)**: Usa schema `public` → Datos de producción intactos
- ✅ **Preview/Development (develop)**: Usa schema `dev` → Datos de desarrollo separados
- ✅ **Localhost**: Usa schema `dev` → Desarrollo local sin afectar producción

## ⚠️ Si Algo Sale Mal

### Problema: Producción usa schema dev
**Solución**: Verifica que `DATABASE_SCHEMA=public` está configurado en Vercel Production

### Problema: Los datos de producción desaparecieron
**Solución**: 
1. Verifica que están en schema `public`:
   ```sql
   SELECT * FROM public.users;
   ```
2. Si están ahí, el problema es que la app está usando el schema incorrecto
3. Verifica la variable `DATABASE_SCHEMA` en Vercel

### Problema: No puedo iniciar sesión en producción
**Solución**: 
1. Verifica que los usuarios están en schema `public`
2. Verifica que `DATABASE_SCHEMA=public` en Vercel Production
3. Revisa los logs de Vercel para ver errores

## 📝 Notas Importantes

1. **NO hacer rollback** a menos que sea absolutamente necesario
2. **Los datos de producción están seguros** en schema `public`
3. **El código detecta automáticamente** el entorno (production = public, resto = dev)
4. **Si VERCEL_ENV=production**, siempre usa `public` (automático)

## ✅ Checklist Post-Merge

- [ ] Merge completado sin conflictos
- [ ] `DATABASE_SCHEMA=public` configurado en Vercel Production
- [ ] Deploy a producción completado
- [ ] Verificado que producción usa schema `public`
- [ ] Verificado que los datos de producción están intactos
- [ ] Verificado que develop sigue usando schema `dev`
- [ ] Todo funciona correctamente en ambos entornos

---

**¿Listo para hacer el merge?** Si tienes dudas, revisa primero las verificaciones críticas.

