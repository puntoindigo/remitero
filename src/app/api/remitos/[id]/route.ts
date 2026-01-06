import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemito } from "@/lib/utils/supabase-transform";
import { logUserActivity } from "@/lib/user-activity-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: remitoId } = await params;
    
    // Permitir acceso público para impresión (si la ruta incluye /print)
    // O si el referer indica que viene de una página de impresión
    // O si tiene el header X-Print-Request
    const referer = request.headers.get('referer') || '';
    const printHeader = request.headers.get('x-print-request');
    const isPrintRequest = referer.includes('/print') || 
                          request.url.includes('/print') || 
                          printHeader === 'true';
    
    // Si no hay sesión pero es una petición de impresión, permitir acceso público
    if (!session?.user && isPrintRequest) {
      // Continuar sin verificación de permisos para impresión pública
    } else if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Obtener el remito sin JOINs automáticos (evita problemas con foreign keys en schema dev)
    const { data: remito, error } = await supabaseAdmin
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
      `)
      .eq('id', remitoId)
      .single();

    if (error || !remito) {
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: "El remito especificado no existe."
      }, { status: 404 });
    }

    // Verificar permisos solo si hay sesión activa
    // Para impresiones públicas, permitir acceso sin verificación de empresa
    if (session?.user) {
      if (session.user.role !== 'SUPERADMIN' && remito.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado",
          message: "No tienes permisos para ver este remito."
        }, { status: 403 });
      }
    }

    // Obtener datos relacionados en queries separadas
    let client = null;
    if (remito.client_id) {
      try {
        const { data: clientData } = await supabaseAdmin
          .from('clients')
          .select('id, name, email, phone, address')
          .eq('id', remito.client_id)
          .single();
        if (clientData) client = clientData;
      } catch (clientError) {
        console.warn('⚠️ [Remitos] Error obteniendo cliente (no crítico):', clientError);
      }
    }

    let estado = null;
    if (remito.status) {
      try {
        const { data: estadoData } = await supabaseAdmin
          .from('estados_remitos')
          .select('id, name, color')
          .eq('id', remito.status)
          .single();
        if (estadoData) estado = estadoData;
      } catch (estadoError) {
        console.warn('⚠️ [Remitos] Error obteniendo estado (no crítico):', estadoError);
      }
    }

    let user = null;
    if (remito.created_by_id) {
      try {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id, name, email')
          .eq('id', remito.created_by_id)
          .single();
        if (userData) user = userData;
      } catch (userError) {
        console.warn('⚠️ [Remitos] Error obteniendo usuario (no crítico):', userError);
      }
    }

    // Obtener datos de la empresa del remito
    let company = null;
    if (remito.company_id) {
      try {
        const { data: companyData } = await supabaseAdmin
          .from('companies')
          .select('id, name')
          .eq('id', remito.company_id)
          .single();
        if (companyData) company = companyData;
      } catch (companyError) {
        console.warn('⚠️ [Remitos] Error obteniendo empresa (no crítico):', companyError);
      }
    }

    // Obtener items del remito
    let remitoItems: any[] = [];
    try {
      const { data: itemsData } = await supabaseAdmin
        .from('remito_items')
        .select('id, product_id, quantity, product_name, product_desc, unit_price, line_total')
        .eq('remito_id', remito.id);
      
      if (itemsData) {
        // Obtener productos si hay product_id
        const productIds = [...new Set(itemsData.filter((i: any) => i.product_id).map((i: any) => i.product_id))];
        const productsMap = new Map<string, { id: string; name: string; imageUrl: string | null }>();
        
        if (productIds.length > 0) {
          try {
            const { data: products } = await supabaseAdmin
              .from('products')
              .select('id, name, image_url')
              .in('id', productIds);
            
            if (products) {
              products.forEach((product: any) => {
                productsMap.set(product.id, { 
                  id: product.id, 
                  name: product.name,
                  imageUrl: product.image_url || product.imageUrl || null
                });
              });
            }
          } catch (productsError) {
            console.warn('⚠️ [Remitos] Error obteniendo productos (no crítico):', productsError);
          }
        }
        
        remitoItems = itemsData.map((item: any) => ({
          ...item,
          products: item.product_id ? productsMap.get(item.product_id) || { id: item.product_id, name: '', imageUrl: null } : null
        }));
      }
    } catch (itemsError) {
      console.warn('⚠️ [Remitos] Error obteniendo items (no crítico):', itemsError);
    }

    const remitoWithStructures = {
      ...remito,
      clients: client || (remito.client_id ? {
        id: remito.client_id,
        name: '',
        email: '',
        phone: '',
        address: ''
      } : null),
      users: user || (remito.created_by_id ? {
        id: remito.created_by_id,
        name: '',
        email: ''
      } : null),
      estados_remitos: estado || (remito.status ? {
        id: remito.status,
        name: '',
        color: '',
        is_active: true
      } : null),
      companies: company || (remito.company_id ? {
        id: remito.company_id,
        name: ''
      } : null),
      remito_items: remitoItems
    };

    return NextResponse.json(transformRemito(remitoWithStructures));
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const { id: remitoId } = await params;
    const body = await request.json();
    console.log('PUT /api/remitos/[id] - Request body:', JSON.stringify(body, null, 2));
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
    const shippingCostValue = parseFloat(shippingCost) || 0;
    const { data: updatedRemito, error: updateError } = await supabaseAdmin
      .from('remitos')
      .update({
        client_id: clientId,
        status: status || 'PENDIENTE',
        notes: notes || null,
        shipping_cost: shippingCostValue,
        previous_balance: parseFloat(previousBalance) || 0,
        account_payment: parseFloat(accountPayment) || 0,
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
    console.log('Items received:', JSON.stringify(items, null, 2));
    const itemsToInsert = items.map((item: any) => ({
      remito_id: remitoId,
      product_id: item.product_id || item.productId || null,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price || item.unitPrice) || 0,
      product_name: item.product_name || item.productName || '',
      product_desc: item.product_desc || item.productDesc || '',
      line_total: (Number(item.quantity) || 0) * (Number(item.unit_price || item.unitPrice) || 0),
      is_unit: Boolean(item.is_unit || item.isUnit || false)
    }));

    console.log('Items to insert:', JSON.stringify(itemsToInsert, null, 2));
    // Log detallado de is_unit
    itemsToInsert.forEach((item: any, index: number) => {
      console.log(`💾 [API] Item ${index} a insertar:`, {
        product_name: item.product_name,
        is_unit: item.is_unit,
        'typeof is_unit': typeof item.is_unit
      });
    });

    const { error: insertItemsError } = await supabaseAdmin
      .from('remito_items')
      .insert(itemsToInsert);

    if (insertItemsError) {
      console.error('Error inserting new items:', insertItemsError);
      console.error('Error details:', JSON.stringify(insertItemsError, null, 2));
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: `No se pudieron crear los items del remito: ${insertItemsError.message || insertItemsError.code}`
      }, { status: 500 });
    }

    // Obtener número del remito para el log
    const { data: remitoForLog } = await supabaseAdmin
      .from('remitos')
      .select('number')
      .eq('id', remitoId)
      .single();

    // Registrar actividad
    await logUserActivity(session.user.id, 'UPDATE_REMITO',
      remitoForLog?.number ? `Actualizó remito #${remitoForLog.number}` : 'Actualizó un remito',
      {
        remitoId: remitoId,
        remitoNumber: remitoForLog?.number,
        clientId: clientId
      }
    );

    // Obtener el remito completo actualizado (queries separadas)
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
      .eq('id', remitoId)
      .single();

    if (fetchError || !remitoData) {
      console.error('Error fetching remito:', fetchError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "Remito actualizado pero no se pudo obtener la información completa."
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
    let remitoItems: any[] = [];
    try {
      const { data: itemsData } = await supabaseAdmin
        .from('remito_items')
        .select('id, quantity, product_name, product_desc, unit_price, line_total, product_id, is_unit')
        .eq('remito_id', remitoData.id);
      
      if (itemsData) {
        // Obtener productos si hay product_id
        const productIds = [...new Set(itemsData.filter((i: any) => i.product_id).map((i: any) => i.product_id))];
        const productsMap = new Map<string, { id: string; name: string; imageUrl: string | null }>();
        
        if (productIds.length > 0) {
          try {
            const { data: products } = await supabaseAdmin
              .from('products')
              .select('id, name, image_url')
              .in('id', productIds);
            
            if (products) {
              products.forEach((product: any) => {
                productsMap.set(product.id, { 
                  id: product.id, 
                  name: product.name,
                  imageUrl: product.image_url || product.imageUrl || null
                });
              });
            }
          } catch (productsError) {
            console.warn('⚠️ [Remitos] Error obteniendo productos (no crítico):', productsError);
          }
        }
        
        remitoItems = itemsData.map((item: any) => ({
          ...item,
          products: item.product_id ? productsMap.get(item.product_id) || { id: item.product_id, name: '', imageUrl: null } : null
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
      remito_items: remitoItems
    };

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const { id: remitoId } = await params;

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

    // Obtener número del remito antes de eliminarlo para el log
    const { data: remitoForLog } = await supabaseAdmin
      .from('remitos')
      .select('number')
      .eq('id', remitoId)
      .single();

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

    // Registrar actividad
    await logUserActivity(session.user.id, 'DELETE_REMITO',
      remitoForLog?.number ? `Eliminó remito #${remitoForLog.number}` : 'Eliminó un remito',
      {
        remitoId: remitoId,
        remitoNumber: remitoForLog?.number
      }
    );

    return NextResponse.json({ message: "Remito eliminado correctamente" });
  } catch (error: any) {
    console.error('Error in remitos DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}