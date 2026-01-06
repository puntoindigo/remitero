import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemitos, transformRemito } from "@/lib/utils/supabase-transform";
import { logUserActivity } from "@/lib/user-activity-logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Obtener companyId y paginación opcional desde querystring
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const lastShippingCost = searchParams.get('lastShippingCost') === 'true';
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam))) : null;
    const offset = offsetParam ? Math.max(0, parseInt(offsetParam)) : null;
    
    // Si se solicita el último costo de envío
    if (lastShippingCost) {
      const effectiveCompanyId = companyId || session.user.companyId;
      
      if (session.user.role !== 'SUPERADMIN' && !effectiveCompanyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      
      let query = supabaseAdmin
        .from('remitos')
        .select('shipping_cost')
        .gt('shipping_cost', 0)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (session.user.role !== 'SUPERADMIN') {
        query = query.eq('company_id', effectiveCompanyId);
      }
      
      const { data: remitos, error } = await query;
      
      if (error) {
        console.error('Error fetching last shipping cost:', error);
        return NextResponse.json({ lastShippingCost: 0 });
      }
      
      const lastCost = remitos && remitos.length > 0 && remitos[0].shipping_cost 
        ? parseFloat(remitos[0].shipping_cost) 
        : 0;
      
      return NextResponse.json({ lastShippingCost: lastCost > 0 ? lastCost : 0 });
    }
    

    // Optimización: Sin JOINs automáticos (evita problemas con foreign keys en schema dev)
    let query = supabaseAdmin
      .from('remitos')
      .select(`
        id,
        number,
        status,
        status_at,
        notes,
        shipping_cost,
        previous_balance,
        account_payment,
        created_at,
        updated_at,
        company_id,
        client_id,
        created_by_id
      `, { count: 'exact' })
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

    // Aplicar paginación opcional
    if (limit && offset !== null) {
      query = query.range(offset, offset + limit - 1);
    } else if (limit && offset === null) {
      query = query.limit(limit);
    }

    const { data: remitos, error, count } = await query;
    

    if (error) {
      console.error('Error fetching remitos:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los remitos."
      }, { status: 500 });
    }

    // Obtener datos relacionados en queries separadas
    const clientIds = [...new Set((remitos || []).filter((r: any) => r.client_id).map((r: any) => r.client_id))];
    const estadoIds = [...new Set((remitos || []).filter((r: any) => r.status).map((r: any) => r.status))];
    const remitoIds = (remitos || []).map((r: any) => r.id);
    
    // Obtener clientes
    const clientsMap = new Map<string, { id: string; name: string; email: string }>();
    if (clientIds.length > 0) {
      try {
        const { data: clients } = await supabaseAdmin
          .from('clients')
          .select('id, name, email')
          .in('id', clientIds);
        
        if (clients) {
          clients.forEach((client: any) => {
            clientsMap.set(client.id, { id: client.id, name: client.name, email: client.email });
          });
        }
      } catch (clientsError) {
        console.warn('⚠️ [Remitos] Error obteniendo clientes (no crítico):', clientsError);
      }
    }
    
    // Obtener estados
    const estadosMap = new Map<string, { id: string; name: string; color: string }>();
    if (estadoIds.length > 0) {
      try {
        const { data: estados } = await supabaseAdmin
          .from('estados_remitos')
          .select('id, name, color')
          .in('id', estadoIds);
        
        if (estados) {
          estados.forEach((estado: any) => {
            estadosMap.set(estado.id, { id: estado.id, name: estado.name, color: estado.color });
          });
        }
      } catch (estadosError) {
        console.warn('⚠️ [Remitos] Error obteniendo estados (no crítico):', estadosError);
      }
    }
    
    // Obtener totales de items (solo line_total para calcular total del remito)
    const totalsMap = new Map<string, number>();
    if (remitoIds.length > 0) {
      try {
        const { data: items } = await supabaseAdmin
          .from('remito_items')
          .select('remito_id, line_total')
          .in('remito_id', remitoIds);
        
        if (items) {
          items.forEach((item: any) => {
            const currentTotal = totalsMap.get(item.remito_id) || 0;
            totalsMap.set(item.remito_id, currentTotal + (parseFloat(item.line_total) || 0));
          });
        }
      } catch (itemsError) {
        console.warn('⚠️ [Remitos] Error obteniendo items (no crítico):', itemsError);
      }
    }

    // Mapear remitos con datos relacionados
    const remitosWithStructures = (remitos || []).map((remito: any) => ({
      ...remito,
      clients: remito.client_id ? clientsMap.get(remito.client_id) || { id: remito.client_id, name: '', email: '' } : null,
      estados_remitos: remito.status ? estadosMap.get(remito.status) || { id: remito.status, name: '', color: '' } : null,
      users: remito.created_by_id ? {
        id: remito.created_by_id,
        name: '',
        email: ''
      } : null,
      remito_items: totalsMap.has(remito.id) ? [{ line_total: totalsMap.get(remito.id) }] : []
    }));

    let transformedRemitos = transformRemitos(remitosWithStructures);
    // Remover items del payload final para el listado
    transformedRemitos = transformedRemitos.map((r: any) => ({
      ...r,
      remitoItems: undefined,
      items: undefined
    }));
    console.log('Transformed remitos:', transformedRemitos?.length || 0, 'remitos');
    
    return NextResponse.json({ items: transformedRemitos, total: count ?? transformedRemitos.length });
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
    // Durante impersonation, SUPERADMIN puede crear remitos sin companyId en la sesión
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/remitos - Request body:', JSON.stringify(body, null, 2));
    const { clientId, status, notes, items, companyId, shippingCost, previousBalance, accountPayment } = body;

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
    if (session.user.role !== 'SUPERADMIN' && (!companyId || companyId === '')) {
      finalCompanyId = session.user.companyId;
    }
    
    // Convertir cadena vacía a null para evitar error de UUID
    if (finalCompanyId === '' || finalCompanyId === null) {
      finalCompanyId = null;
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
    console.log('Getting next remito number for company:', finalCompanyId);
    const { data: lastRemito, error: numberError } = await supabaseAdmin
      .from('remitos')
      .select('number')
      .eq('company_id', finalCompanyId)
      .order('number', { ascending: false })
      .limit(1)
      .single();

    if (numberError && numberError.code !== 'PGRST116') {
      console.error('Error getting next remito number:', numberError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo generar el número de remito."
      }, { status: 500 });
    }

    const nextNumber = lastRemito ? lastRemito.number + 1 : 1;
    console.log('Next remito number:', nextNumber);

    // Obtener el estado por defecto de la empresa
    const { data: defaultEstado } = await supabaseAdmin
      .from('estados_remitos')
      .select('id')
      .eq('company_id', finalCompanyId)
      .eq('is_default', true)
      .single();

    const estadoId = defaultEstado?.id || status;

    // Crear el remito con el estado del ABM
    const shippingCostValue = parseFloat(shippingCost) || 0;
    console.log('Creating remito with data:', {
      number: nextNumber,
      client_id: clientId,
      status: estadoId, // Usar UUID del estado del ABM
      notes,
      shipping_cost: shippingCostValue,
      previous_balance: parseFloat(previousBalance) || 0,
      account_payment: parseFloat(accountPayment) || 0,
      created_by_id: session.user.id,
      company_id: finalCompanyId
    });
    
    const { data: newRemito, error: remitoError } = await supabaseAdmin
      .from('remitos')
      .insert([{
        number: nextNumber,
        client_id: clientId,
        status: estadoId, // Usar UUID del estado del ABM
        notes,
        shipping_cost: shippingCostValue,
        previous_balance: parseFloat(previousBalance) || 0,
        account_payment: parseFloat(accountPayment) || 0,
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

    console.log('Remito created successfully with ID:', newRemito?.id);

    // Crear los items del remito
    console.log('Creating remito items:', items);
    const remitoItems = items.map((item: any) => ({
      remito_id: newRemito?.id,
      product_id: item.product_id || null,
      quantity: parseInt(item.quantity) || 1,
      product_name: item.product_name || '',
      product_desc: item.product_desc || null,
      unit_price: parseFloat(item.unit_price) || 0,
      line_total: parseFloat(item.line_total) || 0,
      is_unit: Boolean(item.is_unit || item.isUnit || false)
    }));

    console.log('Mapped remito items:', remitoItems);
    // Log detallado de is_unit
    remitoItems.forEach((item: any, index: number) => {
      console.log(`💾 [API] Item ${index} a insertar (POST):`, {
        product_name: item.product_name,
        is_unit: item.is_unit,
        'typeof is_unit': typeof item.is_unit
      });
    });

    const { error: itemsError } = await supabaseAdmin
      .from('remito_items')
      .insert(remitoItems);

    if (itemsError) {
      console.error('Error creating remito items:', itemsError);
      // Intentar eliminar el remito creado
      await supabaseAdmin.from('remitos').delete().eq('id', newRemito?.id);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron crear los items del remito."
      }, { status: 500 });
    }

    // Ya no necesitamos crear historial de estado (tabla eliminada)

    // Registrar actividad
    await logUserActivity(session.user.id, 'CREATE_REMITO', `Creó remito #${nextNumber}`, {
      remitoId: newRemito?.id,
      remitoNumber: nextNumber,
      clientId: clientId
    });

    // Obtener el remito completo con relaciones (queries separadas)
    const { data: remitoData, error: fetchError } = await supabaseAdmin
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
        created_by_id
      `)
      .eq('id', newRemito?.id)
      .single();

    if (fetchError || !remitoData) {
      console.error('Error fetching remito:', fetchError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "Remito creado pero no se pudo obtener la información completa."
      }, { status: 500 });
    }

    // Obtener datos relacionados
    let clientInfo = null;
    if (remitoData.client_id) {
      try {
        const { data: clientData } = await supabaseAdmin
          .from('clients')
          .select('id, name, email, phone, address')
          .eq('id', remitoData.client_id)
          .single();
        if (clientData) clientInfo = clientData;
      } catch (clientError) {
        console.warn('⚠️ [Remitos] Error obteniendo cliente (no crítico):', clientError);
      }
    }

    let estado = null;
    if (remitoData.status) {
      try {
        const { data: estadoData } = await supabaseAdmin
          .from('estados_remitos')
          .select('id, name, color')
          .eq('id', remitoData.status)
          .single();
        if (estadoData) estado = estadoData;
      } catch (estadoError) {
        console.warn('⚠️ [Remitos] Error obteniendo estado (no crítico):', estadoError);
      }
    }

    let user = null;
    if (remitoData.created_by_id) {
      try {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id, name, email')
          .eq('id', remitoData.created_by_id)
          .single();
        if (userData) user = userData;
      } catch (userError) {
        console.warn('⚠️ [Remitos] Error obteniendo usuario (no crítico):', userError);
      }
    }

    // Obtener items del remito
    let remitoItemsData: any[] = [];
    try {
      const { data: itemsData } = await supabaseAdmin
        .from('remito_items')
        .select('id, quantity, product_name, product_desc, unit_price, line_total, product_id, is_unit')
        .eq('remito_id', remitoData.id);
      
      if (itemsData) {
        // Obtener productos si hay product_id
        const productIds = [...new Set(itemsData.filter((i: any) => i.product_id).map((i: any) => i.product_id))];
        const productsMap = new Map<string, { id: string; name: string }>();
        
        if (productIds.length > 0) {
          try {
            const { data: products } = await supabaseAdmin
              .from('products')
              .select('id, name')
              .in('id', productIds);
            
            if (products) {
              products.forEach((product: any) => {
                productsMap.set(product.id, { id: product.id, name: product.name });
              });
            }
          } catch (productsError) {
            console.warn('⚠️ [Remitos] Error obteniendo productos (no crítico):', productsError);
          }
        }
        
        remitoItemsData = itemsData.map((item: any) => ({
          ...item,
          products: item.product_id ? productsMap.get(item.product_id) || { id: item.product_id, name: '' } : null
        }));
      }
    } catch (itemsError) {
      console.warn('⚠️ [Remitos] Error obteniendo items (no crítico):', itemsError);
    }

    const completeRemito = {
      ...remitoData,
      clients: clientInfo,
      users: user,
      estados_remitos: estado,
      remito_items: remitoItemsData
    };

    return NextResponse.json(transformRemito(completeRemito), { status: 201 });
  } catch (error: any) {
    console.error('Error in remitos POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
