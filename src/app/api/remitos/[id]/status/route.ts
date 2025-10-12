import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemito } from "@/lib/utils/supabase-transform";
import { validateEstadoByIdForCompany } from "@/lib/utils/estado-validator";

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
    // Durante impersonation, SUPERADMIN puede cambiar estados sin companyId en la sesión
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const remitoId = params.id;
    const body = await request.json();
    const { status: statusId } = body;

    // Validaciones básicas
    if (!statusId) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El estado es requerido." 
      }, { status: 400 });
    }

    // Verificar que el remito existe y el usuario tiene acceso
    const { data: existingRemito, error: fetchError } = await supabaseAdmin
      .from('remitos')
      .select('id, status, company_id')
      .eq('id', remitoId)
      .single();

    if (fetchError || !existingRemito) {
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: "El remito solicitado no existe o no tienes permisos para acceder a él."
      }, { status: 404 });
    }

    // Verificar autorización para usuarios no SUPERADMIN
    if (session.user.role !== 'SUPERADMIN' && existingRemito.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para acceder a este remito."
      }, { status: 403 });
    }

    // Simplificar: usar directamente el companyId del remito
    const companyId = existingRemito.company_id;
    
    console.log('Updating remito status:', { 
      remitoId, 
      statusId, 
      companyId, 
      userRole: session.user.role,
      existingRemito 
    });

    // Validar que el estado existe (simplificado)
    const { data: estado, error: estadoError } = await supabaseAdmin
      .from('estados_remitos')
      .select('id, name, is_active')
      .eq('id', statusId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (estadoError || !estado) {
      console.error('Estado validation failed:', { estadoError, estado, statusId, companyId });
      return NextResponse.json({ 
        error: "Estado inválido", 
        message: `El estado no existe o no está activo para esta empresa.` 
      }, { status: 400 });
    }

    console.log('Estado validado:', estado);

    // Actualizar el estado del remito (usando directamente el UUID del estado)
    console.log('Updating remito with:', { remitoId, statusId });
    
    const { data: updatedRemito, error } = await supabaseAdmin
      .from('remitos')
      .update({ 
        status: statusId,
        status_at: new Date().toISOString()
      })
      .eq('id', remitoId)
      .select('id, number, status, status_at')
      .single();
    
    console.log('Update result:', { updatedRemito, error });

    if (error) {
      console.error('Error updating remito status:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: `No se pudo actualizar el estado del remito: ${error.message}`
      }, { status: 500 });
    }

    // Respuesta simplificada
    return NextResponse.json({ 
      success: true, 
      message: "Estado actualizado correctamente",
      remito: updatedRemito
    });
  } catch (error: any) {
    console.error('Error in remitos status PUT:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: `Ocurrió un error inesperado: ${error.message}`,
      details: error.stack
    }, { status: 500 });
  }
}
