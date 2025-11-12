# 🔧 Solución: "Acceso Denegado" en Desarrollo

## 📋 Problema

En `remitero-dev.vercel.app`:
1. Aparece mensaje "Acceso Denegado" / "Tu cuenta ha sido desactivada"
2. Al hacer clic en "Ir al inicio", permite pasar y usar la app sin datos
3. Aparecen errores 500 al cargar empresas, usuarios, dashboard

## 🔍 Causa Raíz

El schema `dev` está **vacío** (solo estructura, sin datos). Cuando intentas iniciar sesión:

1. **Con Google OAuth**: 
   - Busca tu usuario en `dev.users` → No existe
   - Intenta crear uno nuevo → Puede fallar por foreign keys o permisos
   - O crea el usuario pero luego falla al obtener la empresa
   - NextAuth retorna `false` → Muestra "Acceso Denegado"

2. **Al hacer clic en "Ir al inicio"**:
   - Puede estar usando una sesión existente (de producción)
   - O la validación de sesión no está bloqueando correctamente
   - Permite pasar pero luego fallan las queries porque no hay datos

3. **Errores 500**:
   - Las queries fallan porque no hay datos en `dev`
   - Foreign keys no se pueden resolver (ej: `company_id` que no existe)

## ✅ Solución: Copiar Datos de Producción a Dev

**Ejecuta en Supabase SQL Editor:**

```sql
-- Ejecutar migrations/copy_data_prod_to_dev.sql
```

Este script:
- Copia todos los datos de `public` a `dev`
- Incluye usuarios, empresas, remitos, productos, etc.
- Resetea las secuencias para que los IDs empiecen correctamente

**Después de ejecutar:**
1. Intenta iniciar sesión nuevamente
2. Deberías poder iniciar sesión con tu usuario de producción
3. Los errores 500 deberían desaparecer

## 🔍 Verificar que Funcionó

```sql
-- Verificar que hay datos en dev
SELECT COUNT(*) FROM dev.users;
SELECT COUNT(*) FROM dev.companies;
SELECT COUNT(*) FROM dev.remitos;

-- Verificar tu usuario específico
SELECT * FROM dev.users WHERE email = 'tu-email@example.com';
```

## ⚠️ Nota Importante

**El schema `dev` ahora tiene los mismos datos que producción**, pero:
- ✅ Los cambios en `dev` NO afectan `public` (producción)
- ✅ Puedes modificar/eliminar datos en `dev` sin preocuparte
- ✅ Cuando quieras datos frescos, ejecuta el script nuevamente

## 🐛 Si Sigue Fallando

### Problema: Sigue mostrando "Acceso Denegado"

1. Verifica que tu usuario existe en `dev`:
   ```sql
   SELECT * FROM dev.users WHERE email = 'tu-email@example.com';
   ```

2. Verifica que `is_active = true`:
   ```sql
   SELECT id, email, is_active FROM dev.users WHERE email = 'tu-email@example.com';
   ```

3. Si `is_active = false`, actívalo:
   ```sql
   UPDATE dev.users SET is_active = true WHERE email = 'tu-email@example.com';
   ```

### Problema: Sigue habiendo errores 500

1. Verifica permisos del schema `dev`:
   ```sql
   GRANT ALL ON SCHEMA dev TO authenticated;
   GRANT ALL ON ALL TABLES IN SCHEMA dev TO authenticated;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO authenticated;
   ```

2. Verifica que las foreign keys están correctas:
   ```sql
   -- Verificar que los company_id existen
   SELECT u.id, u.email, u.company_id, c.id as company_exists
   FROM dev.users u
   LEFT JOIN dev.companies c ON c.id = u.company_id
   WHERE u.company_id IS NOT NULL;
   ```

## 📝 Alternativa: Crear Usuario de Prueba

Si prefieres NO copiar todos los datos, puedes crear solo un usuario de prueba:

```sql
-- 1. Crear empresa de prueba
INSERT INTO dev.companies (name) VALUES ('Empresa de Prueba') RETURNING id;

-- 2. Crear usuario SUPERADMIN de prueba
INSERT INTO dev.users (name, email, role, company_id, is_active, password)
VALUES (
  'Admin Prueba',
  'admin@test.com',
  'SUPERADMIN',
  (SELECT id FROM dev.companies WHERE name = 'Empresa de Prueba'),
  true,
  '$2a$10$...' -- Hash de contraseña (generar con bcrypt)
);

-- 3. Crear estados de remitos básicos
INSERT INTO dev.estados_remitos (name, color, is_active)
VALUES 
  ('PENDIENTE', '#FFA500', true),
  ('PREPARADO', '#00FF00', true),
  ('ENTREGADO', '#0000FF', true);
```

Pero **recomiendo copiar todos los datos** para tener un entorno de desarrollo más realista.

---

**Recomendación**: Ejecuta `migrations/copy_data_prod_to_dev.sql` y luego intenta iniciar sesión nuevamente.

