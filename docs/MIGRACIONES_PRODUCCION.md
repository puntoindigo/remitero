# 📋 Migraciones para Producción

Este documento lista todas las migraciones que deben ejecutarse en producción antes de hacer el deploy.

## ⚠️ IMPORTANTE

**Todas las migraciones deben ejecutarse en Supabase Dashboard → SQL Editor antes de hacer deploy a producción.**

Las migraciones están diseñadas para ser **idempotentes** (se pueden ejecutar múltiples veces sin problemas) y aplican cambios tanto en el schema `public` (producción) como en `dev` (desarrollo).

## 📝 Migraciones Pendientes

### 1. Agregar campo `account_payment` a `remitos`

**Archivo:** `migrations/add_account_payment_to_remitos.sql`

**Descripción:** Agrega el campo `account_payment` (Pago a cuenta) a la tabla `remitos`. Este campo representa un pago a cuenta que se RESTA del total del remito.

**Ejecutar:**
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `migrations/add_account_payment_to_remitos.sql`
3. Ejecuta el script

**Verificación:**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'remitos' 
  AND column_name = 'account_payment';
```

### 2. Agregar campo `is_unit` a `remito_items`

**Archivo:** `migrations/add_is_unit_to_remito_items.sql`

**Descripción:** Agrega el campo `is_unit` (BOOLEAN) a la tabla `remito_items`. Este campo indica si el producto se vende por unidad en lugar de por presentación.

**Ejecutar:**
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `migrations/add_is_unit_to_remito_items.sql`
3. Ejecuta el script

**Verificación:**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'remito_items' 
  AND column_name = 'is_unit';
```

## ✅ Migraciones Ya Aplicadas

Las siguientes migraciones ya deberían estar aplicadas, pero verifica si es necesario:

- `add_shipping_and_balance_to_remitos.sql` - Campos de envío y saldo anterior
- `add_image_url_to_products.sql` - URL de imagen en productos
- Otras migraciones según tu historial

## 🔄 Orden de Ejecución

1. **Primero:** Ejecutar `add_account_payment_to_remitos.sql`
2. **Segundo:** Ejecutar `add_is_unit_to_remito_items.sql`

## 📊 Verificación Completa

Para verificar que todas las migraciones se aplicaron correctamente:

```sql
-- Verificar account_payment en remitos
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'remitos' 
  AND column_name IN ('account_payment', 'shipping_cost', 'previous_balance');

-- Verificar is_unit en remito_items
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'remito_items' 
  AND column_name = 'is_unit';
```

## 🚀 Después de Ejecutar las Migraciones

1. Verifica que los campos existan en la base de datos
2. Haz deploy a producción (push a `main` branch)
3. Verifica que la aplicación funcione correctamente en producción

## 📝 Notas

- Las migraciones son **seguras**: no eliminan datos existentes
- Se aplican automáticamente a ambos schemas (`public` y `dev`)
- Si una migración falla, puedes ejecutarla nuevamente (son idempotentes)
- Siempre verifica los logs de Supabase después de ejecutar una migración

---

**Última actualización:** Enero 2025

