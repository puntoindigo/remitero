import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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

    const estadoId = params?.id;
    const body = await request.json();
    const { name, description, color, icon, is_active, sort_order } = body;

    // Validaciones
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre del estado es requerido." 
      }, { status: 400 });
    }

    // Verificar que el usuario tenga companyId (excepto SUPERADMIN)
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    // Verificar que el estado existe y el usuario tiene acceso
    const { data: existingEstado, error: fetchError } = await supabaseAdmin
      .from('estados_remitos')
      .select('id, company_id, is_default')
      .eq('id', estadoId)
      .single();

    if (fetchError || !existingEstado) {
      return NextResponse.json({ 
        error: "Estado no encontrado",
        message: "El estado de remito no existe."
      }, { status: 404 });
    }

    // Verificar autorización para usuarios no SUPERADMIN
    if (session.user.role !== 'SUPERADMIN' && existingEstado.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para acceder a este estado."
      }, { status: 403 });
    }

    // Permitir editar todos los estados (incluyendo predefinidos)

    // Verificar que no exista otro estado con el mismo nombre en la empresa
    const { data: duplicateEstado } = await supabaseAdmin
      .from('estados_remitos')
      .select('id')
      .eq('company_id', existingEstado.company_id)
      .eq('name', name.trim())
      .neq('id', estadoId)
      .single();

    if (duplicateEstado) {
      return NextResponse.json({ 
        error: "Estado duplicado", 
        message: "Ya existe un estado con ese nombre en la empresa." 
      }, { status: 400 });
    }

    // Actualizar el estado
    const { data: updatedEstado, error } = await supabaseAdmin
      .from('estados_remitos')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#6b7280',
        icon: icon || '📋',
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order !== undefined ? sort_order : 0
      })
      .eq('id', estadoId)
      .select(`
        id,
        name,
        description,
        color,
        icon,
        is_active,
        is_default,
        sort_order,
        created_at,
        updated_at,
        company_id,
        companies (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating estado remito:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el estado de remito."
      }, { status: 500 });
    }

    return NextResponse.json(updatedEstado);
  } catch (error) {
    console.error('Error en PUT /api/estados-remitos/[id]:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado al procesar la solicitud."
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

    const estadoId = params?.id;

    // Verificar que el usuario tenga companyId (excepto SUPERADMIN)
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    // Verificar que el estado existe y el usuario tiene acceso
    const { data: existingEstado, error: fetchError } = await supabaseAdmin
      .from('estados_remitos')
      .select('id, company_id, is_default, name')
      .eq('id', estadoId)
      .single();

    if (fetchError || !existingEstado) {
      return NextResponse.json({ 
        error: "Estado no encontrado",
        message: "El estado de remito no existe."
      }, { status: 404 });
    }

    // Verificar autorización para usuarios no SUPERADMIN
    if (session.user.role !== 'SUPERADMIN' && existingEstado.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para acceder a este estado."
      }, { status: 403 });
    }

    // Permitir eliminar todos los estados (incluyendo predefinidos)

    // Verificar si hay remitos usando este estado
    const { data: remitosUsingEstado } = await supabaseAdmin
      .from('remitos')
      .select('id')
      .eq('status', existingEstado?.name.toUpperCase())
      .limit(1);

    if (remitosUsingEstado && remitosUsingEstado?.length > 0) {
      return NextResponse.json({ 
        error: "Estado en uso",
        message: "No se puede eliminar el estado porque hay remitos que lo están usando."
      }, { status: 400 });
    }

    // Eliminar el estado
    const { error } = await supabaseAdmin
      .from('estados_remitos')
      .delete()
      .eq('id', estadoId);

    if (error) {
      console.error('Error deleting estado remito:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar el estado de remito."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Estado de remito eliminado correctamente." 
    });
  } catch (error) {
    console.error('Error en DELETE /api/estados-remitos/[id]:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado al procesar la solicitud."
    }, { status: 500 });
  }
}
