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
    
    // Obtener el remito directamente por número (sin filtros de company_id para impresión)
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
      .eq('number', remitoNumberInt)
      .maybeSingle();

    console.log('[API] Resultado de consulta:', {
      found: !!remito,
      error: error?.message || error?.code,
      remitoId: remito?.id,
      hasClients: !!remito?.clients,
      hasCompanies: !!remito?.companies,
      hasEstados: !!remito?.estados_remitos,
      itemsCount: remito?.remito_items?.length || 0
    });

    if (error) {
      console.error('[API] Error obteniendo remito:', error);
      console.error('[API] Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: "Error al buscar remito",
        message: error.message || "Ocurrió un error al buscar el remito."
      }, { status: 500 });
    }

    if (!remito) {
      console.log('[API] Remito no encontrado con número:', remitoNumberInt);
      return NextResponse.json({ 
        error: "Remito no encontrado",
        message: `El remito #${remitoNumberInt} no existe.`
      }, { status: 404 });
    }

    // Verificar permisos solo si NO es petición de impresión y hay sesión
    if (!isPrintRequest && session?.user) {
      if (session.user.role !== 'SUPERADMIN' && remito.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado",
          message: "No tienes permisos para ver este remito."
        }, { status: 403 });
      }
    }

    // Construir respuesta con datos completos
    try {
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
