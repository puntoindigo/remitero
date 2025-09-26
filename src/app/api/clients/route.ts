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
        company_id,
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Solo SUPERADMIN puede ver clientes de todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      if (!session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      query = query.eq('company_id', session.user.companyId);
    }

    const { data: clients, error } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los clientes."
      }, { status: 500 });
    }

    return NextResponse.json(clients);
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
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, phone, email, companyId } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre del cliente es requerido." 
      }, { status: 400 });
    }

    // Determinar companyId
    let finalCompanyId = companyId;
    if (session.user.role !== 'SUPERADMIN' && !companyId) {
      finalCompanyId = session.user.companyId;
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
        company_id,
        companies (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el cliente."
      }, { status: 500 });
    }

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    console.error('Error in clients POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
