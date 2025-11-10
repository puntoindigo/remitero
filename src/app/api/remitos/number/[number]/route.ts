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
    
    // Si no hay sesión pero es una petición de impresión, permitir acceso público
    if (!session?.user && isPrintRequest) {
      console.log('[API] Permitiendo acceso público para impresión');
      // Continuar sin verificación de permisos para impresión pública
    } else if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Obtener el remito por número con todas sus relaciones
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
      .eq('number', remitoNumberInt);
    
    // Si hay sesión y no es SUPERADMIN, filtrar por company_id
    // PERO solo si NO es una petición de impresión (para permitir impresión en nueva pestaña)
    if (session?.user && session.user.role !== 'SUPERADMIN' && session.user.companyId && !isPrintRequest) {
      console.log('[API] Filtrando por company_id:', session.user.companyId);
      query = query.eq('company_id', session.user.companyId);
    } else if (isPrintRequest) {
      console.log('[API] Petición de impresión - NO filtrando por company_id');
    }
    
    const { data: remito, error } = await query.single();
    
    console.log('[API] Query result:', {
      found: !!remito,
      error: error?.message || error?.code,
      remitoId: remito?.id,
      remitoCompanyId: remito?.company_id
    });

    if (error || !remito) {
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
