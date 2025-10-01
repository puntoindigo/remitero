import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformCategory } from "@/lib/utils/supabase-transform";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const categoryId = params.id;
    const body = await request.json();
    const { name } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre de la categoría es requerido." 
      }, { status: 400 });
    }

    // Verificar que la categoría existe y el usuario tiene acceso
    const { data: existingCategory, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id, name, company_id')
      .eq('id', categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ 
        error: "Categoría no encontrada",
        message: "La categoría solicitada no existe o no tienes permisos para acceder a ella."
      }, { status: 404 });
    }

    // Verificar autorización para usuarios no SUPERADMIN
    if (session.user.role !== 'SUPERADMIN' && existingCategory.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para acceder a esta categoría."
      }, { status: 403 });
    }

    // Verificar que el nombre no esté en uso por otra categoría de la misma empresa
    if (name !== existingCategory.name) {
      const { data: nameCategory } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('company_id', existingCategory.company_id)
        .eq('name', name)
        .neq('id', categoryId)
        .single();

      if (nameCategory) {
        return NextResponse.json({ 
          error: "Nombre en uso", 
          message: "Ya existe otra categoría con este nombre en la empresa." 
        }, { status: 409 });
      }
    }

    const { data: updatedCategory, error } = await supabaseAdmin
      .from('categories')
      .update({ name })
      .eq('id', categoryId)
      .select(`
        id,
        name,
        created_at,
        updated_at,
        company_id,
        companies (
          id,
          name
        ),
        products (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar la categoría."
      }, { status: 500 });
    }

    return NextResponse.json(transformCategory(updatedCategory));
  } catch (error: any) {
    console.error('Error in categories PUT:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const categoryId = params.id;

    // Verificar que la categoría existe y el usuario tiene acceso
    const { data: existingCategory, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id, company_id')
      .eq('id', categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ 
        error: "Categoría no encontrada",
        message: "La categoría solicitada no existe o no tienes permisos para acceder a ella."
      }, { status: 404 });
    }

    // Verificar autorización para usuarios no SUPERADMIN
    if (session.user.role !== 'SUPERADMIN' && existingCategory.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para eliminar esta categoría."
      }, { status: 403 });
    }

    // Verificar si la categoría está siendo usada en productos
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);

    if (products && products.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar",
        message: "Esta categoría está siendo utilizada en productos y no puede ser eliminada."
      }, { status: 409 });
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar la categoría."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Categoría eliminada correctamente",
      success: true 
    });
  } catch (error: any) {
    console.error('Error in categories DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
