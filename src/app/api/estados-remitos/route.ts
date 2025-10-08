import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  console.log('GET /api/estados-remitos - Starting');
  
  try {
    // Simplificar temporalmente para debug
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    console.log('GET /api/estados-remitos - companyId:', companyId);
    
    return NextResponse.json({ 
      success: true, 
      message: "Estados endpoint simplified for debug",
      companyId: companyId
    });
  } catch (error: any) {
    console.error('GET /api/estados-remitos - Error:', error);
    return NextResponse.json({ 
      error: "Error in estados endpoint",
      message: error.message 
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

    const body = await request.json();
    const { name, description, color, icon, is_active = true, sort_order = 0 } = body;

    // Validaciones
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre del estado es requerido." 
      }, { status: 400 });
    }

    // Verificar que el usuario tenga companyId (excepto SUPERADMIN)
    // Durante impersonation, SUPERADMIN puede crear estados sin companyId en la sesión
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    // Determinar companyId
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "No se pudo determinar la empresa." 
      }, { status: 400 });
    }

    // Verificar que no exista un estado con el mismo nombre en la empresa
    const { data: existingEstado } = await supabaseAdmin
      .from('estados_remitos')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', name.trim())
      .single();

    if (existingEstado) {
      return NextResponse.json({ 
        error: "Estado duplicado", 
        message: "Ya existe un estado con ese nombre en la empresa." 
      }, { status: 400 });
    }

    // Crear el estado
    const { data: newEstado, error } = await supabaseAdmin
      .from('estados_remitos')
      .insert([{
        company_id: companyId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#6b7280',
        icon: icon || '📋',
        is_active: is_active,
        is_default: false, // Los estados creados por el usuario no son predefinidos
        sort_order: sort_order
      }])
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
        company_id,
        companies (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating estado remito:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el estado de remito."
      }, { status: 500 });
    }

    return NextResponse.json(newEstado, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/estados-remitos:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado al procesar la solicitud."
    }, { status: 500 });
  }
}
