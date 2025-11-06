import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformProduct } from "@/lib/utils/supabase-transform";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: productId } = await params;
    const body = await request.json();
    const { name, description, price, stock, categoryId } = body;

    // Verificar que el producto existe y el usuario tiene acceso
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, company_id')
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

    // Preparar datos de actualización
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      if (price <= 0) {
        return NextResponse.json({ 
          error: "Precio inválido", 
          message: "El precio debe ser mayor a 0." 
        }, { status: 400 });
      }
      updateData.price = parseFloat(price);
    }
    if (stock !== undefined) {
      if (!['IN_STOCK', 'OUT_OF_STOCK'].includes(stock)) {
        return NextResponse.json({ 
          error: "Estado de stock inválido", 
          message: "El estado de stock debe ser 'IN_STOCK' o 'OUT_OF_STOCK'." 
        }, { status: 400 });
      }
      updateData.stock = stock;
    }
    if (categoryId !== undefined) updateData.category_id = categoryId || null;

    // Verificar que el nombre no esté en uso por otro producto de la misma empresa
    if (name && name !== existingProduct?.name) {
      const { data: nameProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('company_id', existingProduct.company_id)
        .eq('name', name)
        .neq('id', productId)
        .single();

      if (nameProduct) {
        return NextResponse.json({ 
          error: "Nombre en uso", 
          message: "Ya existe otro producto con este nombre en la empresa." 
        }, { status: 409 });
      }
    }

    // Optimización: Sin JOIN de categories en UPDATE
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
        category_id
      `)
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el producto."
      }, { status: 500 });
    }

    // Obtener el nombre de la categoría si existe
    let categoryName = '';
    if (updatedProduct.category_id) {
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('id', updatedProduct.category_id)
        .single();
      
      if (category) {
        categoryName = category.name;
      }
    }

    // Agregar category structure con nombre real
    const productWithCategory = {
      ...updatedProduct,
      categories: updatedProduct.category_id ? { id: updatedProduct.category_id, name: categoryName } : null
    };

    return NextResponse.json(transformProduct(productWithCategory));
  } catch (error: any) {
    console.error('Error in products PUT:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: productId } = await params;

    // Verificar que el producto existe y el usuario tiene acceso
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
        message: "No tienes permisos para eliminar este producto."
      }, { status: 403 });
    }

    // Verificar si el producto está siendo usado en remitos
    const { data: remitoItems } = await supabaseAdmin
      .from('remito_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (remitoItems && remitoItems?.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar",
        message: "Este producto está siendo utilizado en remitos y no puede ser eliminado."
      }, { status: 409 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar el producto."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Producto eliminado correctamente",
      success: true 
    });
  } catch (error: any) {
    console.error('Error in products DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
