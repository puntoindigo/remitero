# 🚀 Guía de Implementación: Separación Dev/Prod con Schemas

## 📋 Resumen

Esta guía te lleva paso a paso para implementar la separación de entornos usando schemas de PostgreSQL.

## ✅ Pre-requisitos

- Acceso a Supabase Dashboard
- Permisos de administrador en el proyecto
- Código en branch `develop` listo para merge a `main`

## 🔧 Paso 1: Crear Schema Dev en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto `remitero`
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `migrations/create_dev_schema.sql`
5. Ejecuta el script
6. Verifica que aparezca el mensaje: `✅ Schema dev creado exitosamente`

## 📊 Paso 2: Duplicar Estructura de Tablas

1. En Supabase SQL Editor, ejecuta `migrations/copy_structure_to_dev.sql`
2. Este script creará todas las tablas en el schema `dev` con la misma estructura que `public`
3. Verifica que se crearon todas las tablas:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'dev' 
   ORDER BY table_name;
   ```

## 🔑 Paso 3: Configurar Variables de Entorno

### Localhost (.env.local)
```env
DATABASE_SCHEMA=dev
```

### Vercel - Production
```env
DATABASE_SCHEMA=public
```

### Vercel - Preview/Development
```env
DATABASE_SCHEMA=dev
```

## 💻 Paso 4: Actualizar Código

El código ya está actualizado en `src/lib/supabase.ts` para usar el schema dinámico.

**Verificar que funciona:**
1. Reinicia el servidor local
2. Deberías ver en los logs: `🗄️ [Supabase] Usando schema: dev`
3. Prueba crear/editar datos y verifica que se guardan en el schema `dev`

## 🧪 Paso 5: Probar Separación

### En Desarrollo (localhost)
1. Crea un usuario de prueba en la app
2. Verifica en Supabase SQL Editor:
   ```sql
   SELECT * FROM dev.users;
   ```
3. Verifica que NO aparece en producción:
   ```sql
   SELECT * FROM public.users WHERE email = 'test@example.com';
   -- Debería estar vacío
   ```

### En Producción (después del deploy)
1. Verifica que los datos de producción siguen en `public`
2. Verifica que los cambios en `dev` no afectan `public`

## 📦 Paso 6: Migrar a Producción

### 6.1 Merge develop → main
```bash
git checkout main
git merge develop
git push origin main
```

### 6.2 Configurar Vercel Production
1. Ve a Vercel Dashboard
2. Selecciona el proyecto
3. Ve a Settings → Environment Variables
4. Para **Production**, agrega:
   ```
   DATABASE_SCHEMA=public
   ```
5. Guarda los cambios

### 6.3 Deploy
- Vercel desplegará automáticamente cuando hagas push a `main`
- O puedes hacer deploy manual desde el dashboard

### 6.4 Verificar Producción
1. Accede a la URL de producción
2. Verifica que los datos de producción están intactos
3. Verifica que puedes hacer operaciones normalmente

## 🔄 Paso 7: Flujo de Trabajo Futuro

### Desarrollo Normal
1. Trabajas en branch `develop`
2. Usa schema `dev` (automático)
3. Puedes modificar/eliminar datos sin preocuparte

### Cuando Quieras Datos Reales en Dev
1. Ejecuta `migrations/copy_data_prod_to_dev.sql` en Supabase
2. Esto copiará todos los datos de `public` a `dev`
3. ⚠️ **ADVERTENCIA**: Esto sobrescribe los datos en `dev`

### Cuando Quieras Deployar a Producción
1. Merge `develop` → `main`
2. Vercel deploya automáticamente
3. Production usa schema `public` (automático)
4. Datos de producción intactos

### Migraciones Futuras
1. Usa `scripts/apply-migration-both-schemas.sql` como template
2. Aplica la migración en ambos schemas
3. Verifica que funciona en ambos

## 🐛 Troubleshooting

### Problema: "schema dev does not exist"
**Solución**: Ejecuta `migrations/create_dev_schema.sql` en Supabase

### Problema: "relation dev.users does not exist"
**Solución**: Ejecuta `migrations/copy_structure_to_dev.sql` en Supabase

### Problema: Los datos aparecen en el schema incorrecto
**Solución**: Verifica la variable `DATABASE_SCHEMA` en Vercel/localhost

### Problema: No puedo autenticarme en dev
**Solución**: Crea usuarios de prueba en el schema `dev` o copia usuarios de producción

## 📚 Referencias

- [Propuesta Completa](./PROPUESTA_SEPARACION_DEV_PROD.md)
- [Scripts SQL](../migrations/)
- [Documentación Supabase Schemas](https://supabase.com/docs/guides/database/tables#database-schemas)

