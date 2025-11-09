# Configuración para Vercel

## Variables de Entorno Requeridas

Para que el sistema funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno:

### 1. Base de Datos
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. NextAuth
```
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-key-seguro-aqui
```

### 3. Opcional: Prisma Accelerate
```
PRISMA_ACCELERATE_URL=tu-prisma-accelerate-url
```

## Cómo configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Agrega las variables de entorno listadas arriba
4. Asegúrate de que estén configuradas para Production, Preview y Development

## Generar NEXTAUTH_SECRET

Puedes generar un secret seguro con:
```bash
openssl rand -base64 32
```

## Base de Datos

Asegúrate de que tu base de datos PostgreSQL esté:
- Accesible desde Vercel
- Con las tablas creadas (ejecuta las migraciones)
- Con datos iniciales (ejecuta el seed)

## Comandos de Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Ejecutar seed (opcional)
npx prisma db seed
```

## Verificar Configuración

Después de configurar las variables de entorno:
1. Redespliega la aplicación
2. Verifica que no haya errores en los logs de Vercel
3. Intenta acceder a la aplicación
