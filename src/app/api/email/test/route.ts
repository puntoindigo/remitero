import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Endpoint de diagnóstico para verificar la configuración de email
 * Solo accesible para SUPERADMIN
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN puede verificar la configuración
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede verificar la configuración de email." 
      }, { status: 403 });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    const config = {
      hasEmailUser: !!emailUser,
      hasEmailPassword: !!emailPassword,
      emailUserLength: emailUser?.length || 0,
      emailPasswordLength: emailPassword?.length || 0,
      emailUserPreview: emailUser ? `${emailUser.substring(0, 3)}***@${emailUser.split('@')[1] || '***'}` : 'No configurado',
      hasNextAuthUrl: !!nextAuthUrl,
      nextAuthUrl: nextAuthUrl || 'No configurado',
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json({
      status: 'ok',
      message: 'Configuración de email',
      config,
      ready: config.hasEmailUser && config.hasEmailPassword && config.hasNextAuthUrl
    });
  } catch (error: any) {
    console.error('Error en test de email:', error);
    return NextResponse.json({ 
      error: "Error interno",
      message: error.message 
    }, { status: 500 });
  }
}

