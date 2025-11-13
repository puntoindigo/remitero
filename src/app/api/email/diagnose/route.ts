import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createTransporter } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN puede diagnosticar
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede diagnosticar el sistema de email." 
      }, { status: 403 });
    }

    // Verificar variables de entorno
    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPassword = process.env.EMAIL_PASSWORD?.trim();
    const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
    const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
    const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

    const hasOAuth2 = !!(oauthClientId && oauthClientSecret && oauthRefreshToken && emailUser);
    const hasPassword = !!emailPassword;

    const config = {
      hasEmailUser: !!emailUser,
      emailUserPreview: emailUser ? `${emailUser.substring(0, 3)}***@${emailUser.split('@')[1] || '***'}` : null,
      hasEmailPassword: hasPassword,
      emailPasswordLength: emailPassword?.length || 0,
      hasOAuth2: hasOAuth2,
      hasOAuthClientId: !!oauthClientId,
      hasOAuthClientSecret: !!oauthClientSecret,
      hasOAuthRefreshToken: !!oauthRefreshToken,
      canSendEmails: hasOAuth2 || (hasPassword && emailPassword?.length === 16),
      environment: process.env.VERCEL_ENV || 'development',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not-set'
    };

    // Intentar crear transporter
    let transporterStatus = null;
    try {
      const transporter = await createTransporter();
      if (transporter) {
        transporterStatus = {
          created: true,
          message: 'Transporter creado exitosamente'
        };
        
        // Intentar verificar conexión (puede ser lento)
        try {
          await transporter.verify();
          transporterStatus.verified = true;
          transporterStatus.message = 'Transporter creado y verificado exitosamente';
        } catch (verifyError: any) {
          transporterStatus.verified = false;
          transporterStatus.verifyError = verifyError.message;
          transporterStatus.message = 'Transporter creado pero verificación falló';
        }
      } else {
        transporterStatus = {
          created: false,
          message: 'No se pudo crear el transporter'
        };
      }
    } catch (error: any) {
      transporterStatus = {
        created: false,
        error: error.message,
        message: 'Error al crear transporter'
      };
    }

    return NextResponse.json({
      success: true,
      config,
      transporter: transporterStatus,
      recommendations: getRecommendations(config, transporterStatus)
    });
  } catch (error: any) {
    console.error('❌ [Email Diagnose] Error:', error);
    return NextResponse.json({ 
      error: "Error interno", 
      message: error.message 
    }, { status: 500 });
  }
}

function getRecommendations(config: any, transporter: any): string[] {
  const recommendations: string[] = [];

  if (!config.hasEmailUser) {
    recommendations.push('❌ Configura EMAIL_USER en Vercel');
  }

  if (!config.canSendEmails) {
    if (!config.hasOAuth2 && !config.hasEmailPassword) {
      recommendations.push('❌ Configura OAuth2 (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN) O EMAIL_PASSWORD');
    } else if (config.hasEmailPassword && config.emailPasswordLength !== 16) {
      recommendations.push(`❌ EMAIL_PASSWORD debe tener exactamente 16 caracteres (actual: ${config.emailPasswordLength})`);
      recommendations.push('   Genera una nueva contraseña de aplicación en: https://myaccount.google.com/apppasswords');
    }
  }

  if (transporter && !transporter.created) {
    recommendations.push('❌ No se pudo crear el transporter - revisa las variables de entorno');
  }

  if (transporter && transporter.created && !transporter.verified) {
    recommendations.push('⚠️ Transporter creado pero verificación falló - revisa las credenciales');
    if (transporter.verifyError) {
      recommendations.push(`   Error: ${transporter.verifyError}`);
    }
  }

  if (config.canSendEmails && transporter?.verified) {
    recommendations.push('✅ Configuración correcta - el sistema de email debería funcionar');
  }

  return recommendations;
}

