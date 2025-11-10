import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserActivityLogs } from "@/lib/user-activity-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validar que userId sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      console.error('❌ [Activity Logs API] Invalid userId format:', {
        userId,
        userIdType: typeof userId,
        userIdLength: userId?.length
      });
      return NextResponse.json({ 
        error: "ID de usuario inválido", 
        message: "El ID de usuario proporcionado no es válido." 
      }, { status: 400 });
    }

    console.log('📋 [Activity Logs API] Request received:', {
      userId,
      userIdType: typeof userId,
      userIdLength: userId?.length,
      sessionUserId: session.user.id,
      sessionUserRole: session.user.role,
      page,
      limit,
      userIdMatches: session.user.id === userId
    });

    // Verificar permisos: solo ADMIN y SUPERADMIN pueden ver logs de otros usuarios
    // Los usuarios pueden ver sus propios logs
    if (session.user.role !== 'SUPERADMIN' && 
        session.user.role !== 'ADMIN' && 
        session.user.id !== userId) {
      console.warn('⚠️ [Activity Logs API] Permission denied:', {
        sessionUserId: session.user.id,
        requestedUserId: userId,
        sessionUserRole: session.user.role,
        idsMatch: session.user.id === userId
      });
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para ver estos logs." 
      }, { status: 403 });
    }

    const offset = page * limit;
    console.log('📋 [Activity Logs API] Fetching logs:', { 
      userId, 
      page, 
      limit, 
      offset,
      userIdTrimmed: userId.trim(),
      userIdLength: userId.length
    });
    
    const logs = await getUserActivityLogs(userId.trim(), limit, offset);
    
    console.log('📋 [Activity Logs API] Returning logs:', { 
      userId, 
      logsCount: logs.length,
      hasLogs: logs.length > 0,
      logs: logs.length > 0 ? logs.slice(0, 3).map(l => ({ 
        id: l.id, 
        user_id: l.user_id,
        action: l.action, 
        created_at: l.created_at 
      })) : 'No logs'
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error in activity logs GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

