# 🎯 Propuesta: Separación de Entornos Dev/Prod con Schemas PostgreSQL

## 📋 Resumen Ejecutivo

**Problema**: Necesitamos separar desarrollo y producción sin crear una nueva base de datos (límite de proyectos free en Supabase).

**Solución**: Usar **schemas de PostgreSQL** dentro de la misma base de datos Supabase:
- Schema `public` → **Producción** (main branch)
- Schema `dev` → **Desarrollo** (develop branch)

## ✅ Ventajas

1. ✅ **Sin costo adicional**: Usa la misma base de Supabase
2. ✅ **Separación completa**: Datos completamente aislados
3. ✅ **Fácil cambio**: Solo cambiar variable de entorno
4. ✅ **Mismas migraciones**: Estructura idéntica en ambos schemas
5. ✅ **Backup fácil**: Puedes copiar datos de prod a dev cuando quieras

## 🏗️ Arquitectura Propuesta

```
Supabase Database (remitero)
├── Schema: public (PRODUCCIÓN)
│   ├── users
│   ├── companies
│   ├── remitos
│   ├── products
│   └── ... (todas las tablas)
│
└── Schema: dev (DESARROLLO)
    ├── users
    ├── companies
    ├── remitos
    ├── products
    └── ... (todas las tablas)
```

## 📝 Plan de Implementación

### Fase 1: Preparación (Sin cambios en código)

1. **Crear schema `dev` en Supabase**
2. **Duplicar estructura de tablas** al schema dev
3. **Crear índices** en el schema dev
4. **Configurar permisos** para el schema dev

### Fase 2: Modificar Código

1. **Agregar variable de entorno** `DATABASE_SCHEMA`
2. **Modificar `src/lib/supabase.ts`** para usar el schema dinámicamente
3. **Actualizar migraciones** para aplicar en ambos schemas

### Fase 3: Configuración de Entornos

1. **Vercel Production**: `DATABASE_SCHEMA=public`
2. **Vercel Preview/Development**: `DATABASE_SCHEMA=dev`
3. **Localhost**: `DATABASE_SCHEMA=dev` (por defecto)

### Fase 4: Migración de Código

1. **Merge develop → main** (con schema=public)
2. **Desplegar a producción**
3. **Seguir desarrollando en develop** (con schema=dev)

## 🔧 Cambios Técnicos Necesarios

### 1. Variable de Entorno

```env
# .env.local (desarrollo)
DATABASE_SCHEMA=dev

# Vercel Production
DATABASE_SCHEMA=public

# Vercel Preview/Development
DATABASE_SCHEMA=dev
```

### 2. Modificar `src/lib/supabase.ts`

```typescript
// Determinar schema según entorno
const getDatabaseSchema = (): string => {
  // En producción (Vercel Production), usar 'public'
  if (process.env.VERCEL_ENV === 'production') {
    return 'public';
  }
  // En desarrollo/preview, usar 'dev' o el valor de DATABASE_SCHEMA
  return process.env.DATABASE_SCHEMA || 'dev';
};

const databaseSchema = getDatabaseSchema();

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  // ... configuración existente ...
  db: {
    schema: databaseSchema, // ← Cambiar de 'public' fijo a dinámico
  },
  // ...
});
```

### 3. Scripts SQL Necesarios

#### A. Crear schema dev
```sql
-- migrations/create_dev_schema.sql
CREATE SCHEMA IF NOT EXISTS dev;
```

#### B. Duplicar estructura de tablas
```sql
-- migrations/copy_structure_to_dev.sql
-- Script para crear todas las tablas en schema dev
-- (basado en la estructura actual de public)
```

#### C. Copiar datos (opcional, cuando quieras)
```sql
-- migrations/copy_data_prod_to_dev.sql
-- Script para copiar datos de producción a desarrollo
```

## 📊 Tablas que Necesitan Duplicarse

Basado en el código actual:
- `users`
- `companies`
- `remitos`
- `remito_items`
- `products`
- `clients`
- `categories`
- `estados_remitos`
- `user_activity_logs`
- `notification_preferences`

## ⚠️ Consideraciones Importantes

### 1. Autenticación (NextAuth)
- NextAuth usa la tabla `users` para autenticación
- **Solución**: Usar el mismo schema para auth en ambos entornos
- O crear usuarios de prueba en `dev` separados

### 2. Migraciones Futuras
- Las migraciones deben aplicarse a **ambos schemas**
- Crear script helper para aplicar en ambos

### 3. Índices
- Los índices deben crearse en ambos schemas
- Usar nombres únicos: `idx_dev_products_company_id` vs `idx_public_products_company_id`

### 4. Permisos RLS (Row Level Security)
- Si usas RLS, configurarlo en ambos schemas
- O deshabilitarlo en dev para desarrollo más fácil

## 🚀 Pasos de Implementación

### Paso 1: Crear Schema Dev
```sql
-- Ejecutar en Supabase SQL Editor
CREATE SCHEMA IF NOT EXISTS dev;
GRANT ALL ON SCHEMA dev TO postgres;
GRANT USAGE ON SCHEMA dev TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO authenticated;
```

### Paso 2: Duplicar Estructura
- Crear script SQL que genere todas las tablas en `dev`
- Basado en la estructura actual de `public`

### Paso 3: Modificar Código
- Actualizar `src/lib/supabase.ts`
- Agregar variable `DATABASE_SCHEMA` a `.env.local`
- Configurar en Vercel

### Paso 4: Probar
- Verificar que develop usa schema `dev`
- Verificar que producción usa schema `public`
- Probar operaciones CRUD en ambos

### Paso 5: Migrar a Producción
- Merge develop → main
- Deploy a producción con `DATABASE_SCHEMA=public`
- Verificar que funciona correctamente

## 📚 Documentación Adicional

### Scripts Helper

Crear scripts en `scripts/`:
- `setup-dev-schema.sql` - Setup completo del schema dev
- `copy-prod-to-dev.sql` - Copiar datos de prod a dev
- `apply-migration-both.sql` - Aplicar migración en ambos schemas

### Variables de Entorno por Entorno

| Entorno | DATABASE_SCHEMA | Branch |
|---------|----------------|--------|
| Localhost | `dev` | develop |
| Vercel Preview | `dev` | develop |
| Vercel Production | `public` | main |

## ✅ Checklist de Implementación

- [ ] Crear schema `dev` en Supabase
- [ ] Duplicar estructura de tablas a `dev`
- [ ] Crear índices en `dev`
- [ ] Modificar `src/lib/supabase.ts`
- [ ] Agregar `DATABASE_SCHEMA` a `.env.local`
- [ ] Configurar `DATABASE_SCHEMA` en Vercel (Production = `public`, Preview = `dev`)
- [ ] Probar operaciones en develop (schema dev)
- [ ] Merge develop → main
- [ ] Deploy a producción (schema public)
- [ ] Verificar que producción funciona correctamente
- [ ] Documentar proceso en README

## 🔄 Flujo de Trabajo Futuro

1. **Desarrollo en develop**:
   - Trabajas en `develop` branch
   - Usa schema `dev`
   - Puedes modificar/eliminar datos sin afectar producción

2. **Cuando esté listo para producción**:
   - Merge `develop` → `main`
   - Deploy automático a Vercel Production
   - Production usa schema `public`
   - Datos de producción intactos

3. **Sincronizar datos (opcional)**:
   - Si necesitas datos reales en dev, ejecutar script `copy-prod-to-dev.sql`
   - Solo cuando sea necesario

## 💡 Alternativas Consideradas

### ❌ Opción 1: Nueva Base de Supabase
- **Problema**: Límite de proyectos free (ya tienes 2)

### ❌ Opción 2: Prefijos en Nombres de Tablas
- **Problema**: Requiere cambiar todas las queries
- **Problema**: Más difícil de mantener

### ✅ Opción 3: Schemas PostgreSQL (ELEGIDA)
- **Ventaja**: Separación completa sin cambiar queries
- **Ventaja**: Fácil de cambiar con variable de entorno
- **Ventaja**: Misma base, sin costo adicional

## 🎯 Próximos Pasos

1. **Revisar esta propuesta** y aprobar
2. **Crear scripts SQL** para setup del schema dev
3. **Modificar código** para usar schema dinámico
4. **Probar en desarrollo** antes de merge a main
5. **Deploy a producción** con schema public

---

**¿Aprobamos esta propuesta y avanzamos con la implementación?**

