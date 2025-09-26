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

    return NextResponse.json(companies);
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

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error: any) {
    console.error('Error in companies POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
