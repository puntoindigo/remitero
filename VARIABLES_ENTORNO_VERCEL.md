# 📋 Variables de Entorno para Vercel

## ✅ Variables NECESARIAS (agregar si faltan)

### Google OAuth (CRÍTICO - Faltan en Development)

**Client ID (ya lo tienes):**
```
GOOGLE_CLIENT_ID=117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com
```

**Client Secret (OBTENER DESDE GOOGLE CLOUD CONSOLE):**
```
GOOGLE_CLIENT_SECRET=[Ver instrucciones detalladas abajo]
```

**Dónde obtenerlas:**
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Haz clic en tu cliente OAuth "remitero"
3. En la sección "Secreto del cliente", haz clic en el ícono del ojo para revelar el secreto
4. Copia el valor completo (empieza con `GOCSPX-`)
5. **IMPORTANTE**: Agrega estas variables para **Development**, **Preview** y **Production**

### NextAuth (Ya configurado, pero verificar)
```
NEXTAUTH_URL=https://remitero-dev.vercel.app
NEXTAUTH_SECRET=[Ya configurado - no cambiar]
```

### Supabase (Ya configuradas ✅)
```
NEXT_PUBLIC_SUPABASE_URL=[Ya configurado]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Ya configurado]
SUPABASE_SERVICE_ROLE_KEY=[Ya configurado]
SUPABASE_JWT_SECRET=[Ya configurado]
```

---

## ❌ Variables que NO SE USAN (pueden eliminarse)

### Variables de Prisma/Postgres (No se usan - Next.js usa Supabase directamente)
- ❌ `POSTGRES_URL` - No se usa
- ❌ `POSTGRES_PRISMA_URL` - No se usa
- ❌ `POSTGRES_URL_NON_POOLING` - No se usa
- ❌ `POSTGRES_USER` - No se usa
- ❌ `POSTGRES_PASSWORD` - No se usa
- ❌ `POSTGRES_DATABASE` - No se usa
- ❌ `POSTGRES_HOST` - No se usa
- ❌ `DATABASE_URL` - No se usa (solo en Preview, puede eliminarse)

### Variables que pueden estar obsoletas
- ⚠️ `SUPABASE_ANON_KEY` - Verificar si se usa (probablemente es `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

---

## 🔧 Instrucciones para obtener GOOGLE_CLIENT_SECRET

⚠️ **IMPORTANTE**: Google ya no permite ver secretos existentes por seguridad. Si no tienes el secreto completo guardado, necesitas crear uno nuevo.

### Opción A: Si ya tienes el secreto guardado
- Úsalo directamente en Vercel

### Opción B: Si NO tienes el secreto (crear uno nuevo)

1. **Abre Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **Selecciona tu proyecto** (si no está seleccionado)

3. **Haz clic en tu cliente OAuth "remitero"**

4. **En la sección "Secretos del cliente" (columna derecha):**
   - Haz clic en el botón **"+ Add secret"** (Agregar secreto)
   - Google te mostrará el nuevo secreto completo **UNA SOLA VEZ**
   - ⚠️ **COPIA EL VALOR INMEDIATAMENTE** - No podrás verlo de nuevo
   - El secreto empieza con `GOCSPX-`
   - Ejemplo: `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45pqr678stu901vwx234yz`

5. **Guarda el secreto de forma segura** (en un gestor de contraseñas o similar)

6. **Agrega en Vercel:**
   - Ve a Settings → Environment Variables
   - Agrega `GOOGLE_CLIENT_SECRET` con el valor copiado
   - Selecciona **Development**, **Preview** y **Production**
   - Guarda

7. **Redeploy en Vercel:**
   - Después de guardar las variables, Vercel te ofrecerá hacer un redeploy
   - O ve a la pestaña "Deployments" y haz clic en "Redeploy" en el último deployment
   - ⚠️ **NO necesitas hacer commit** - Solo redeploy

---

## 📝 Checklist para agregar en Vercel

- [ ] `GOOGLE_CLIENT_ID` - Para Development, Preview y Production
- [ ] `GOOGLE_CLIENT_SECRET` - Para Development, Preview y Production (crear nuevo secreto en Google Cloud Console si no lo tienes)
- [ ] `NEXTAUTH_URL` - Verificar que esté para Development (debe ser `https://remitero-dev.vercel.app`)
- [ ] **Redeploy en Vercel** después de agregar las variables (no necesitas commit)

---

## 🧹 Limpieza recomendada

Puedes eliminar estas variables de Vercel (no se usan):
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_HOST`
- `DATABASE_URL` (si solo está en Preview)

Esto ayudará a mantener la configuración limpia y evitar confusiones.

