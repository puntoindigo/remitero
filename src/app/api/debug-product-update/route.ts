import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { productId, categoryId } = body;

    console.log("Debug product update:", { productId, categoryId, session: session.user });

    // Verificar que el producto existe
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, category_id, company_id')
      .eq('id', productId)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json({ 
        error: "Producto no encontrado",
        message: "El producto solicitado no existe."
      }, { status: 404 });
    }

    console.log("Existing product:", existingProduct);

    // Verificar autorización
    if (session.user.role !== 'SUPERADMIN' && existingProduct.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para acceder a este producto."
      }, { status: 403 });
    }

    // Actualizar el producto
    const updateData = {
      category_id: categoryId || null
    };

    console.log("Update data:", updateData);

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select(`
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at,
        company_id,
        category_id,
        categories (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el producto.",
        details: error
      }, { status: 500 });
    }

    console.log("Updated product:", updatedProduct);

    return NextResponse.json({
      success: true,
      message: "Producto actualizado correctamente",
      product: updatedProduct
    });
  } catch (error: any) {
    console.error('Error in debug product update:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado.",
      details: error.message
    }, { status: 500 });
  }
}
