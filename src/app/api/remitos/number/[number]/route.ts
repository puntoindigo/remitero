import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformRemito } from "@/lib/utils/supabase-transform";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { number: remitoNumber } = await params;
    const remitoNumberInt = parseInt(remitoNumber, 10);
    
    if (isNaN(remitoNumberInt)) {
      return NextResponse.json({ 
        error: "Número inválido",
        message: "El número de remito especificado no es válido."
      }, { status: 400 });
    }
    
    // Detectar si es petición de impresión
    const referer = request.headers.get('referer') || '';
    const printHeader = request.headers.get('x-print-request');
    const isPrintRequest = referer.includes('/print') || 
                          request.url.includes('/print') || 
                          printHeader === 'true';
    
    // Para peticiones de impresión, permitir acceso sin sesión
    if (!isPrintRequest && !session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    console.log('[API] Buscando remito número:', remitoNumberInt, 'isPrintRequest:', isPrintRequest);
    
    // Obtener company_id de query params si está disponible (para peticiones de impresión)
    const { searchParams: urlSearchParams } = new URL(request.url);
    const companyIdFromQuery = urlSearchParams.get('companyId');
    
    // Determinar qué company_id usar: primero de query params, luego de sesión
    let effectiveCompanyId: string | null = null;
    if (companyIdFromQuery) {
      effectiveCompanyId = companyIdFromQuery;
      console.log('[API] Usando company_id de query params:', effectiveCompanyId);
    } else if (session?.user && session.user.role !== 'SUPERADMIN' && session.user.companyId) {
      effectiveCompanyId = session.user.companyId;
      console.log('[API] Usando company_id de sesión:', effectiveCompanyId);
    }
    
    // Construir query base sin JOINs automáticos (evita problemas con foreign keys en schema dev)
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
        created_by_id
      `)
      .eq('number', remitoNumberInt);
    
    // Filtrar por empresa si tenemos un company_id
    // Esto es importante porque el número de remito es único por empresa, no globalmente
    if (effectiveCompanyId) {
      query = query.eq('company_id', effectiveCompanyId);
      console.log('[API] Filtrando por company_id:', effectiveCompanyId);
    }
    
    // Obtener el remito directamente por número
    // Usamos .select() sin .maybeSingle() porque las relaciones anidadas pueden crear múltiples filas
    const { data: remitosData, error } = await query;

    console.log('[API] Resultado de consulta:', {
      found: !!remitosData && remitosData.length > 0,
      count: remitosData?.length || 0,
      error: error?.message || error?.code,
    });

    if (error) {
      console.error('[API] Error obteniendo remito:', error);
      console.error('[API] Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: "Error al buscar remito",
        message: error.message || "Ocurrió un error al buscar el remito."
      }, { status: 500 });
    }

    if (!remitosData || remitosData.length === 0) {
      console.log('[API] Remito no encontrado con número:', remitoNumberInt);
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: `El remito #${remitoNumberInt} no existe.`
      }, { status: 404 });
    }

    // Agrupar los resultados: tomar el primer remito único y consolidar los items
    // Cuando hay múltiples items, Supabase devuelve una fila por cada item
    const firstRemito = remitosData[0];
    
    // Consolidar items de todas las filas (si hay múltiples filas por los items)
    const allItems: any[] = [];
    const uniqueRemitoIds = new Set<string>();
    
    remitosData.forEach((row: any) => {
      uniqueRemitoIds.add(row.id);
      if (row.remito_items && Array.isArray(row.remito_items)) {
        row.remito_items.forEach((item: any) => {
          // Evitar duplicados de items
          if (!allItems.find(i => i.id === item.id)) {
            allItems.push(item);
          }
        });
      }
    });

    // Si hay múltiples remitos con el mismo número y no hay filtro de empresa, es un problema
    if (uniqueRemitoIds.size > 1) {
      console.warn('[API] Advertencia: Múltiples remitos encontrados con el mismo número:', remitoNumberInt);
      console.warn('[API] Remitos encontrados:', Array.from(uniqueRemitoIds));
      
      // Si es petición de impresión y no hay sesión, no podemos determinar cuál es el correcto
      if (isPrintRequest && !session?.user) {
        return NextResponse.json({ 
          error: "Remito ambiguo",
          message: `Se encontraron múltiples remitos con el número ${remitoNumberInt}. Por favor, inicia sesión para identificar el remito correcto.`
        }, { status: 400 });
      }
    }

    // Construir el objeto remito consolidado
    const remito = {
      ...firstRemito,
      remito_items: allItems
    };

    // Verificar permisos solo si NO es petición de impresión y hay sesión
    if (!isPrintRequest && session?.user) {
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

    // Obtener productos para items si hay product_id
    const productIds = [...new Set((remito.remito_items || []).filter((i: any) => i.product_id).map((i: any) => i.product_id))];
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

    // Construir respuesta con datos completos
    try {
      const remitoWithStructures = {
        ...remito,
        clients: client || (remito.client_id ? {
          id: remito.client_id,
          name: '',
          email: '',
          phone: '',
          address: ''
        } : null),
        companies: company || (remito.company_id ? {
          id: remito.company_id,
          name: ''
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
        remito_items: (remito.remito_items || []).map((item: any) => ({
          ...item,
          products: item.product_id ? productsMap.get(item.product_id) || { id: item.product_id, name: '' } : null
        }))
      };

      const transformed = transformRemito(remitoWithStructures);
      return NextResponse.json(transformed);
    } catch (transformError: any) {
      console.error('[API] Error transformando remito:', transformError);
      console.error('[API] Stack:', transformError?.stack);
      console.error('[API] Remito data:', JSON.stringify(remito, null, 2));
      return NextResponse.json({ 
        error: "Error procesando remito",
        message: transformError?.message || "Ocurrió un error al procesar los datos del remito."
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in remitos GET by number:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
