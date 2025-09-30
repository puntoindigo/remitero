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

    // Solo SUPERADMIN puede usar este endpoint de debug
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede acceder a este endpoint." 
      }, { status: 403 });
    }

    // Consulta directa a la base de datos sin filtros
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        company_id,
        created_at,
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (allUsersError) {
      console.error('Error fetching all users:', allUsersError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los usuarios."
      }, { status: 500 });
    }

    // También consultar empresas
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('id, name, created_at')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      debug: true,
      session: {
        userId: session.user.id,
        userRole: session.user.role,
        userCompanyId: session.user.companyId
      },
      stats: {
        totalUsers: allUsers?.length || 0,
        totalCompanies: companies?.length || 0
      },
      users: allUsers || [],
      companies: companies || []
    });
  } catch (error: any) {
    console.error('Error in debug-users GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
