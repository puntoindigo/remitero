import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformCompanies, transformCompany } from "@/lib/utils/supabase-transform";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN puede ver todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para ver todas las empresas." 
      }, { status: 403 });
    }

    const { data: companies, error } = await supabaseAdmin
      .from('companies')
      .select(`
        id,
        name,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar las empresas."
      }, { status: 500 });
    }

    return NextResponse.json(transformCompanies(companies));
  } catch (error: any) {
    console.error('Error in companies GET:', error);
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

    // Solo SUPERADMIN puede crear empresas
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para crear empresas." 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre de la empresa es requerido." 
      }, { status: 400 });
    }

    // Verificar que no exista una empresa con el mismo nombre
    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('name', name)
      .single();

    if (existingCompany) {
      return NextResponse.json({ 
        error: "Empresa duplicada", 
        message: "Ya existe una empresa con este nombre." 
      }, { status: 409 });
    }

    const { data: newCompany, error } = await supabaseAdmin
      .from('companies')
      .insert([{ name }])
      .select(`
        id,
        name,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear la empresa."
      }, { status: 500 });
    }

    // Crear estados por defecto para la nueva empresa
    const defaultEstados = [
      {
        name: 'Pendiente',
        description: 'Remito creado, esperando procesamiento',
        color: '#f59e0b',
        icon: '⏰',
        is_active: true,
        is_default: true,
        sort_order: 1
      },
      {
        name: 'Preparado',
        description: 'Remito preparado para entrega',
        color: '#10b981',
        icon: '✅',
        is_active: true,
        is_default: false,
        sort_order: 2
      },
      {
        name: 'Entregado',
        description: 'Remito entregado al cliente',
        color: '#3b82f6',
        icon: '🚚',
        is_active: true,
        is_default: false,
        sort_order: 3
      },
      {
        name: 'Cancelado',
        description: 'Remito cancelado',
        color: '#ef4444',
        icon: '❌',
        is_active: true,
        is_default: false,
        sort_order: 4
      }
    ];

    // Crear los estados por defecto
    try {
      const estadosToInsert = defaultEstados.map(estado => ({
        company_id: newCompany.id,
        name: estado.name,
        description: estado.description,
        color: estado.color,
        icon: estado.icon,
        is_active: estado.is_active,
        is_default: estado.is_default,
        sort_order: estado.sort_order
      }));

      const { error: estadosError } = await supabaseAdmin
        .from('estados_remitos')
        .insert(estadosToInsert);

      if (estadosError) {
        console.error('Error creating default estados:', estadosError);
        // No fallar la creación de la empresa si falla la creación de estados
        // Solo loggear el error
      } else {
        console.log('✅ Estados por defecto creados para la empresa:', newCompany.id);
      }
    } catch (estadosError: any) {
      console.error('Error creating default estados:', estadosError);
      // No fallar la creación de la empresa si falla la creación de estados
    }

    return NextResponse.json(transformCompany(newCompany), { status: 201 });
  } catch (error: any) {
    console.error('Error in companies POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
