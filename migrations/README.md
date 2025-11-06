# Migraciones de Base de Datos

Este directorio contiene scripts SQL para migraciones de la base de datos.

## Uso

### Ejecutar migración en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `.sql` correspondiente
4. Ejecuta el script

### Migraciones disponibles

#### `add_enable_botonera_to_users.sql`
Agrega el campo `enable_botonera` (boolean, default: false) a la tabla `users` para controlar la visibilidad de la botonera de navegación en desarrollo.

**Ejecutar:** 
```sql
-- Ver contenido del archivo add_enable_botonera_to_users.sql
```

## Notas

- Las migraciones son idempotentes (se pueden ejecutar múltiples veces sin problemas)
- Siempre verifica que la migración se haya aplicado correctamente antes de continuar
- En producción, considera hacer backup antes de ejecutar migraciones

