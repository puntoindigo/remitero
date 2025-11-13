# 🔧 Solución: Error PGRST106 - Schema 'dev' no permitido

## 🚨 Problema

Al intentar loguearse con Google OAuth en `remitero-dev.vercel.app`, aparece el error:

```
❌ [NextAuth signIn] Detalles del error: { 
  code: 'PGRST106', 
  message: 'The schema must be one of the following: public, graphql_public', 
  details: null, 
  hint: null 
}
```

## 🔍 Causa

PostgREST (el API de Supabase) solo permite ciertos schemas por defecto. El schema `dev` necesita estar configurado en la lista de schemas permitidos de PostgREST.

## ✅ Solución

### Opción 1: Configurar Schema en Supabase Dashboard (Recomendado)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto `remitero`
3. Ve a **Settings** → **API** → **Database Schema**
4. En la sección **"Exposed schemas"** o **"Database schemas"**, agrega `dev` a la lista
5. La lista debería quedar así:
   ```
   public, graphql_public, dev
   ```
6. Guarda los cambios
7. Espera unos segundos para que los cambios se apliquen

### Opción 2: Configurar mediante SQL (Alternativa)

Si no encuentras la opción en el Dashboard, puedes configurarlo mediante SQL:

1. Ve a Supabase Dashboard → **SQL Editor**
2. Ejecuta el siguiente script:

```sql
-- Configurar PostgREST para permitir el schema 'dev'
-- Esto actualiza la configuración de PostgREST
ALTER DATABASE postgres SET "pgrst.db_schemas" = 'public, graphql_public, dev';

-- Nota: Puede que necesites reiniciar PostgREST para que los cambios surtan efecto
-- Esto generalmente se hace automáticamente, pero si no funciona, contacta a Supabase support
```

### Opción 3: Usar Prefijo de Schema en Queries (Temporal)

Si las opciones anteriores no funcionan, podemos modificar el código para usar el prefijo del schema directamente en las queries en lugar de `db.schema`. Sin embargo, esto requeriría cambiar todas las queries y no es la solución ideal.

## 🔍 Verificar que Funcionó

1. Intenta loguearte nuevamente en `remitero-dev.vercel.app`
2. Revisa los logs en Vercel
3. Deberías ver:
   ```
   ✅ [NextAuth signIn] Usuario existente encontrado: { ... }
   ✅ [NextAuth signIn] Login con Google exitoso, retornando true
   ```
4. **NO deberías ver** el error `PGRST106`

## 📝 Nota Importante

Si después de configurar el schema `dev` en PostgREST sigues viendo el error:

1. **Espera 1-2 minutos** para que los cambios se propaguen
2. **Verifica que el schema `dev` existe** en la base de datos:
   ```sql
   SELECT schema_name 
   FROM information_schema.schemata 
   WHERE schema_name = 'dev';
   ```
3. **Verifica que hay tablas en el schema `dev`**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'dev';
   ```
4. Si el problema persiste, puede ser necesario **contactar a Supabase Support** para que habiliten el schema manualmente

## 🎯 Próximos Pasos

Una vez que el schema `dev` esté configurado en PostgREST:

1. Intenta loguearte nuevamente
2. Verifica que los logs muestran el schema correcto
3. Verifica que el login funciona correctamente
4. Si el schema `dev` está vacío, copia los datos de producción usando `migrations/copy_data_prod_to_dev.sql`

---

**Última actualización**: Noviembre 2024

