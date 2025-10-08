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

    // Estados predefinidos temporales hasta que se cree la tabla
    const estadosPredefinidos = [
      {
        id: "1",
        name: "Pendiente",
        description: "Remito creado, esperando procesamiento",
        color: "#f59e0b",
        icon: "⏰",
        is_active: true,
        is_default: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company_id: effectiveCompanyId || "temp",
        companies: { 
          id: effectiveCompanyId || "temp", 
          name: "Empresa" 
        }
      },
      {
        id: "2",
        name: "Preparado",
        description: "Remito preparado para entrega",
        color: "#10b981",
        icon: "✅",
        is_active: true,
        is_default: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company_id: effectiveCompanyId || "temp",
        companies: { 
          id: effectiveCompanyId || "temp", 
          name: "Empresa" 
        }
      },
      {
        id: "3",
        name: "Entregado",
        description: "Remito entregado al cliente",
        color: "#3b82f6",
        icon: "🚚",
        is_active: true,
        is_default: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company_id: effectiveCompanyId || "temp",
        companies: { 
          id: effectiveCompanyId || "temp", 
          name: "Empresa" 
        }
      },
      {
        id: "4",
        name: "Cancelado",
        description: "Remito cancelado",
        color: "#ef4444",
        icon: "❌",
        is_active: true,
        is_default: true,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company_id: effectiveCompanyId || "temp",
        companies: { 
          id: effectiveCompanyId || "temp", 
          name: "Empresa" 
        }
      }
    ];

    return NextResponse.json(estadosPredefinidos);
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
