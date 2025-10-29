import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
    
    // Determinar qué companyId usar
    const effectiveCompanyId = companyId || session.user.companyId;

    // Solo SUPERADMIN puede ver estados de todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      if (!effectiveCompanyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
    }

    // Optimización: Sin JOIN de companies para máxima velocidad
    let query = supabaseAdmin
      .from('estados_remitos')
      .select(`
        id,
        name,
        description,
        color,
        icon,
        is_active,
        is_default,
        sort_order,
        created_at,
        updated_at,
        company_id
      `)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    // Filtrar por empresa si no es SUPERADMIN o si se especifica companyId
    if (effectiveCompanyId) {
      query = query.eq('company_id', effectiveCompanyId);
    }

    const { data: estados, error } = await query;

    if (error) {
      console.error('Error fetching estados remitos:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los estados de remitos."
      }, { status: 500 });
    }

    // Agregar estructura mínima sin JOIN costoso
    const estadosWithCompanies = (estados || []).map((estado: any) => ({
      ...estado,
      companies: estado.company_id ? { id: estado.company_id, name: '' } : null
    }));

    return NextResponse.json(estadosWithCompanies || []);
  } catch (error) {
    console.error('Error en GET /api/estados-remitos:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado al procesar la solicitud."
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [API POST /estados-remitos] Iniciando request...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.error('❌ [API POST] Sin sesión');
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    console.log('🔵 [API POST] Usuario:', session.user.email, 'Role:', session.user.role);

    const body = await request.json();
    console.log('🔵 [API POST] Body recibido:', body);
    
    const { name, description, color, icon, is_active = true, sort_order = 0 } = body;

    // Validaciones
    if (!name || name.trim() === '') {
      console.error('❌ [API POST] Nombre faltante');
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre del estado es requerido." 
      }, { status: 400 });
    }

    // Obtener companyId del body si está presente (para impersonation)
    const { companyId: bodyCompanyId } = body;
    
    // Determinar companyId
    let companyId = bodyCompanyId || session.user.companyId;
    
    console.log('🔵 [API POST] CompanyId determinado:', companyId);
    
    // Verificar que se pueda determinar la empresa
    if (!companyId) {
      console.error('❌ [API POST] No se pudo determinar la empresa');
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "No se pudo determinar la empresa." 
      }, { status: 400 });
    }

    // Verificar que no exista un estado con el mismo nombre en la empresa
    console.log('🔵 [API POST] Verificando duplicados...');
    const { data: existingEstado } = await supabaseAdmin
      .from('estados_remitos')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', name.trim())
      .single();

    if (existingEstado) {
      console.error('❌ [API POST] Estado duplicado');
      return NextResponse.json({ 
        error: "Estado duplicado", 
        message: "Ya existe un estado con ese nombre en la empresa." 
      }, { status: 400 });
    }

    // Obtener el siguiente sort_order para la empresa
    console.log('🔵 [API POST] Obteniendo sort_order...');
    const { data: lastEstado } = await supabaseAdmin
      .from('estados_remitos')
      .select('sort_order')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = lastEstado ? lastEstado.sort_order + 1 : (sort_order || 100);
    console.log('🔵 [API POST] Sort order calculado:', nextSortOrder);

    // Crear el estado
    console.log('🔵 [API POST] Insertando en BD...');
    const estadoToInsert = {
      company_id: companyId,
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#6b7280',
      icon: icon || '📋',
      is_active: is_active,
      is_default: false,
      sort_order: nextSortOrder
    };
    console.log('🔵 [API POST] Datos a insertar:', estadoToInsert);
    
    const { data: newEstado, error } = await supabaseAdmin
      .from('estados_remitos')
      .insert([estadoToInsert])
      .select(`
        id,
        name,
        description,
        color,
        icon,
        is_active,
        is_default,
        sort_order,
        created_at,
        updated_at,
        company_id
      `)
      .single();

    if (error) {
      console.error('❌ [API POST] Error en Supabase:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el estado de remito."
      }, { status: 500 });
    }

    // Agregar estructura mínima sin JOIN costoso
    const estadoWithCompany = {
      ...newEstado,
      companies: newEstado.company_id ? { id: newEstado.company_id, name: '' } : null
    };

    console.log('✅ [API POST] Estado creado exitosamente:', estadoWithCompany);
    return NextResponse.json(estadoWithCompany, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/estados-remitos:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado al procesar la solicitud."
    }, { status: 500 });
  }
}
