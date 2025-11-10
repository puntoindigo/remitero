import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN puede usar este endpoint de debug
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede usar este endpoint." 
      }, { status: 403 });
    }

    const { id: userId } = await params;

    // Verificar si la tabla existe y tiene datos
    const { data: allLogs, error: allLogsError } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // Contar total de registros
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*', { count: 'exact', head: true });

    // Logs específicos del usuario
    const { data: userLogs, error: userLogsError } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Verificar estructura de la tabla
    const { data: tableInfo, error: tableInfoError } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .limit(1);

    return NextResponse.json({
      debug: {
        userId,
        sessionUserId: session.user.id,
        tableExists: !tableInfoError,
        totalRecordsInTable: totalCount || 0,
        userSpecificRecords: userLogs?.length || 0,
        errors: {
          allLogsError: allLogsError ? {
            message: allLogsError.message,
            code: allLogsError.code,
            details: allLogsError.details
          } : null,
          countError: countError ? {
            message: countError.message,
            code: countError.code
          } : null,
          userLogsError: userLogsError ? {
            message: userLogsError.message,
            code: userLogsError.code,
            details: userLogsError.details
          } : null,
          tableInfoError: tableInfoError ? {
            message: tableInfoError.message,
            code: tableInfoError.code
          } : null
        }
      },
      sampleLogs: allLogs?.slice(0, 10).map(log => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        description: log.description,
        created_at: log.created_at
      })) || [],
      userLogs: userLogs?.map(log => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        description: log.description,
        created_at: log.created_at
      })) || []
    });
  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message || "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

