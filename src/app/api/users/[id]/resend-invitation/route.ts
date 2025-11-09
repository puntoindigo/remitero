import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo ADMIN y SUPERADMIN pueden reenviar invitaciones
    if (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    
    console.log('📧 [Resend Invitation] Iniciando proceso para usuario:', userId);

    // Obtener el usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ [Resend Invitation] Error al obtener usuario:', {
        error: userError,
        userId
      });
      return NextResponse.json(
        { error: "Usuario no encontrado", details: userError.message },
        { status: 404 }
      );
    }

    if (!user) {
      console.error('❌ [Resend Invitation] Usuario no encontrado:', userId);
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log('✅ [Resend Invitation] Usuario encontrado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Construir la URL de login
    const loginUrl = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL.trim()}/auth/login`
      : 'https://remitero-dev.vercel.app/auth/login';

    console.log('📧 [Resend Invitation] Preparando envío de email:', {
      to: user.email,
      userName: user.name || user.email.split('@')[0],
      loginUrl
    });

    // Enviar el email de invitación
    try {
      const emailSent = await sendInvitationEmail({
        to: user.email,
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        role: user.role,
        loginUrl
      });

      if (!emailSent) {
        console.error('❌ [Resend Invitation] sendInvitationEmail retornó false');
        return NextResponse.json(
          { 
            error: "Error al enviar el email de invitación. Verifica la configuración de email.",
            hint: "Asegúrate de tener configuradas las variables GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN y EMAIL_USER en Vercel."
          },
          { status: 500 }
        );
      }

      console.log('✅ [Resend Invitation] Email enviado exitosamente');
    } catch (emailError: any) {
      console.error('❌ [Resend Invitation] Error al llamar sendInvitationEmail:', {
        message: emailError.message,
        stack: emailError.stack,
        name: emailError.name,
        code: emailError.code,
        responseCode: emailError.responseCode,
        responseMessage: emailError.responseMessage,
        userId,
        userEmail: user.email
      });
      
      // Mensaje más amigable para el usuario
      let userMessage = "Error al enviar el email de invitación.";
      if (emailError.message?.includes('refresh token')) {
        userMessage = "Error de autenticación OAuth2. Verifica que el refresh token sea válido.";
      } else if (emailError.message?.includes('access token')) {
        userMessage = "Error al obtener token de acceso. Verifica la configuración OAuth2.";
      } else if (emailError.code === 'EAUTH' || emailError.responseCode === 535) {
        userMessage = "Error de autenticación con Gmail. Verifica las credenciales.";
      }
      
      return NextResponse.json(
        { 
          error: userMessage,
          details: emailError.message,
          hint: "Revisa los logs del servidor para más detalles."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitación reenviada correctamente"
    });

  } catch (error: any) {
    console.error('❌ [API] Error al reenviar invitación:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error.message || "Error al reenviar invitación" },
      { status: 500 }
    );
  }
}

