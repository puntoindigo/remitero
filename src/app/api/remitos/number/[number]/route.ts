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
    
    // Permitir acceso público para impresión (si la ruta incluye /print o tiene header X-Print-Request)
    // Para peticiones de impresión, siempre permitir acceso sin verificar sesión
    const referer = request.headers.get('referer') || '';
    const printHeader = request.headers.get('x-print-request');
    const userAgent = request.headers.get('user-agent') || '';
    const isPrintRequest = referer.includes('/print') || 
                          request.url.includes('/print') || 
                          printHeader === 'true' ||
                          userAgent.includes('print');
    
    console.log('[API] GET remito by number:', {
      remitoNumber: remitoNumberInt,
      hasSession: !!session?.user,
      isPrintRequest,
      referer,
      printHeader,
      url: request.url
    });
    
    // Para peticiones de impresión, siempre permitir acceso (con o sin sesión)
    // Esto permite que funcione en nuevas pestañas donde la sesión puede no estar disponible
    if (isPrintRequest) {
      console.log('[API] Petición de impresión detectada - permitiendo acceso sin restricciones');
    } else if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Primero verificar si el remito existe (sin JOINs para evitar problemas)
    // NO filtrar por company_id en peticiones de impresión
    let existsQuery = supabaseAdmin
      .from('remitos')
      .select('id, number, company_id')
      .eq('number', remitoNumberInt);
    
    // Solo filtrar por company_id si NO es petición de impresión y hay sesión
    if (!isPrintRequest && session?.user && session.user.role !== 'SUPERADMIN' && session.user.companyId) {
      existsQuery = existsQuery.eq('company_id', session.user.companyId);
      console.log('[API] Verificación inicial - filtrando por company_id:', session.user.companyId);
    } else {
      console.log('[API] Verificación inicial - NO filtrando por company_id (isPrintRequest:', isPrintRequest, ')');
    }
    
    const { data: remitoExists, error: existsError } = await existsQuery.maybeSingle();
    
    console.log('[API] Verificación inicial de remito:', {
      exists: !!remitoExists,
      remitoId: remitoExists?.id,
      remitoNumber: remitoExists?.number,
      companyId: remitoExists?.company_id,
      searchedNumber: remitoNumberInt,
      errorCode: existsError?.code,
      errorMessage: existsError?.message
    });
    
    if (existsError && existsError.code !== 'PGRST116') {
      console.error('[API] Error verificando existencia del remito:', existsError);
      return NextResponse.json({ 
        error: "Error al buscar remito",
        message: existsError.message || "Ocurrió un error al buscar el remito."
      }, { status: 500 });
    }
    
    if (!remitoExists) {
      // Intentar buscar sin filtro de company_id para ver si existe pero en otra empresa
      const { data: remitoSinFiltro } = await supabaseAdmin
        .from('remitos')
        .select('id, number, company_id')
        .eq('number', remitoNumberInt)
        .maybeSingle();
      
      if (remitoSinFiltro) {
        console.log('[API] Remito existe pero en otra empresa:', remitoSinFiltro.company_id);
        return NextResponse.json({ 
          error: "Remito no encontrado",
          message: `El remito #${remitoNumberInt} existe pero no tienes acceso a él.`
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: `El remito #${remitoNumberInt} no existe en la base de datos.`
      }, { status: 404 });
    }

    // Ahora obtener el remito completo con todas sus relaciones
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
        companies (
          id,
          name
        ),
        estados_remitos (
          id,
          name,
          color
        ),
        remito_items (
          id,
          product_id,
          quantity,
          product_name,
          product_desc,
          unit_price,
          line_total
        )
      `)
      .eq('id', remitoExists.id);
    
    // Obtener el remito completo (ya verificamos que existe, ahora por ID para evitar problemas)
    const { data: remito, error } = await query.single();
    
    console.log('[API] Query result:', {
      found: !!remito,
      error: error?.message || error?.code,
      remitoId: remito?.id,
      remitoCompanyId: remito?.company_id,
      remitoNumber: remito?.number
    });

    if (error) {
      console.error('[API] Error obteniendo remito completo:', error);
      return NextResponse.json({ 
        error: "Error al obtener remito",
        message: error.message || "Ocurrió un error al obtener los datos del remito."
      }, { status: 500 });
    }

    if (!remito) {
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: "El remito especificado no existe."
      }, { status: 404 });
    }

    // Verificar permisos solo si hay sesión activa Y NO es una petición de impresión
    if (session?.user && !isPrintRequest) {
      if (session.user.role !== 'SUPERADMIN' && remito.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado",
          message: "No tienes permisos para ver este remito."
        }, { status: 403 });
      }
    }

    // Usar datos reales de JOINs cuando estén disponibles
    const remitoWithStructures = {
      ...remito,
      clients: remito.clients || (remito.client_id ? {
        id: remito.client_id,
        name: '',
        email: '',
        phone: '',
        address: ''
      } : null),
      companies: remito.companies || (remito.company_id ? {
        id: remito.company_id,
        name: ''
      } : null),
      users: remito.created_by_id ? {
        id: remito.created_by_id,
        name: '',
        email: ''
      } : null,
      estados_remitos: remito.estados_remitos || (remito.status ? {
        id: remito.status,
        name: '',
        color: '',
        is_active: true
      } : null),
      remito_items: (remito.remito_items || []).map((item: any) => ({
        ...item,
        products: item.product_id ? { id: item.product_id, name: '' } : null
      }))
    };

    return NextResponse.json(transformRemito(remitoWithStructures));
  } catch (error: any) {
    console.error('Error in remitos GET by number:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
