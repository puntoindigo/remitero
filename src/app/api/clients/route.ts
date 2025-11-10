import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformClients, transformClient } from "@/lib/utils/supabase-transform";

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
    const countToday = searchParams.get('countToday') === 'true';

    // Optimización: Sin JOINs innecesarios para máxima velocidad
    let query = supabaseAdmin
      .from('clients')
      .select(`
        id,
        name,
        address,
        phone,
        email,
        created_at,
        updated_at,
        company_id
      `)
      .order('created_at', { ascending: false });

    // Determinar qué companyId usar
    const effectiveCompanyId = companyId || session.user.companyId;

    if (countToday) {
      // Si solo necesitamos el conteo de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let countQuery = supabaseAdmin
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (session.user.role !== 'SUPERADMIN') {
        if (!effectiveCompanyId) {
          return NextResponse.json({ 
            error: "No autorizado", 
            message: "Usuario no asociado a una empresa." 
          }, { status: 401 });
        }
        countQuery = countQuery.eq('company_id', effectiveCompanyId);
      } else if (effectiveCompanyId) {
        countQuery = countQuery.eq('company_id', effectiveCompanyId);
      }

      const { count, error } = await countQuery;
      
      if (error) {
        console.error('Error counting clients today:', error);
        return NextResponse.json({ error: "Error al contar clientes" }, { status: 500 });
      }

      return NextResponse.json({ count: count || 0 });
    }

    // Solo SUPERADMIN puede ver clientes de todas las empresas
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

    const { data: clients, error } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los clientes."
      }, { status: 500 });
    }

    // Agregar estructura mínima sin JOINs costosos
    const clientsWithDefaults = (clients || []).map((client: any) => ({
      ...client,
      companies: client.company_id ? { id: client.company_id, name: '' } : null,
      remitos: [] // Array vacío por defecto
    }));

    return NextResponse.json(transformClients(clientsWithDefaults));
  } catch (error: any) {
    console.error('Error in clients GET:', error);
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
    // Durante impersonation, SUPERADMIN puede crear clientes sin companyId en la sesión
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, phone, email, companyId } = body;

    console.log('POST /api/clients - Request body:', body);
    console.log('POST /api/clients - Session user:', session.user);

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre del cliente es requerido." 
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

    console.log('POST /api/clients - Final companyId:', finalCompanyId);

    if (!finalCompanyId) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "CompanyId es requerido." 
      }, { status: 400 });
    }

    // Verificar que no exista un cliente con el mismo nombre en la empresa
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('company_id', finalCompanyId)
      .eq('name', name)
      .single();

    if (existingClient) {
      return NextResponse.json({ 
        error: "Cliente duplicado", 
        message: "Ya existe un cliente con este nombre en la empresa." 
      }, { status: 409 });
    }

    const { data: newClient, error } = await supabaseAdmin
      .from('clients')
      .insert([{
        name,
        address,
        phone,
        email,
        company_id: finalCompanyId
      }])
      .select(`
        id,
        name,
        address,
        phone,
        email,
        created_at,
        updated_at,
        company_id
      `)
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el cliente."
      }, { status: 500 });
    }

    // Agregar estructura mínima sin JOIN costoso
    const clientWithDefaults = {
      ...newClient,
      companies: newClient.company_id ? { id: newClient.company_id, name: '' } : null,
      remitos: [] // Array vacío por defecto
    };

    return NextResponse.json(transformClient(clientWithDefaults), { status: 201 });
  } catch (error: any) {
    console.error('Error in clients POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
