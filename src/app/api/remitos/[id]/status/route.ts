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
    const { status } = body;

    // Validaciones básicas
    if (!status) {
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

    // Validar que el estado existe y está activo para la empresa
    const companyId = session.user.role === 'SUPERADMIN' 
      ? existingRemito.company_id 
      : session.user.companyId;
    
    if (!companyId) {
      return NextResponse.json({ 
        error: "Error de configuración", 
        message: "No se pudo determinar la empresa para validar el estado." 
      }, { status: 400 });
    }

    console.log('Validating estado:', { status, companyId, userRole: session.user.role });
    const estadoValidation = await validateEstadoByIdForCompany(status, companyId);
    console.log('Estado validation result:', estadoValidation);
    
    if (!estadoValidation.isValid) {
      return NextResponse.json({ 
        error: "Estado inválido", 
        message: estadoValidation.error || "El estado no es válido para esta empresa." 
      }, { status: 400 });
    }

    // Mapear el nombre del estado al valor del enum delivery_status
    const estadoName = estadoValidation.estado?.name;
    if (!estadoName) {
      return NextResponse.json({ 
        error: "Error de configuración", 
        message: "No se pudo obtener el nombre del estado." 
      }, { status: 400 });
    }

    // Mapear nombres de estados a valores del enum delivery_status
    // Mapeo más flexible que maneja estados personalizados
    const getMappedStatus = (name: string): string => {
      const lowerName = name.toLowerCase();
      
      // Estados predefinidos
      if (lowerName.includes('pendiente')) return 'PENDIENTE';
      if (lowerName.includes('preparado') || lowerName.includes('en transito') || lowerName.includes('en tránsito')) return 'EN_TRANSITO';
      if (lowerName.includes('entregado')) return 'ENTREGADO';
      if (lowerName.includes('cancelado')) return 'CANCELADO';
      
      // Fallback: usar PENDIENTE para estados desconocidos
      return 'PENDIENTE';
    };

    const mappedStatus = getMappedStatus(estadoName);

    // Actualizar el estado del remito (usando el valor mapeado del enum)
    console.log('Updating remito with:', { remitoId, mappedStatus, estadoName });
    
    const { data: updatedRemito, error } = await supabaseAdmin
      .from('remitos')
      .update({ 
        status: mappedStatus,
        status_at: new Date().toISOString()
      })
      .eq('id', remitoId)
      .select(`
        id,
        number,
        status,
        status_at,
        notes,
        created_at,
        updated_at,
        company_id,
        client_id,
        created_by_id
      `)
      .single();
    
    console.log('Update result:', { updatedRemito, error });

    if (error) {
      console.error('Error updating remito status:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el estado del remito."
      }, { status: 500 });
    }

    // Crear un registro en el historial de estados
    console.log('Creating status history:', { remitoId, mappedStatus, userId: session.user.id });
    
    const { error: historyError } = await supabaseAdmin
      .from('status_history')
      .insert([{
        remito_id: remitoId,
        status: mappedStatus,
        by_user_id: session.user.id
      }]);
    
    console.log('History result:', { historyError });

    if (historyError) {
      console.error('Error creating status history:', historyError);
      // No es crítico, continuar
    }

    return NextResponse.json(transformRemito(updatedRemito));
  } catch (error: any) {
    console.error('Error in remitos status PUT:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
