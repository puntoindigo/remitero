import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Simular el mismo proceso que el endpoint de status para ver qué está pasando
    const url = new URL(request.url);
    const remitoId = url.searchParams.get('remitoId');
    const status = url.searchParams.get('status');

    console.log('=== DEBUG LOGS ENDPOINT ===');
    console.log('Remito ID:', remitoId);
    console.log('Status:', status);
    console.log('Status type:', typeof status);
    console.log('Session user:', session.user);
    console.log('===========================');

    // Validaciones básicas
    if (!status) {
      console.log('Error: No status provided');
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El estado es requerido." 
      }, { status: 400 });
    }

    const validStatuses = ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO'];
    if (!validStatuses.includes(status)) {
      console.log('Error: Invalid status:', status, 'Valid statuses:', validStatuses);
      return NextResponse.json({ 
        error: "Estado inválido", 
        message: `El estado debe ser: ${validStatuses.join(', ')}.` 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Debug logs endpoint working",
      data: {
        remitoId,
        status,
        statusType: typeof status,
        validStatuses,
        sessionUser: session.user
      }
    });

  } catch (error: any) {
    console.error('Error in debug-logs GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado.",
      details: error.message
    }, { status: 500 });
  }
}
