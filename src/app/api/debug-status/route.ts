import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const { remitoId, status } = body;

    console.log('=== DEBUG STATUS CHANGE ===');
    console.log('Session User:', session.user);
    console.log('Remito ID:', remitoId);
    console.log('Status:', status);
    console.log('Status type:', typeof status);
    console.log('Body:', body);
    console.log('==========================');

    // Validar que el status sea válido
    const validStatuses = ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO'];
    const isValidStatus = validStatuses.includes(status);

    return NextResponse.json({
      success: true,
      debug: {
        sessionUser: session.user,
        remitoId,
        status,
        statusType: typeof status,
        isValidStatus,
        validStatuses,
        body
      }
    });

  } catch (error: any) {
    console.error('Error in debug-status POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado.",
      details: error.message
    }, { status: 500 });
  }
}
