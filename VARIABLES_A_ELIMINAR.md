# 🗑️ Variables de Entorno que se pueden ELIMINAR

## ✅ Confirmación

El código **solo usa Supabase**, no Prisma ni conexiones directas a PostgreSQL.

## ❌ Variables que puedes ELIMINAR de Vercel

### Variables de Postgres (No se usan)
- ❌ `POSTGRES_PASSWORD`
- ❌ `POSTGRES_DATABASE`
- ❌ `POSTGRES_HOST`
- ❌ `POSTGRES_USER` (si existe)
- ❌ `POSTGRES_URL` (si existe)
- ❌ `POSTGRES_PRISMA_URL` (si existe)
- ❌ `POSTGRES_URL_NON_POOLING` (si existe)

### Variables de Prisma (No se usan)
- ❌ `DATABASE_URL` (Development, Preview, Production)
- ❌ `prod_PRISMA_DATABASE_URL`
- ❌ `dev_PRISMA_DATABASE_URL` (si existe)
- ❌ `dev_POSTGRES_URL` (si existe)
- ❌ `prod_POSTGRES_URL` (si existe)

### Variables de Supabase obsoletas (Verificar)
- ⚠️ `SUPABASE_ANON_KEY` - Verificar si se usa (probablemente es `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## ✅ Variables que SÍ se usan (NO eliminar)

### Supabase (Mantener)
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_JWT_SECRET`

### NextAuth (Mantener)
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`

### Google OAuth (Mantener)
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`

## 📝 Cómo eliminar en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Para cada variable a eliminar:
   - Haz clic en los **3 puntos** (⋯) a la derecha
   - Selecciona **"Remove"**
   - Confirma

## ⚠️ Importante

- Estas variables son de **Prisma**, que se usó en algún momento pero **ya no se usa**
- El código actual **solo usa Supabase** directamente
- Eliminar estas variables **no afectará** el funcionamiento de la aplicación
- Ayudará a mantener la configuración **limpia y clara**

