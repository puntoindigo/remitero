# 🚀 Inicio Rápido: Google OAuth

## Opción A: Solo localhost (Desarrollo)

1. **Agregar localhost en Google Cloud Console:**
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Edita tu cliente OAuth "remitero"
   - En "Orígenes autorizados de JavaScript": Agrega `http://localhost:8000`
   - En "URIs de redireccionamiento": Agrega `http://localhost:8000/api/auth/callback/google`
   - Guarda

2. **Crear `.env.local` en la raíz:**
```bash
GOOGLE_CLIENT_ID="117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-tu-secret-aqui"
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="tu-secret-aqui"
```

3. **Reiniciar servidor:**
```bash
npm run dev
```

✅ **Listo para usar en localhost**

---

## Opción B: Deploy en Vercel (Producción/Preview)

### Ya tienes las URIs configuradas ✅

Tus URIs de Vercel ya están en Google Cloud Console:
- ✅ `https://remitero-dev.vercel.app`
- ✅ `https://v0-remitero.vercel.app`

### Solo falta agregar variables en Vercel:

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto
   - Settings → Environment Variables

2. **Agrega estas variables** (para Production, Preview y Development):

```bash
GOOGLE_CLIENT_ID=117638263113-52cdt45e15gss3f2usl8v5p3q6s1bres.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-secret-aqui
NEXTAUTH_URL=https://remitero-dev.vercel.app
NEXTAUTH_SECRET=tu-secret-aqui
```

3. **Hacer deploy:**
```bash
git add .
git commit -m "Agregar Google OAuth"
git push origin develop
```

✅ **Vercel hará deploy automáticamente y funcionará**

---

## 💡 Recomendación

**Usa AMBAS opciones:**
- **Localhost** para desarrollo rápido
- **Vercel** para probar en producción

Solo necesitas tener todas las URIs en Google Cloud Console (ya las tienes para Vercel, solo falta agregar localhost).

