import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemito } from "@/lib/utils/supabase-transform";
import { validateEstadoForCompany } from "@/lib/utils/estado-validator";

export async function GET(
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

    const remitoId = params.id;

    let query = supabaseAdmin
      .from('remitos')
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
        ),
        remito_items (
          id,
          quantity,
          product_name,
          product_desc,
          unit_price,
          line_total,
          products (
            id,
            name
          )
        ),
        status_history (
          id,
          status,
          at,
          by_user_id,
          users (
            id,
            name
          )
        )
      `)
      .eq('id', remitoId);

    // Solo SUPERADMIN puede ver remitos de todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      if (!session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      query = query.eq('company_id', session.user.companyId);
    }

    const { data: remito, error } = await query.single();

    if (error || !remito) {
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: "El remito solicitado no existe o no tienes permisos para acceder a él."
      }, { status: 404 });
    }

    return NextResponse.json(transformRemito(remito));
  } catch (error: any) {
    console.error('Error in remitos GET by ID:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

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
    const { status, notes, items } = body;

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

    // Preparar datos de actualización
    const updateData: any = {};
    if (status !== undefined) {
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

      const estadoValidation = await validateEstadoForCompany(status, companyId);
      if (!estadoValidation.isValid) {
        return NextResponse.json({ 
          error: "Estado inválido", 
          message: estadoValidation.error || "El estado no es válido para esta empresa." 
        }, { status: 400 });
      }

      updateData.status = status;
      updateData.status_at = new Date().toISOString();
    }
    if (notes !== undefined) updateData.notes = notes;

    const { data: updatedRemito, error } = await supabaseAdmin
      .from('remitos')
      .update(updateData)
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
      console.error('Error updating remito:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el remito."
      }, { status: 500 });
    }

    // Si se cambió el estado, crear un registro en el historial
    if (status && status !== existingRemito.status) {
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
    }

    // Si se enviaron items, actualizar los items del remito
    if (items && Array.isArray(items)) {
      // Eliminar items existentes
      const { error: deleteError } = await supabaseAdmin
        .from('remito_items')
        .delete()
        .eq('remito_id', remitoId);

      if (deleteError) {
        console.error('Error deleting existing remito items:', deleteError);
        return NextResponse.json({ 
          error: "Error interno del servidor",
          message: "No se pudieron eliminar los items existentes."
        }, { status: 500 });
      }

      // Crear nuevos items
      const remitoItems = items.map((item: any) => ({
        remito_id: remitoId,
        product_id: item.product_id || null,
        quantity: item.quantity,
        product_name: item.product_name,
        product_desc: item.product_desc || null,
        unit_price: parseFloat(item.unit_price),
        line_total: parseFloat(item.line_total)
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('remito_items')
        .insert(remitoItems);

      if (itemsError) {
        console.error('Error creating new remito items:', itemsError);
        return NextResponse.json({ 
          error: "Error interno del servidor",
          message: "No se pudieron crear los nuevos items."
        }, { status: 500 });
      }
    }

    // Obtener el remito completo con todas las relaciones actualizadas
    const { data: completeRemito, error: completeFetchError } = await supabaseAdmin
      .from('remitos')
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
          phone,
          address
        ),
        users (
          id,
          name,
          email
        ),
        remito_items (
          id,
          quantity,
          product_name,
          product_desc,
          unit_price,
          line_total,
          products (
            id,
            name
          )
        )
      `)
      .eq('id', remitoId)
      .single();

    if (completeFetchError) {
      console.error('Error fetching complete remito after update:', completeFetchError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "Remito actualizado pero no se pudo obtener la información completa."
      }, { status: 500 });
    }

    return NextResponse.json(transformRemito(completeRemito));
  } catch (error: any) {
    console.error('Error in remitos PUT:', error);
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

    const remitoId = params.id;

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
        message: "No tienes permisos para eliminar este remito."
      }, { status: 403 });
    }

    // Solo se pueden eliminar remitos en estado PENDIENTE
    if (existingRemito.status !== 'PENDIENTE') {
      return NextResponse.json({ 
        error: "No se puede eliminar",
        message: "Solo se pueden eliminar remitos en estado PENDIENTE."
      }, { status: 409 });
    }

    // Eliminar en cascada (los items y el historial se eliminan automáticamente)
    const { error } = await supabaseAdmin
      .from('remitos')
      .delete()
      .eq('id', remitoId);

    if (error) {
      console.error('Error deleting remito:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar el remito."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Remito eliminado correctamente",
      success: true 
    });
  } catch (error: any) {
    console.error('Error in remitos DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
