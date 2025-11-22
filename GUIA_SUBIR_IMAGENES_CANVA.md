# Guía: Cómo Subir Imágenes de Productos desde Canva

Esta guía explica cómo subir imágenes de productos desde Canva a tu sistema de gestión de remitos.

## 📋 Requisitos Previos

1. **Bucket de Supabase Storage configurado**
   - Debes tener un bucket llamado `product-images` en tu proyecto de Supabase
   - El bucket debe estar configurado como público para que las imágenes sean accesibles

2. **Migración de base de datos aplicada**
   - Ejecuta la migración `migrations/add_image_url_to_products.sql` en ambos schemas (public y dev)

## 🎨 Proceso desde Canva

### Paso 1: Exportar la imagen desde Canva

1. Abre tu diseño en Canva
2. Selecciona el elemento de producto que quieres exportar
3. Haz clic derecho sobre el elemento y selecciona **"Descargar"** o usa el botón de descarga
4. Elige el formato:
   - **Recomendado**: PNG (mejor calidad para productos)
   - **Alternativa**: JPEG (archivos más pequeños)
5. Selecciona la calidad:
   - **Recomendado**: Alta calidad
   - **Tamaño**: El tamaño recomendado es entre 500x500px y 2000x2000px

### Paso 2: Guardar la imagen

1. Guarda la imagen en una ubicación fácil de encontrar (por ejemplo, tu Escritorio)
2. **Consejo**: Nombra el archivo con el nombre del producto para facilitar la identificación
   - Ejemplo: `arroz-apostoles.png`, `cacao-toddy.jpg`

### Paso 3: Subir la imagen en el sistema

1. Abre el formulario de edición del producto en tu sistema
2. En la sección **"Imagen del producto"**:
   - **Opción A**: Arrastra y suelta la imagen directamente en el área de carga
   - **Opción B**: Haz clic en el área de carga y selecciona el archivo desde tu computadora
3. Verás una vista previa de la imagen
4. Si necesitas cambiar la imagen:
   - Haz clic en el botón **"Cambiar imagen"** (icono de papelera)
   - O simplemente arrastra una nueva imagen
5. Completa el resto del formulario y haz clic en **"Actualizar"** o **"Guardar"**

## 📝 Especificaciones Técnicas

### Formatos Soportados
- ✅ JPEG / JPG
- ✅ PNG
- ✅ WebP
- ✅ GIF

### Límites
- **Tamaño máximo**: 5MB por imagen
- **Resolución recomendada**: 500x500px a 2000x2000px
- **Formato recomendado**: PNG para transparencias, JPEG para fotografías

### Ubicación de Almacenamiento
Las imágenes se almacenan en Supabase Storage en el bucket `product-images` con la siguiente estructura:
```
product-images/
  └── products/
      └── [product-id]/
          └── [timestamp]-[random].jpg
```

## 🔧 Configuración del Bucket en Supabase

Si aún no has configurado el bucket, sigue estos pasos:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Configura:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Activado (para que las imágenes sean accesibles públicamente)
   - **File size limit**: 5242880 (5MB)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,image/gif`
5. Haz clic en **"Create bucket"**

### Configurar Políticas de Seguridad (RLS)

Para que los usuarios puedan subir imágenes, necesitas configurar políticas RLS:

```sql
-- Política para permitir lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política para permitir subida a usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

## 🚀 Flujo Completo de Trabajo

### Para un Producto Nuevo:
1. Diseña la imagen del producto en Canva
2. Exporta la imagen en formato PNG o JPEG
3. Crea el producto en el sistema
4. Arrastra la imagen al formulario
5. Completa los demás campos (nombre, precio, categoría)
6. Guarda el producto

### Para Actualizar un Producto Existente:
1. Abre el producto que quieres editar
2. Si ya tiene imagen:
   - Puedes mantenerla (no hagas nada)
   - O cambiarla (haz clic en "Cambiar imagen" y selecciona una nueva)
3. Si no tiene imagen:
   - Exporta la imagen desde Canva
   - Arrastra la imagen al formulario
4. Actualiza cualquier otro campo necesario
5. Guarda los cambios

## 💡 Consejos y Mejores Prácticas

### Optimización de Imágenes
- **Antes de subir**: Considera optimizar las imágenes para web
- **Herramientas recomendadas**:
  - [TinyPNG](https://tinypng.com/) - Comprime PNG y JPEG
  - [Squoosh](https://squoosh.app/) - Optimizador de imágenes de Google
- **Tamaño recomendado**: 800x800px a 1200x1200px es suficiente para la mayoría de casos

### Nomenclatura de Archivos
- Usa nombres descriptivos: `arroz-apostoles-1kg.png`
- Evita espacios y caracteres especiales
- El sistema generará automáticamente un nombre único

### Organización en Canva
- Crea una carpeta en Canva para cada categoría de productos
- Mantén un diseño consistente para todos los productos
- Guarda los diseños originales en Canva para futuras ediciones

## ❓ Solución de Problemas

### Error: "Bucket no configurado"
- **Solución**: Crea el bucket `product-images` en Supabase Storage (ver sección de configuración arriba)

### Error: "El archivo no puede ser mayor a 5MB"
- **Solución**: Comprime la imagen usando TinyPNG o Squoosh antes de subirla

### Error: "Solo se permiten imágenes"
- **Solución**: Asegúrate de exportar la imagen en formato JPEG, PNG, WebP o GIF desde Canva

### La imagen no se muestra después de subirla
- **Verifica**: Que el bucket esté configurado como público
- **Verifica**: Que las políticas RLS permitan lectura pública
- **Verifica**: La consola del navegador para ver errores de CORS

### No puedo eliminar una imagen
- **Solución**: Verifica que las políticas RLS permitan eliminación para usuarios autenticados

## 📚 Recursos Adicionales

- [Documentación de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Guía de Canva para Exportar](https://www.canva.com/help/export-designs/)
- [Optimización de Imágenes para Web](https://web.dev/fast/#optimize-your-images)

---

**Nota**: Esta funcionalidad está disponible tanto para crear nuevos productos como para editar productos existentes. Las imágenes se almacenan de forma segura en Supabase Storage y se asocian automáticamente con cada producto.

