import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Configuración del transporter de Gmail con OAuth2
const createTransporter = async () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  
  // Intentar primero con OAuth2
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  const hasOAuth2Complete = !!(oauthClientId && oauthClientSecret && oauthRefreshToken && emailUser);
  
  console.log('🔍 [Email] Verificando configuración:', {
    hasEmailUser: !!emailUser,
    hasOAuth2Complete: hasOAuth2Complete,
    hasOAuthClientId: !!oauthClientId,
    hasOAuthClientSecret: !!oauthClientSecret,
    hasOAuthRefreshToken: !!oauthRefreshToken,
    emailUserPreview: emailUser ? `${emailUser.substring(0, 3)}***@${emailUser.split('@')[1] || '***'}` : 'No configurado',
    emailPasswordLength: process.env.EMAIL_PASSWORD?.trim().length || 0,
    willUseOAuth2: hasOAuth2Complete
  });

  // Si tenemos OAuth2 configurado, usarlo (PRIORIDAD)
  if (oauthClientId && oauthClientSecret && oauthRefreshToken && emailUser) {
    console.log('🔐 [Email] OAuth2 detectado - Usando OAuth2 (NO contraseña de aplicación)');
    console.log('🔐 [Email] OAuth2 configurado:', {
      hasClientId: !!oauthClientId,
      hasClientSecret: !!oauthClientSecret,
      hasRefreshToken: !!oauthRefreshToken,
      emailUser: emailUser.substring(0, 3) + '***'
    });
    
    try {
      const oauth2Client = new google.auth.OAuth2(
        oauthClientId,
        oauthClientSecret,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: oauthRefreshToken
      });

      // Obtener access token
      let accessToken: string | null | undefined;
      try {
        console.log('🔐 [Email] Obteniendo access token...');
        const accessTokenResponse = await oauth2Client.getAccessToken();
        accessToken = accessTokenResponse.token;
      } catch (tokenError: any) {
        console.error('❌ [Email] Error al obtener access token:', {
          message: tokenError.message,
          code: tokenError.code,
          response: tokenError.response
        });
        throw new Error(`Error al obtener access token: ${tokenError.message}. Verifica que el refresh token sea válido.`);
      }

      if (!accessToken) {
        console.error('❌ [Email] No se pudo obtener access token (token es null/undefined)');
        throw new Error('No se pudo obtener access token. Verifica que el refresh token sea válido.');
      }

      console.log('✅ [Email] Access token obtenido exitosamente');

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailUser,
          clientId: oauthClientId,
          clientSecret: oauthClientSecret,
          refreshToken: oauthRefreshToken,
          accessToken: accessToken
        }
      });

      console.log('✅ [Email] Transporter OAuth2 creado exitosamente - USANDO OAUTH2');
      return transporter;
    } catch (error: any) {
      console.error('❌ [Email] Error al crear transporter OAuth2:', {
        message: error.message,
        code: error.code,
        errorType: error.response?.data?.error || 'unknown'
      });
      
      // Si el error es invalid_grant (token expirado/revocado), hacer fallback a contraseña
      if (error.message?.includes('invalid_grant') || error.response?.data?.error === 'invalid_grant') {
        console.warn('⚠️ [Email] Refresh token inválido/expirado. Intentando fallback a contraseña de aplicación...');
        // Continuar con el código de abajo para intentar contraseña de aplicación
      } else {
        console.error('❌ [Email] OAuth2 falló con error no recuperable');
        throw error; // Lanzar error si no es invalid_grant
      }
    }
  } else {
    console.log('⚠️ [Email] OAuth2 NO configurado. Variables faltantes:', {
      hasClientId: !!oauthClientId,
      hasClientSecret: !!oauthClientSecret,
      hasRefreshToken: !!oauthRefreshToken,
      hasEmailUser: !!emailUser
    });
    console.log('⚠️ [Email] Si OAuth2 no está configurado, se intentará usar contraseña de aplicación');
  }

  // Fallback a contraseña de aplicación si OAuth2 no está configurado o falló
  const emailPassword = process.env.EMAIL_PASSWORD?.trim();
  
  // Si no hay contraseña y OAuth2 falló, no podemos enviar emails
  if (!emailPassword) {
    if (hasOAuth2Complete) {
      // Si OAuth2 estaba configurado pero falló, y no hay contraseña, no podemos enviar
      console.error('❌ [Email] OAuth2 falló y no hay contraseña de aplicación como fallback');
      console.error('❌ [Email] Soluciones:');
      console.error('   1. Obtén un nuevo refresh token válido desde OAuth Playground');
      console.error('   2. O configura EMAIL_PASSWORD como fallback en Vercel');
      return null;
    } else {
      console.error('❌ [Email] No hay método de autenticación configurado');
      console.error('❌ [Email] Para OAuth2 necesitas: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN');
      console.error('❌ [Email] O para contraseña de aplicación: EMAIL_USER, EMAIL_PASSWORD');
      return null;
    }
  }
  
  // Si llegamos aquí, OAuth2 falló o no está configurado, usar contraseña como fallback
  if (hasOAuth2Complete) {
    console.log('⚠️ [Email] Usando contraseña de aplicación como fallback (OAuth2 falló)');
  }
  
  if (!emailUser) {
    console.error('❌ [Email] EMAIL_USER no configurado');
    return null;
  }

  // Validar longitud de contraseña de aplicación (debe ser 16 caracteres)
  if (emailPassword.length !== 16) {
    console.error('❌ [Email] La contraseña de aplicación debe tener exactamente 16 caracteres');
    console.error(`❌ [Email] Longitud actual: ${emailPassword.length} caracteres`);
    console.error('❌ [Email] Genera una nueva contraseña de aplicación en: https://myaccount.google.com/apppasswords');
    return null;
  }

  try {
    console.log('🔑 [Email] Usando contraseña de aplicación (fallback)');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      debug: false,
      logger: false
    });

    console.log('✅ [Email] Transporter creado exitosamente');
    return transporter;
  } catch (error: any) {
    console.error('❌ [Email] Error al crear transporter:', {
      message: error.message,
      code: error.code
    });
    return null;
  }
};

interface SendInvitationEmailParams {
  to: string;
  userName: string;
  userEmail: string;
  role: string;
  loginUrl: string;
}

/**
 * Envía un email de invitación a un nuevo usuario
 */
export async function sendInvitationEmail({
  to,
  userName,
  userEmail,
  role,
  loginUrl
}: SendInvitationEmailParams): Promise<boolean> {
  console.log('📧 [Email] Iniciando envío de email de invitación:', {
    to,
    userName,
    userEmail,
    role,
    loginUrl
  });

  try {
    const transporter = await createTransporter();
    
    if (!transporter) {
      console.error('❌ [Email] No se pudo crear el transporter de email');
      console.error('❌ [Email] Verifica las variables de entorno en Vercel');
      return false;
    }

    // Verificar conexión antes de enviar (opcional, puede ser lento)
    // Comentado temporalmente para evitar errores en producción
    // try {
    //   await transporter.verify();
    //   console.log('✅ [Email] Conexión con servidor de email verificada');
    // } catch (verifyError: any) {
    //   console.error('❌ [Email] Error al verificar conexión con servidor de email:', {
    //     error: verifyError.message,
    //     code: verifyError.code,
    //     command: verifyError.command
    //   });
    //   return false;
    // }

    // Mapear roles a nombres legibles
    const roleNames: Record<string, string> = {
      'SUPERADMIN': 'Super Administrador',
      'ADMIN': 'Administrador',
      'USER': 'Usuario'
    };

    const roleName = roleNames[role] || role;

    const mailOptions = {
      from: `"Sistema de Remitos" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Invitación al Sistema de Remitos',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              text-align: left;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 24px;
            }
            .content {
              margin-bottom: 30px;
            }
            .content p {
              margin: 15px 0;
            }
            .info-box {
              background-color: #f3f4f6;
              border-left: 4px solid #2563eb;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box strong {
              color: #2563eb;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff !important;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
              color: #ffffff !important;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Has sido invitado!</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              
              <p>Has sido invitado a formar parte del <strong>Sistema de Remitos</strong>.</p>
              
              <div class="info-box">
                <p><strong>Tu información de acceso:</strong></p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Rol:</strong> ${roleName}</p>
              </div>
              
              <p>Para acceder al sistema, puedes:</p>
              <ul>
                <li>Iniciar sesión con tu cuenta de Gmail (si tu email es @gmail.com)</li>
                <li>O usar tu email y contraseña si se te asignó una</li>
              </ul>
              
              <div style="text-align: left;">
                <a href="${loginUrl}" class="button" style="color: #ffffff !important;">Acceder al Sistema</a>
              </div>
              
              <p style="margin-top: 30px;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al administrador del sistema.
              </p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Sistema de Remitos - Punto Indigo. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
¡Has sido invitado al Sistema de Remitos!

Hola ${userName},

Has sido invitado a formar parte del Sistema de Remitos.

Tu información de acceso:
- Email: ${userEmail}
- Rol: ${roleName}

Para acceder al sistema, puedes:
- Iniciar sesión con tu cuenta de Gmail (si tu email es @gmail.com)
- O usar tu email y contraseña si se te asignó una

Accede aquí: ${loginUrl}

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al administrador del sistema.

Este es un email automático, por favor no respondas a este mensaje.
      `
    };

    console.log('📤 [Email] Enviando email...');
    console.log('📤 [Email] Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text
    });
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Email] Email de invitación enviado exitosamente:', {
      to,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ [Email] Error al enviar email de invitación:', {
      to,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      responseMessage: error.responseMessage,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      port: error.port,
      stack: error.stack
    });

    // Errores comunes y sus soluciones
    if (error.code === 'EAUTH') {
      console.error('❌ [Email] Error de autenticación (EAUTH)');
      console.error('❌ [Email] Response Code:', error.responseCode);
      if (error.responseCode === 535) {
        console.error('❌ [Email] Error 535: Credenciales inválidas');
        console.error('❌ [Email] SOLUCIÓN:');
        console.error('   1. Ve a: https://myaccount.google.com/apppasswords');
        console.error('   2. Genera una NUEVA contraseña de aplicación (16 caracteres)');
        console.error('   3. Asegúrate de tener Verificación en 2 pasos habilitada');
        console.error('   4. Actualiza EMAIL_PASSWORD en Vercel con la nueva contraseña');
        console.error('   5. Verifica que EMAIL_USER sea exactamente: puntoindigo3@gmail.com');
        console.error('   6. Haz redeploy después de cambiar las variables');
        console.error('❌ [Email] Documentación completa: docs/SOLUCION_ERROR_EMAIL.md');
      } else {
        console.error('❌ [Email] Posibles causas:');
        console.error('   1. EMAIL_PASSWORD no es una contraseña de aplicación de Gmail');
        console.error('   2. La contraseña de aplicación fue revocada o eliminada');
        console.error('   3. EMAIL_USER no es correcto');
        console.error('❌ [Email] Verifica en: https://myaccount.google.com/apppasswords');
      }
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ [Email] Error de conexión - Verifica tu conexión a internet');
    } else if (error.responseCode === 535) {
      console.error('❌ [Email] Error 535 - Credenciales inválidas');
      console.error('❌ [Email] Verifica que EMAIL_PASSWORD sea una contraseña de aplicación de Gmail (16 caracteres)');
      console.error('❌ [Email] La contraseña normal de Gmail NO funciona, debe ser una contraseña de aplicación');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ [Email] Timeout - El servidor de Gmail no respondió a tiempo');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ [Email] No se pudo resolver el hostname del servidor de Gmail');
    }

    return false;
  }
}

