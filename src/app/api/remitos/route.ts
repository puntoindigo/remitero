import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemitos, transformRemito } from "@/lib/utils/supabase-transform";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Obtener companyId de los query parameters (para impersonation)
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    console.log('🔍 /api/remitos - session.user:', session.user);
    console.log('🔍 /api/remitos - companyId param:', companyId);

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
      .order('created_at', { ascending: false });

    // Determinar qué companyId usar
    const effectiveCompanyId = companyId || session.user.companyId;

    // Solo SUPERADMIN puede ver remitos de todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      if (!effectiveCompanyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      query = query.eq('company_id', effectiveCompanyId);
    } else if (effectiveCompanyId) {
      // SUPERADMIN puede filtrar por empresa específica
      query = query.eq('company_id', effectiveCompanyId);
    }

    const { data: remitos, error } = await query;
    
    console.log('🔍 /api/remitos - effectiveCompanyId:', effectiveCompanyId);
    console.log('🔍 /api/remitos - remitos count:', remitos?.length || 0);
    console.log('🔍 /api/remitos - error:', error);

    if (error) {
      console.error('Error fetching remitos:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los remitos."
      }, { status: 500 });
    }

    console.log('Raw remitos from database:', remitos?.length || 0, 'remitos');
    if (remitos && remitos.length > 0) {
      console.log('First remito structure:', {
        id: remitos[0].id,
        hasRemitoItems: !!remitos[0].remito_items,
        remitoItemsType: typeof remitos[0].remito_items,
        remitoItemsLength: remitos[0].remito_items?.length || 0
      });
    }

    const transformedRemitos = transformRemitos(remitos);
    console.log('Transformed remitos:', transformedRemitos?.length || 0, 'remitos');
    
    return NextResponse.json(transformedRemitos);
  } catch (error: any) {
    console.error('Error in remitos GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { clientId, notes, items, companyId } = body;

    // Validaciones básicas
    if (!clientId) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El cliente es requerido." 
      }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
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

    // Obtener el siguiente número de remito para la empresa
    const { data: lastRemito } = await supabaseAdmin
      .from('remitos')
      .select('number')
      .eq('company_id', finalCompanyId)
      .order('number', { ascending: false })
      .limit(1)
      .single();

    const nextNumber = lastRemito ? lastRemito.number + 1 : 1;

    // Crear el remito
    const { data: newRemito, error: remitoError } = await supabaseAdmin
      .from('remitos')
      .insert([{
        number: nextNumber,
        client_id: clientId,
        status: 'PENDIENTE',
        notes,
        created_by_id: session.user.id,
        company_id: finalCompanyId
      }])
      .select('id')
      .single();

    if (remitoError) {
      console.error('Error creating remito:', remitoError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el remito."
      }, { status: 500 });
    }

    // Crear los items del remito
    const remitoItems = items.map((item: any) => ({
      remito_id: newRemito.id,
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
      console.error('Error creating remito items:', itemsError);
      // Intentar eliminar el remito creado
      await supabaseAdmin.from('remitos').delete().eq('id', newRemito.id);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron crear los items del remito."
      }, { status: 500 });
    }

    // Crear el historial de estado inicial
    const { error: historyError } = await supabaseAdmin
      .from('status_history')
      .insert([{
        remito_id: newRemito.id,
        status: 'PENDIENTE',
        by_user_id: session.user.id
      }]);

    if (historyError) {
      console.error('Error creating status history:', historyError);
      // No es crítico, continuar
    }

    // Obtener el remito completo con relaciones
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
      .eq('id', newRemito.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete remito:', fetchError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "Remito creado pero no se pudo obtener la información completa."
      }, { status: 500 });
    }

    return NextResponse.json(transformRemito(completeRemito), { status: 201 });
  } catch (error: any) {
    console.error('Error in remitos POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
