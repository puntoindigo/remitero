import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformCompany } from "@/lib/utils/supabase-transform";

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

    // Solo SUPERADMIN puede editar empresas
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para editar empresas." 
      }, { status: 403 });
    }

    const companyId = params?.id;
    const body = await request.json();
    const { name } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre de la empresa es requerido." 
      }, { status: 400 });
    }

    // Verificar que la empresa existe
    const { data: existingCompany, error: fetchError } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (fetchError || !existingCompany) {
      return NextResponse.json({ 
        error: "Empresa no encontrada",
        message: "La empresa solicitada no existe."
      }, { status: 404 });
    }

    // Verificar que el nombre no esté en uso por otra empresa
    if (name !== existingCompany?.name) {
      const { data: nameCompany } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('name', name)
        .neq('id', companyId)
        .single();

      if (nameCompany) {
        return NextResponse.json({ 
          error: "Nombre en uso", 
          message: "Ya existe otra empresa con este nombre." 
        }, { status: 409 });
      }
    }

    const { data: updatedCompany, error } = await supabaseAdmin
      .from('companies')
      .update({ name })
      .eq('id', companyId)
      .select(`
        id,
        name,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar la empresa."
      }, { status: 500 });
    }

    return NextResponse.json(transformCompany(updatedCompany));
  } catch (error: any) {
    console.error('Error in companies PUT:', error);
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

    // Solo SUPERADMIN puede eliminar empresas
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para eliminar empresas." 
      }, { status: 403 });
    }

    const companyId = params?.id;

    // Verificar que la empresa existe
    const { data: existingCompany, error: fetchError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .single();

    if (fetchError || !existingCompany) {
      return NextResponse.json({ 
        error: "Empresa no encontrada",
        message: "La empresa solicitada no existe."
      }, { status: 404 });
    }

    // Verificar si la empresa tiene usuarios asociados
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .limit(1);

    if (users && users?.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar",
        message: "Esta empresa tiene usuarios asociados y no puede ser eliminada."
      }, { status: 409 });
    }

    const { error } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) {
      console.error('Error deleting company:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar la empresa."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Empresa eliminada correctamente",
      success: true 
    });
  } catch (error: any) {
    console.error('Error in companies DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
