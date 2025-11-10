import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logUserActivity, getUserActivityLogs } from "@/lib/user-activity-logger";

export async function POST(
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

    // Solo SUPERADMIN puede usar este endpoint de test
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede usar este endpoint." 
      }, { status: 403 });
    }

    const { id: userId } = await params;

    // Insertar un registro de prueba
    console.log('🧪 [Test Activity] Inserting test activity for user:', userId);
    await logUserActivity(userId, 'OTHER', 'Registro de prueba desde endpoint de test', {
      test: true,
      timestamp: new Date().toISOString()
    });

    // Esperar un momento para que se inserte
    await new Promise(resolve => setTimeout(resolve, 500));

    // Intentar recuperar los logs
    const logs = await getUserActivityLogs(userId, 10, 0);

    return NextResponse.json({
      success: true,
      message: 'Registro de prueba insertado',
      userId,
      logsFound: logs.length,
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        description: log.description,
        created_at: log.created_at
      }))
    });
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message || "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

