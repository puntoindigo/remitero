import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Endpoint para subir imágenes de productos a Supabase Storage
 * 
 * POST /api/products/upload-image
 * 
 * Body (FormData):
 * - file: Archivo de imagen
 * - productId: ID del producto (opcional, para actualizar imagen existente)
 * 
 * Retorna:
 * - imageUrl: URL pública de la imagen subida
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Verificar que el usuario tenga companyId (excepto SUPERADMIN)
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string | null;

    if (!file) {
      return NextResponse.json({ 
        error: "Archivo faltante", 
        message: "No se proporcionó ningún archivo." 
      }, { status: 400 });
    }

    // Validar tipo de archivo - incluir WebP explícitamente y validar por extensión también
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileNameLower = file.name.toLowerCase();
    const fileExtensionForValidation = fileNameLower.substring(fileNameLower.lastIndexOf('.'));
    
    // Validar por tipo MIME y por extensión (algunos navegadores no detectan bien WebP)
    const isValidType = validImageTypes.includes(file.type) || 
                        validExtensions.includes(fileExtensionForValidation);
    
    if (!isValidType) {
      return NextResponse.json({ 
        error: "Tipo de archivo inválido", 
        message: `Solo se permiten imágenes (JPEG, PNG, WebP, GIF). Tipo detectado: ${file.type || 'desconocido'}, Extensión: ${fileExtensionForValidation}` 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "Archivo muy grande", 
        message: "El archivo no puede ser mayor a 5MB." 
      }, { status: 400 });
    }

    // Si hay productId, verificar que el producto existe y el usuario tiene acceso
    if (productId) {
      const { data: existingProduct, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('id, company_id')
        .eq('id', productId)
        .single();

      if (fetchError || !existingProduct) {
        return NextResponse.json({ 
          error: "Producto no encontrado",
          message: "El producto solicitado no existe o no tienes permisos para acceder a él."
        }, { status: 404 });
      }

      // Verificar autorización para usuarios no SUPERADMIN
      if (session.user.role !== 'SUPERADMIN' && existingProduct.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado",
          message: "No tienes permisos para acceder a este producto."
        }, { status: 403 });
      }
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    // Detectar extensión del archivo original, o inferirla del tipo MIME
    let fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExtension)) {
      // Inferir extensión del tipo MIME si no se puede obtener de la extensión
      if (file.type === 'image/webp') fileExtension = 'webp';
      else if (file.type === 'image/jpeg' || file.type === 'image/jpg') fileExtension = 'jpg';
      else if (file.type === 'image/png') fileExtension = 'png';
      else if (file.type === 'image/gif') fileExtension = 'gif';
      else fileExtension = 'jpg'; // Por defecto
    }
    const fileName = `products/${productId || 'temp'}/${timestamp}-${randomString}.${fileExtension}`;

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Asegurar que el Content-Type sea correcto, especialmente para WebP
    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      // Si el tipo no está disponible, inferirlo de la extensión
      if (fileExtension === 'webp') contentType = 'image/webp';
      else if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
      else if (fileExtension === 'png') contentType = 'image/png';
      else if (fileExtension === 'gif') contentType = 'image/gif';
      else contentType = 'image/jpeg'; // Por defecto
    }

    // Subir a Supabase Storage
    const bucketName = 'product-images'; // Nombre del bucket en Supabase Storage
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: false, // No sobrescribir si existe
        cacheControl: '3600', // Cache por 1 hora
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      
      // Si el bucket no existe, crear un mensaje más claro
      if (uploadError.message?.includes('Bucket not found')) {
        return NextResponse.json({ 
          error: "Bucket no configurado",
          message: "El bucket 'product-images' no existe en Supabase Storage. Por favor, créalo primero en el panel de Supabase."
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: "Error al subir imagen",
        message: uploadError.message || "No se pudo subir la imagen."
      }, { status: 500 });
    }

    // Obtener URL pública de la imagen
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully:', {
      fileName,
      originalContentType: file.type,
      detectedContentType: contentType,
      fileExtension,
      publicUrl,
      bucketName
    });

    return NextResponse.json({ 
      imageUrl: publicUrl,
      fileName: fileName,
      success: true
    });
  } catch (error: any) {
    console.error('Error in upload-image POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message || "Ocurrió un error inesperado al subir la imagen."
    }, { status: 500 });
  }
}

/**
 * Endpoint para eliminar imágenes de productos
 * 
 * DELETE /api/products/upload-image?imageUrl=...
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "URL faltante", 
        message: "No se proporcionó la URL de la imagen." 
      }, { status: 400 });
    }

    // Extraer el nombre del archivo de la URL
    // La URL de Supabase Storage tiene formato: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'public') + 1;
    const fileName = urlParts.slice(bucketIndex + 1).join('/');

    if (!fileName) {
      return NextResponse.json({ 
        error: "URL inválida", 
        message: "No se pudo extraer el nombre del archivo de la URL." 
      }, { status: 400 });
    }

    const bucketName = 'product-images';
    
    const { error: deleteError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .remove([fileName]);

    if (deleteError) {
      console.error('Error deleting image:', deleteError);
      return NextResponse.json({ 
        error: "Error al eliminar imagen",
        message: deleteError.message || "No se pudo eliminar la imagen."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Imagen eliminada correctamente"
    });
  } catch (error: any) {
    console.error('Error in upload-image DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message || "Ocurrió un error inesperado al eliminar la imagen."
    }, { status: 500 });
  }
}

