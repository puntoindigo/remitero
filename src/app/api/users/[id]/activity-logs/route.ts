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

    // Verificar permisos: solo ADMIN y SUPERADMIN pueden ver logs de otros usuarios
    // Los usuarios pueden ver sus propios logs
    if (session.user.role !== 'SUPERADMIN' && 
        session.user.role !== 'ADMIN' && 
        session.user.id !== userId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para ver estos logs." 
      }, { status: 403 });
    }

    const offset = page * limit;
    const logs = await getUserActivityLogs(userId, limit, offset);

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error in activity logs GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

