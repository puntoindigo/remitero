# 📝 Guía para Insertar Productos en Supabase

## 🎯 Objetivo
Insertar 18 productos en la empresa con ID `01646687-9c07-463c-b71c-af96de397138` en el schema `dev`.

## 📋 Pasos para Ejecutar en Supabase

### Opción 1: Usar SQL Editor con search_path (Recomendado)

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
   - Navega a **SQL Editor** (en el menú lateral)

2. **Configurar el schema**
   - Antes de ejecutar el script, ejecuta:
   ```sql
   SET search_path TO dev;
   ```

3. **Verificar que la empresa existe**
   ```sql
   SELECT id, name FROM companies WHERE id = '01646687-9c07-463c-b71c-af96de397138';
   ```
   - Si no devuelve resultados, la empresa no existe en el schema `dev`
   - Necesitarás crear la empresa primero o verificar el ID correcto

4. **Ejecutar el script**
   - Usa el archivo `scripts/insert-products-with-schema.sql`
   - Copia y pega todo el contenido en el SQL Editor
   - Haz clic en **Run** o presiona **F5**

### Opción 2: Usar nombres completos de schema

Si prefieres no cambiar el `search_path`, puedes usar nombres completos:

```sql
-- Verificar empresa
SELECT id, name FROM dev.companies WHERE id = '01646687-9c07-463c-b71c-af96de397138';

-- Insertar productos
INSERT INTO dev.products (name, description, price, stock, company_id, category_id, created_at, updated_at)
VALUES
  ('Cacao Toddy', 'Cacao en polvo', 1915.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  -- ... resto de productos
```

## 🔍 Verificar el Schema Actual

Para ver qué schema estás usando:

```sql
SELECT current_schema();
-- O
SHOW search_path;
```

## ⚠️ Solución al Error de Foreign Key

Si obtienes el error:
```
ERROR: 23503: insert or update on table "products" violates foreign key constraint "products_company_id_fkey"
DETAIL: Key (company_id)=(01646687-9c07-463c-b71c-af96de397138) is not present in table "companies".
```

**Causas posibles:**
1. Estás ejecutando en el schema `public` en lugar de `dev`
2. La empresa no existe en el schema `dev`
3. El ID de la empresa es incorrecto

**Solución:**
1. Verifica el schema actual: `SELECT current_schema();`
2. Si es `public`, cambia a `dev`: `SET search_path TO dev;`
3. Verifica que la empresa existe: `SELECT * FROM companies WHERE id = '01646687-9c07-463c-b71c-af96de397138';`
4. Si no existe, necesitas crear la empresa primero o usar el ID correcto

## 📊 Verificar Productos Insertados

Después de ejecutar el script:

```sql
SET search_path TO dev;
SELECT COUNT(*) as total_productos FROM products WHERE company_id = '01646687-9c07-463c-b71c-af96de397138';
-- Debería devolver 18
```

