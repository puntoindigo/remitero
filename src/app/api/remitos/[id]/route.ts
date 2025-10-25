import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemito } from "@/lib/utils/supabase-transform";

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

    const remitoId = params?.id;

    // Obtener el remito con todas sus relaciones
    const { data: remito, error } = await supabaseAdmin
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
          product_id,
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
        estados_remitos (
          id,
          name,
          color,
          is_active
        )
      `)
      .eq('id', remitoId)
      .single();

    if (error || !remito) {
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: "El remito especificado no existe."
      }, { status: 404 });
    }

    // Verificar permisos: solo SUPERADMIN puede ver remitos de todas las empresas
    if (session.user.role !== 'SUPERADMIN' && remito.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para ver este remito."
      }, { status: 403 });
    }

    return NextResponse.json(transformRemito(remito));
  } catch (error: any) {
    console.error('Error in remitos GET:', error);
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

    const remitoId = params?.id;
    const body = await request.json();
    console.log('PUT /api/remitos/[id] - Request body:', JSON.stringify(body, null, 2));
    const { clientId, status, notes, items, companyId } = body;

    // Validaciones básicas
    console.log('Validating clientId:', clientId);
    if (!clientId) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El cliente es requerido." 
      }, { status: 400 });
    }

    console.log('Validating items:', items);
    if (!items || !Array.isArray(items) || items?.length === 0) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "Debe incluir al menos un item en el remito." 
      }, { status: 400 });
    }

    // Determinar companyId
    let finalCompanyId = companyId;
    if (session.user.role !== 'SUPERADMIN' && !companyId) {
      finalCompanyId = session.user.companyId;
    }

    // Verificar que el remito existe y pertenece a la empresa
    const { data: existingRemito, error: remitoError } = await supabaseAdmin
      .from('remitos')
      .select('id, company_id, client_id')
      .eq('id', remitoId)
      .single();

    if (remitoError || !existingRemito) {
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: "El remito especificado no existe."
      }, { status: 404 });
    }

    if (existingRemito.company_id !== finalCompanyId) {
      return NextResponse.json({ 
        error: "Remito no válido",
        message: "El remito no pertenece a tu empresa."
      }, { status: 403 });
    }

    // Verificar que el cliente existe y pertenece a la empresa
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, company_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ 
        error: "Cliente no encontrado",
        message: "El cliente especificado no existe."
      }, { status: 404 });
    }

    if (client.company_id !== finalCompanyId) {
      return NextResponse.json({ 
        error: "Cliente no válido",
        message: "El cliente no pertenece a tu empresa."
      }, { status: 403 });
    }

    // Actualizar el remito
    const { data: updatedRemito, error: updateError } = await supabaseAdmin
      .from('remitos')
      .update({
        client_id: clientId,
        status: status || 'PENDIENTE',
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', remitoId)
      .select('id')
      .single();

    if (updateError) {
      console.error('Error updating remito:', updateError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el remito."
      }, { status: 500 });
    }

    // Eliminar items existentes
    const { error: deleteItemsError } = await supabaseAdmin
      .from('remito_items')
      .delete()
      .eq('remito_id', remitoId);

    if (deleteItemsError) {
      console.error('Error deleting existing items:', deleteItemsError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron eliminar los items existentes."
      }, { status: 500 });
    }

    // Crear nuevos items
    const itemsToInsert = items.map((item: any) => ({
      remito_id: remitoId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_name: item.product_name || '',
      product_desc: item.product_desc || '',
      line_total: item.quantity * item.unit_price
    }));

    const { error: insertItemsError } = await supabaseAdmin
      .from('remito_items')
      .insert(itemsToInsert);

    if (insertItemsError) {
      console.error('Error inserting new items:', insertItemsError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron crear los items del remito."
      }, { status: 500 });
    }

    // Obtener el remito completo actualizado
    const { data: completeRemito, error: fetchError } = await supabaseAdmin
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

    if (fetchError) {
      console.error('Error fetching updated remito:', fetchError);
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

    const remitoId = params?.id;

    // Verificar que el remito existe y pertenece a la empresa del usuario
    const { data: remito, error: remitoError } = await supabaseAdmin
      .from('remitos')
      .select('id, company_id')
      .eq('id', remitoId)
      .single();

    if (remitoError || !remito) {
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: "El remito especificado no existe."
      }, { status: 404 });
    }

    // Solo SUPERADMIN puede eliminar remitos de cualquier empresa
    if (session.user.role !== 'SUPERADMIN' && remito.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para eliminar este remito."
      }, { status: 403 });
    }

    // Eliminar items del remito primero
    const { error: deleteItemsError } = await supabaseAdmin
      .from('remito_items')
      .delete()
      .eq('remito_id', remitoId);

    if (deleteItemsError) {
      console.error('Error deleting remito items:', deleteItemsError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron eliminar los items del remito."
      }, { status: 500 });
    }

    // Ya no existe tabla status_history

    // Eliminar el remito
    const { error: deleteError } = await supabaseAdmin
      .from('remitos')
      .delete()
      .eq('id', remitoId);

    if (deleteError) {
      console.error('Error deleting remito:', deleteError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar el remito."
      }, { status: 500 });
    }

    return NextResponse.json({ message: "Remito eliminado correctamente" });
  } catch (error: any) {
    console.error('Error in remitos DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}