import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/email";

/**
 * Endpoint de test para enviar un email real de prueba
 * Solo accesible para ADMIN y SUPERADMIN
 * Envía un email de prueba a puntoindigo3@gmail.com
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo ADMIN y SUPERADMIN pueden usar este endpoint de test
    if (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    // Construir la URL de login
    const loginUrl = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL.trim()}/auth/login`
      : 'https://remitero-dev.vercel.app/auth/login';

    console.log('🧪 [Email Test] Iniciando envío de email de prueba...');
    console.log('🧪 [Email Test] Destinatario: puntoindigo3@gmail.com');
    console.log('🧪 [Email Test] Login URL:', loginUrl);

    // Enviar el email de prueba
    try {
      const emailSent = await sendInvitationEmail({
        to: 'puntoindigo3@gmail.com',
        userName: 'Usuario de Prueba',
        userEmail: 'puntoindigo3@gmail.com',
        role: 'ADMIN',
        loginUrl
      });

      if (!emailSent) {
        console.error('❌ [Email Test] sendInvitationEmail retornó false');
        return NextResponse.json(
          { 
            success: false,
            error: "Error al enviar el email de prueba. Verifica la configuración de email.",
            details: "sendInvitationEmail retornó false. Revisa los logs del servidor para más detalles."
          },
          { status: 500 }
        );
      }

      console.log('✅ [Email Test] Email de prueba enviado exitosamente');

      return NextResponse.json({
        success: true,
        message: "Email de prueba enviado correctamente a puntoindigo3@gmail.com",
        sentTo: 'puntoindigo3@gmail.com',
        timestamp: new Date().toISOString()
      });

    } catch (emailError: any) {
      console.error('❌ [Email Test] Error al llamar sendInvitationEmail:', {
        message: emailError.message,
        stack: emailError.stack,
        name: emailError.name,
        code: emailError.code,
        responseCode: emailError.responseCode,
        responseMessage: emailError.responseMessage
      });

      return NextResponse.json(
        { 
          success: false,
          error: `Error al enviar el email: ${emailError.message || "Error desconocido"}`,
          details: {
            code: emailError.code,
            responseCode: emailError.responseCode,
            responseMessage: emailError.responseMessage,
            name: emailError.name
          }
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ [Email Test] Error general:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Error al procesar la solicitud de test de email",
        details: {
          name: error.name,
          message: error.message
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET para verificar configuración de email sin enviar
 * Compatible con código antiguo y nuevo
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo ADMIN y SUPERADMIN pueden ver la configuración
    if (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const emailUser = process.env.EMAIL_USER?.trim();
    // Leer EMAIL_PASSWORD pero verificar que realmente existe (no undefined)
    const emailPasswordRaw = process.env.EMAIL_PASSWORD;
    const emailPassword = emailPasswordRaw ? emailPasswordRaw.trim() : undefined;
    const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
    
    // Variables OAuth2
    const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
    const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
    const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

    const hasOAuth2 = !!(oauthClientId && oauthClientSecret && oauthRefreshToken);
    const hasAppPassword = !!(emailUser && emailPassword);
    
    // Debug: Log de variables para diagnóstico
    console.log('🔍 [Email Test GET] Variables de entorno:', {
      hasEmailUser: !!emailUser,
      hasEmailPassword: !!emailPassword,
      emailPasswordLength: emailPassword?.length || 0,
      emailPasswordRawLength: emailPasswordRaw?.length || 0,
      hasOAuth2,
      hasOAuthClientId: !!oauthClientId,
      hasOAuthClientSecret: !!oauthClientSecret,
      hasOAuthRefreshToken: !!oauthRefreshToken
    });

    return NextResponse.json({
      status: "ok",
      message: "Configuración de email",
      config: {
        hasEmailUser: !!emailUser,
        emailUserPreview: emailUser 
          ? `${emailUser.substring(0, 3)}***@${emailUser.split('@')[1] || '***'}` 
          : 'No configurado',
        hasNextAuthUrl: !!nextAuthUrl,
        nextAuthUrl: nextAuthUrl || 'No configurado',
        environment: process.env.NODE_ENV || 'unknown',
        // OAuth2
        hasOAuth2: hasOAuth2,
        hasOAuthClientId: !!oauthClientId,
        oauthClientIdPreview: oauthClientId 
          ? `${oauthClientId.substring(0, 20)}...` 
          : 'No configurado',
        hasOAuthClientSecret: !!oauthClientSecret,
        hasOAuthRefreshToken: !!oauthRefreshToken,
        // App Password (fallback)
        hasAppPassword: hasAppPassword,
        emailPasswordLength: emailPassword?.length || 0
      },
      ready: hasOAuth2 || hasAppPassword,
      method: hasOAuth2 ? 'OAuth2' : (hasAppPassword ? 'App Password' : 'No configurado'),
      recommendation: hasOAuth2 ? 'Usando OAuth2 (recomendado)' : (hasAppPassword ? 'Usando App Password (fallback)' : '⚠️ Configura OAuth2 o App Password')
    });

  } catch (error: any) {
    console.error('❌ [Email Test] Error al verificar configuración:', error);
    return NextResponse.json(
      { error: error.message || "Error al verificar configuración" },
      { status: 500 }
    );
  }
}
