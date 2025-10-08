import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateEstadoForCompany } from "@/lib/utils/estado-validator";

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
    const { status, companyId } = body;

    console.log('Test status endpoint - Input:', { status, companyId, userRole: session.user.role });

    if (!status || !companyId) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "Status y companyId son requeridos." 
      }, { status: 400 });
    }

    const estadoValidation = await validateEstadoForCompany(status, companyId);
    console.log('Test status endpoint - Validation result:', estadoValidation);

    return NextResponse.json({
      success: true,
      input: { status, companyId, userRole: session.user.role },
      validation: estadoValidation
    });

  } catch (error: any) {
    console.error('Error in test status endpoint:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message || "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
