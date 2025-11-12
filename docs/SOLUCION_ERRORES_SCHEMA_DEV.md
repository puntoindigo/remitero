# 🔧 Solución: Errores 500 en Schema Dev

## 📋 Problema

En `remitero-dev.vercel.app` aparecen errores 500 en:
- `/api/users`
- `/api/companies`
- `/api/dashboard`

Y no hay datos en la base de datos.

## 🔍 Causa

El schema `dev` fue creado con la estructura de tablas, pero **está vacío** (sin datos). Esto causa que:

1. Las queries que esperan datos devuelven arrays vacíos (esto es normal)
2. Pero si hay problemas con foreign keys o permisos, pueden fallar con 500
3. El usuario no puede iniciar sesión porque no hay usuarios en `dev`

## ✅ Soluciones

### Opción 1: Copiar Datos de Producción a Dev (Recomendado)

Ejecuta en Supabase SQL Editor:

```sql
-- Ejecutar migrations/copy_data_prod_to_dev.sql
```

Esto copiará todos los datos de `public` a `dev`, permitiendo que la app funcione correctamente.

**⚠️ ADVERTENCIA**: Esto sobrescribe los datos existentes en `dev`.

### Opción 2: Crear Datos de Prueba en Dev

Si prefieres datos de prueba separados:

1. Crea una empresa de prueba:
   ```sql
   INSERT INTO dev.companies (name) VALUES ('Empresa de Prueba');
   ```

2. Crea un usuario de prueba:
   ```sql
   INSERT INTO dev.users (name, email, role, company_id, is_active)
   SELECT 'Usuario Prueba', 'test@example.com', 'SUPERADMIN', id, true
   FROM dev.companies LIMIT 1;
   ```

3. Crea estados de remitos:
   ```sql
   INSERT INTO dev.estados_remitos (name, color, is_active)
   VALUES 
     ('PENDIENTE', '#FFA500', true),
     ('PREPARADO', '#00FF00', true),
     ('ENTREGADO', '#0000FF', true);
   ```

### Opción 3: Verificar Permisos del Schema Dev

Asegúrate de que los permisos están correctos:

```sql
-- Verificar permisos
GRANT ALL ON SCHEMA dev TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO authenticated;
```

## 🔍 Verificar el Problema

Ejecuta en Supabase SQL Editor:

```sql
-- Verificar que el schema dev existe
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'dev';

-- Verificar que las tablas existen
SELECT table_name FROM information_schema.tables WHERE table_schema = 'dev';

-- Verificar si hay datos
SELECT COUNT(*) FROM dev.users;
SELECT COUNT(*) FROM dev.companies;
SELECT COUNT(*) FROM dev.remitos;
```

## 🚨 Problema Específico: Productos de Remitos en Producción

Si en producción no se cargan los productos de los remitos, verifica:

1. **Verificar que los remito_items existen en public**:
   ```sql
   SELECT COUNT(*) FROM public.remito_items;
   SELECT * FROM public.remito_items LIMIT 5;
   ```

2. **Verificar que la query funciona**:
   ```sql
   SELECT 
     r.id,
     r.number,
     ri.id as item_id,
     ri.product_name,
     ri.quantity
   FROM public.remitos r
   LEFT JOIN public.remito_items ri ON ri.remito_id = r.id
   LIMIT 10;
   ```

3. **Verificar permisos en public**:
   ```sql
   -- Asegurar que authenticated tiene permisos
   GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
   ```

## 📝 Próximos Pasos

1. **Para desarrollo**: Copiar datos de producción a dev (Opción 1)
2. **Para producción**: Verificar que los remito_items existen y tienen datos
3. **Verificar logs de Vercel** para ver errores específicos

---

**Recomendación**: Usa la **Opción 1** para tener datos reales en desarrollo y poder probar correctamente.

