# 📋 Configurar Variables de Entorno en Vercel

Esta guía te ayudará a configurar las variables de entorno en Vercel para separar correctamente los schemas de desarrollo y producción.

---

## 🎯 Objetivo

Configurar `DATABASE_SCHEMA` en Vercel para que:
- **Producción** (`v0-remitero.vercel.app`) use schema `public`
- **Desarrollo** (`remitero-dev.vercel.app`) use schema `dev`

---

## ✅ Checklist de Tareas

```task-checkbox
{"taskId":"vercel-vars-1","label":"Acceder a Vercel Dashboard y seleccionar el proyecto"}
```

```task-checkbox
{"taskId":"vercel-vars-2","label":"Ir a Settings → Environment Variables"}
```

```task-checkbox
{"taskId":"vercel-vars-3","label":"Configurar DATABASE_SCHEMA=public para Production"}
```

```task-checkbox
{"taskId":"vercel-vars-4","label":"Configurar DATABASE_SCHEMA=dev para Preview/Development"}
```

```task-checkbox
{"taskId":"vercel-vars-5","label":"Hacer redeploy de Production"}
```

```task-checkbox
{"taskId":"vercel-vars-6","label":"Hacer redeploy de Preview/Development"}
```

```task-checkbox
{"taskId":"vercel-vars-7","label":"Verificar en /api/debug/schema que cada entorno usa el schema correcto"}
```

---

## 📍 Paso 1: Acceder a Vercel Dashboard

1. Abre tu navegador
2. Ve a: [https://vercel.com/dashboard](https://vercel.com/dashboard)
3. **Inicia sesión** con tu cuenta de Vercel
4. Busca y **selecciona tu proyecto** (probablemente se llama "remitero" o "v0-remitero")

---

## 📍 Paso 2: Ir a Configuración de Variables de Entorno

1. En el menú lateral izquierdo, busca y haz clic en **"Settings"** (Configuración)
   - Si no ves el menú lateral, haz clic en el icono de menú (☰) en la esquina superior izquierda

2. En el submenú de Settings, busca y haz clic en **"Environment Variables"** (Variables de Entorno)
   - Está en la sección "General" o "Configuration"

---

## 📍 Paso 3: Configurar para Production

### 3.1. Verificar si ya existe

1. En la lista de variables, busca si ya existe una variable llamada `DATABASE_SCHEMA`
2. Si existe:
   - Verifica en qué entornos está configurada (Production, Preview, Development)
   - Si está en Production con valor `public` → ✅ Está bien, no toques nada
   - Si está en Production con valor `dev` → ❌ Necesitas cambiarla (ver 3.2)
   - Si NO está en Production → Necesitas agregarla (ver 3.2)

### 3.2. Crear o Modificar

1. Si no existe o necesitas crearla:
   - Haz clic en el botón **"Add New"** (Agregar Nueva) en la parte superior derecha
   
2. Si ya existe pero está mal configurada:
   - Haz clic en la variable `DATABASE_SCHEMA`
   - Haz clic en **"Edit"** (Editar)

3. Configura los valores:
   - **Key** (Clave): `DATABASE_SCHEMA`
   - **Value** (Valor): `public`
   - **Environment** (Entorno): 
     - ✅ Marca SOLO **Production**
     - ❌ NO marques Preview
     - ❌ NO marques Development

4. Haz clic en **"Save"** (Guardar)

---

## 📍 Paso 4: Configurar para Preview/Development

### 4.1. Verificar si ya existe

1. En la misma lista de variables, busca `DATABASE_SCHEMA` para Preview/Development
2. Si existe:
   - Si tiene valor `dev` y está en Preview/Development → ✅ Está bien
   - Si tiene valor `public` y está en Preview/Development → ❌ Necesitas cambiarla

### 4.2. Crear o Modificar

1. Si no existe o necesitas crearla:
   - Haz clic en **"Add New"** (Agregar Nueva)
   
2. Si ya existe pero está mal:
   - Haz clic en la variable
   - Haz clic en **"Edit"** (Editar)

3. Configura los valores:
   - **Key**: `DATABASE_SCHEMA`
   - **Value**: `dev`
   - **Environment**:
     - ✅ Marca **Preview**
     - ✅ Marca **Development**
     - ❌ NO marques Production

4. Haz clic en **"Save"** (Guardar)

---

## 📍 Paso 5: Verificar Configuración

Después de guardar, deberías ver en la lista:

```
DATABASE_SCHEMA = public
  └─ Production

DATABASE_SCHEMA = dev
  └─ Preview, Development
```

O si está todo en una sola variable (no recomendado):

```
DATABASE_SCHEMA = public (Production)
DATABASE_SCHEMA = dev (Preview, Development)
```

---

## 📍 Paso 6: Redeploy

### 6.1. Redeploy Production

1. Ve a la pestaña **"Deployments"** (Despliegues) en el menú lateral
2. Encuentra el deployment más reciente que tenga el badge **"Production"**
3. Haz clic en los **tres puntos** (⋯) a la derecha del deployment
4. Selecciona **"Redeploy"** (Redesplegar)
5. En el modal que aparece:
   - Opcional: Marca **"Use existing Build Cache"** para que sea más rápido
   - Haz clic en **"Redeploy"**
6. Espera 1-3 minutos a que complete

### 6.2. Redeploy Preview/Development

1. En la misma página de Deployments
2. Encuentra el deployment más reciente que tenga el badge **"Preview"** o **"Development"**
3. Repite los pasos 3-6 del 6.1

---

## 📍 Paso 7: Verificar que Funcionó

### 7.1. Esperar a que Complete el Redeploy

- Espera 1-3 minutos después de hacer clic en "Redeploy"
- Verás el progreso en tiempo real
- Cuando termine, verás un ✅ verde

### 7.2. Verificar en Desarrollo

1. Abre: `https://remitero-dev.vercel.app/api/debug/schema`
2. Deberías ver:
   ```json
   {
     "schema": "dev",
     "isDevelopmentByHost": true,
     ...
   }
   ```

### 7.3. Verificar en Producción

**Nota**: El endpoint `/api/debug/schema` puede no estar disponible en producción todavía porque el código está solo en `develop`. Si da 404, necesitarás hacer merge a `main` primero.

1. Abre: `https://v0-remitero.vercel.app/api/debug/schema`
2. Si funciona, deberías ver:
   ```json
   {
     "schema": "public",
     "isProductionByHost": true,
     ...
   }
   ```

---

## 🔍 Paso 8: Verificar en Logs de Vercel

### 8.1. Ver Logs de Production

1. Ve a **Deployments** → Selecciona el deployment de Production más reciente
2. Haz clic en **"Logs"** (Registros)
3. Busca líneas que digan: `🗄️ [Supabase] Schema detectado:`
4. Deberías ver:
   ```
   🗄️ [Supabase] Schema detectado: public {
     databaseSchemaEnv: 'public',
     finalSchema: 'public'
   }
   ```

### 8.2. Ver Logs de Development

1. Ve a **Deployments** → Selecciona el deployment de Preview/Development más reciente
2. Haz clic en **"Logs"**
3. Busca: `🗄️ [Supabase] Schema detectado:`
4. Deberías ver:
   ```
   🗄️ [Supabase] Schema detectado: dev {
     databaseSchemaEnv: 'dev',
     finalSchema: 'dev'
   }
   ```

---

## ⚠️ Solución de Problemas

### Problema: No puedo encontrar "Environment Variables"

**Solución**:
1. Asegúrate de estar en la página de **Settings** (Configuración)
2. Busca en el submenú: "Environment Variables", "Variables", o "Env Vars"
3. Si no lo encuentras, intenta usar la búsqueda de Vercel (barra de búsqueda superior)

### Problema: No puedo editar una variable existente

**Solución**:
1. Haz clic en la variable para expandirla
2. Verás opciones: "Edit", "Delete", etc.
3. Si no ves "Edit", puede que necesites permisos de administrador

### Problema: El redeploy no aplica los cambios

**Solución**:
1. Verifica que guardaste los cambios en las variables de entorno
2. Espera unos minutos y vuelve a intentar el redeploy
3. Verifica en los logs que la variable esté disponible

### Problema: Sigue mostrando el schema incorrecto

**Solución**:
1. Verifica que el redeploy haya completado
2. Espera 1-2 minutos adicionales (puede haber cache)
3. Verifica los logs de Vercel para ver qué schema se está usando
4. Si el problema persiste, verifica que la variable esté configurada para el entorno correcto

---

## 📝 Resumen Visual

```
Vercel Dashboard
└─ Tu Proyecto
   └─ Settings
      └─ Environment Variables
         ├─ DATABASE_SCHEMA = public (✅ Production)
         └─ DATABASE_SCHEMA = dev (✅ Preview, ✅ Development)
```

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, desarrollo y producción estarán usando schemas diferentes y podrás trabajar con tranquilidad.

