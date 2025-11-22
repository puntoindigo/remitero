# Diagnóstico: Imágenes WebP no se muestran

## Problema
Las imágenes WebP se guardan correctamente pero no se muestran en la tabla de productos.

## Posibles Causas y Soluciones

### 1. Bucket no configurado como público

**Síntoma**: La imagen se sube pero la URL no es accesible públicamente.

**Solución**:
1. Ve a Supabase Dashboard → Storage
2. Selecciona el bucket `product-images`
3. Verifica que esté marcado como **"Public bucket"**
4. Si no lo está, edita el bucket y actívalo

### 2. Políticas RLS no configuradas

**Síntoma**: Error 403 al intentar acceder a la imagen.

**Solución**: Ejecuta estas políticas en el SQL Editor de Supabase:

```sql
-- Política para permitir lectura pública (MUY IMPORTANTE)
CREATE POLICY "Public Access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Si la política ya existe, elimínala primero:
-- DROP POLICY IF EXISTS "Public Access for product images" ON storage.objects;
```

### 3. Content-Type incorrecto

**Síntoma**: El navegador no reconoce el archivo como imagen WebP.

**Solución**: El código ya está actualizado para detectar automáticamente el Content-Type. Verifica en los logs del servidor que se esté usando `image/webp`.

### 4. Verificar la URL generada

**Pasos para diagnosticar**:

1. **Abre la consola del navegador** (F12)
2. **Sube una imagen WebP**
3. **Revisa los logs**:
   - En la consola del navegador, busca: `Image loaded successfully:` o `Error loading product image:`
   - En los logs del servidor (terminal), busca: `Image uploaded successfully:`

4. **Copia la URL de la imagen** que aparece en los logs
5. **Abre la URL en una nueva pestaña** del navegador
   - Si se muestra la imagen: El problema está en cómo se renderiza en la tabla
   - Si da error 403: El bucket no es público o faltan políticas RLS
   - Si da error 404: El archivo no se subió correctamente

### 5. Verificar en la base de datos

Ejecuta esta query en Supabase SQL Editor:

```sql
SELECT id, name, image_url 
FROM products 
WHERE image_url IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 5;
```

Verifica que:
- El campo `image_url` tenga un valor
- La URL tenga el formato correcto: `https://[proyecto].supabase.co/storage/v1/object/public/product-images/...`
- La URL termine en `.webp` si es una imagen WebP

### 6. Verificar CORS

Si ves errores de CORS en la consola:

1. Ve a Supabase Dashboard → Storage → Settings
2. Verifica que CORS esté configurado para permitir tu dominio
3. O agrega esta configuración en el código (si es necesario)

### 7. Probar con otro formato

Para aislar el problema:
1. Intenta subir una imagen PNG o JPEG
2. Si funciona con PNG/JPEG pero no con WebP, el problema es específico de WebP
3. Si no funciona con ningún formato, el problema es más general (bucket, políticas, etc.)

## Comandos de Diagnóstico

### En la consola del navegador:

```javascript
// Ver todas las imágenes de productos cargadas
const productos = document.querySelectorAll('img[src*="supabase"]');
console.log('Imágenes encontradas:', productos.length);
productos.forEach((img, i) => {
  console.log(`Imagen ${i + 1}:`, img.src);
  img.onerror = () => console.error('Error cargando:', img.src);
});
```

### Verificar respuesta del servidor:

Abre la pestaña Network en DevTools:
1. Filtra por "Img" o busca la URL de la imagen
2. Haz clic en la petición
3. Revisa:
   - **Status Code**: Debe ser 200
   - **Response Headers**: Debe incluir `Content-Type: image/webp`
   - **Preview**: Debe mostrar la imagen

## Solución Rápida

Si necesitas una solución temporal mientras diagnosticas:

1. **Convierte WebP a PNG/JPEG** antes de subir desde Canva
2. O usa un servicio de conversión online
3. Una vez que identifiques el problema, podrás usar WebP directamente

## Logs a Revisar

### En el servidor (terminal):
```
Image uploaded successfully: {
  fileName: 'products/.../timestamp-random.webp',
  contentType: 'image/webp',
  fileExtension: 'webp',
  publicUrl: 'https://...',
  bucketName: 'product-images'
}
```

### En el navegador (consola):
```
Image loaded successfully: https://...
```
o
```
Error loading product image: {
  imageUrl: 'https://...',
  productName: '...',
  productId: '...'
}
```

## Checklist de Verificación

- [ ] Bucket `product-images` existe en Supabase
- [ ] Bucket está marcado como **público**
- [ ] Política RLS de lectura pública está configurada
- [ ] La URL en la base de datos es correcta
- [ ] La URL es accesible en una nueva pestaña
- [ ] El Content-Type es `image/webp` en los headers
- [ ] No hay errores de CORS en la consola
- [ ] Las imágenes PNG/JPEG funcionan correctamente

---

**Si después de verificar todo esto las imágenes WebP aún no se muestran**, comparte:
1. La URL de la imagen (de la base de datos)
2. El error exacto de la consola del navegador
3. Los logs del servidor al subir la imagen

