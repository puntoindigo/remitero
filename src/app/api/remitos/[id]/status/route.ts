import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemito } from "@/lib/utils/supabase-transform";

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

    if (!['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO'].includes(status)) {
      return NextResponse.json({ 
        error: "Estado inválido", 
        message: "El estado debe ser: PENDIENTE, EN_TRANSITO, ENTREGADO o CANCELADO." 
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

    // Actualizar el estado del remito
    const { data: updatedRemito, error } = await supabaseAdmin
      .from('remitos')
      .update({ 
        status: status,
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
        created_by_id,
        clients (
          id,
          name,
          email,
          phone
        ),
        users (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating remito status:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el estado del remito."
      }, { status: 500 });
    }

    // Crear un registro en el historial de estados
    const { error: historyError } = await supabaseAdmin
      .from('status_history')
      .insert([{
        remito_id: remitoId,
        status: status,
        by_user_id: session.user.id
      }]);

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
