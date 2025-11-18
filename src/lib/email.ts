import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Configuración del transporter de Gmail con OAuth2
export const createTransporter = async () => {
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

  // Si tenemos OAuth2 configurado, intentar usarlo primero
  let oauth2Failed = false;
  if (oauthClientId && oauthClientSecret && oauthRefreshToken && emailUser) {
    console.log('🔐 [Email] OAuth2 detectado - Intentando usar OAuth2 primero');
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
        const errorData = tokenError.response?.data || {};
        const errorMessage = tokenError.message || '';
        const errorCode = errorData.error || '';
        
        // Detectar diferentes tipos de errores que requieren fallback
        const isInvalidGrant = errorMessage.includes('invalid_grant') || 
                              errorCode === 'invalid_grant' ||
                              tokenError.code === 400;
        
        const isDeletedClient = errorMessage.includes('deleted_client') ||
                               errorCode === 'deleted_client' ||
                               errorMessage.includes('OAuth client was deleted') ||
                               errorMessage.includes('404');
        
        const isClientError = errorCode === 'invalid_client' ||
                             errorMessage.includes('invalid_client');
        
        if (isInvalidGrant || isDeletedClient || isClientError) {
          if (isDeletedClient) {
            console.warn('⚠️ [Email] Cliente OAuth eliminado. Haciendo fallback automático a contraseña de aplicación...');
          } else if (isInvalidGrant) {
            console.warn('⚠️ [Email] Refresh token inválido/expirado. Haciendo fallback a contraseña de aplicación...');
          } else {
            console.warn('⚠️ [Email] Cliente OAuth inválido. Haciendo fallback a contraseña de aplicación...');
          }
          oauth2Failed = true;
          // NO lanzar error, continuar con fallback
        } else {
          console.error('❌ [Email] Error al obtener access token:', {
            message: tokenError.message,
            code: tokenError.code,
            errorCode: errorCode,
            response: tokenError.response
          });
          // Para otros errores, también hacer fallback en lugar de fallar completamente
          console.warn('⚠️ [Email] Error inesperado en OAuth2. Haciendo fallback a contraseña de aplicación...');
          oauth2Failed = true;
        }
      }

      // Si OAuth2 falló, continuar con fallback
      if (oauth2Failed) {
        // Continuar al código de abajo para usar contraseña
      } else if (!accessToken) {
        console.error('❌ [Email] No se pudo obtener access token (token es null/undefined)');
        oauth2Failed = true;
        // Continuar con fallback
      } else {
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
      }
    } catch (error: any) {
      const errorData = error.response?.data || {};
      const errorMessage = error.message || '';
      const errorCode = errorData.error || '';
      
      // Detectar diferentes tipos de errores que requieren fallback
      const isInvalidGrant = errorMessage.includes('invalid_grant') || 
                            errorCode === 'invalid_grant' ||
                            error.code === 400;
      
      const isDeletedClient = errorMessage.includes('deleted_client') ||
                             errorCode === 'deleted_client' ||
                             errorMessage.includes('OAuth client was deleted') ||
                             errorMessage.includes('404');
      
      const isClientError = errorCode === 'invalid_client' ||
                           errorMessage.includes('invalid_client');
      
      if (isInvalidGrant || isDeletedClient || isClientError) {
        if (isDeletedClient) {
          console.warn('⚠️ [Email] Cliente OAuth eliminado. Haciendo fallback automático a contraseña de aplicación...');
        } else if (isInvalidGrant) {
          console.warn('⚠️ [Email] OAuth2 falló con invalid_grant. Haciendo fallback a contraseña de aplicación...');
        } else {
          console.warn('⚠️ [Email] Cliente OAuth inválido. Haciendo fallback a contraseña de aplicación...');
        }
        oauth2Failed = true;
        // NO lanzar error, continuar con fallback
      } else {
        // Para cualquier otro error, también hacer fallback en lugar de fallar
        console.warn('⚠️ [Email] OAuth2 falló con error inesperado. Haciendo fallback a contraseña de aplicación...', {
          message: errorMessage,
          code: error.code,
          errorCode: errorCode
        });
        oauth2Failed = true;
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
  if (hasOAuth2Complete && oauth2Failed) {
    console.log('⚠️ [Email] Usando contraseña de aplicación como fallback (OAuth2 falló)');
  } else if (!hasOAuth2Complete) {
    console.log('⚠️ [Email] OAuth2 no configurado, usando contraseña de aplicación');
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
  isGmail: boolean;
  tempPassword: string | null;
}

/**
 * Envía un email de invitación a un nuevo usuario
 */
export async function sendInvitationEmail({
  to,
  userName,
  userEmail,
  role,
  loginUrl,
  isGmail,
  tempPassword
}: SendInvitationEmailParams): Promise<boolean> {
  console.log('📧 [Email] Iniciando envío de email de invitación:', {
    to,
    userName,
    userEmail,
    role,
    loginUrl,
    isGmail,
    isGmailType: typeof isGmail,
    hasTempPassword: !!tempPassword,
    tempPasswordType: typeof tempPassword,
    tempPasswordValue: tempPassword ? `${tempPassword.substring(0, 2)}***` : null,
    tempPasswordFull: tempPassword, // Log completo para debug
    tempPasswordLength: tempPassword?.length || 0,
    willShowPassword: !isGmail && !!tempPassword,
    conditionCheck: `!isGmail=${!isGmail}, tempPassword=${!!tempPassword}, tempPassword.trim().length=${tempPassword?.trim().length || 0}, result=${!isGmail && !!tempPassword && tempPassword.trim().length > 0}`
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

    // Calcular si debemos mostrar la contraseña temporal
    const hasValidTempPassword = tempPassword && typeof tempPassword === 'string' && tempPassword.trim().length > 0;
    const shouldShowTempPassword = !isGmail && hasValidTempPassword;
    
    console.log('🔍 [Email] Evaluando mostrar contraseña temporal:', {
      isGmail,
      isGmailValue: isGmail,
      hasTempPassword: !!tempPassword,
      tempPasswordType: typeof tempPassword,
      tempPasswordValue: tempPassword,
      tempPasswordLength: tempPassword?.length,
      tempPasswordTrimmed: tempPassword?.trim(),
      tempPasswordTrimmedLength: tempPassword?.trim().length || 0,
      hasValidTempPassword,
      shouldShow: shouldShowTempPassword,
      condition: `!isGmail=${!isGmail} && hasValidTempPassword=${hasValidTempPassword}, result=${shouldShowTempPassword}`
    });
    
    // Generar HTML de contraseña temporal si corresponde
    // IMPORTANTE: Para usuarios no-Gmail, SIEMPRE debe incluirse la contraseña temporal
    let tempPasswordHtml = '';
    if (shouldShowTempPassword && tempPassword) {
      const cleanTempPassword = tempPassword.trim();
      tempPasswordHtml = `
                <p style="margin-top: 15px;"><strong>Contraseña temporal:</strong> <span style="background-color: #fef3c7; padding: 8px 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 16px; color: #92400e; letter-spacing: 2px; border: 2px solid #f59e0b; display: inline-block; margin-left: 8px;">${cleanTempPassword}</span></p>
                <p style="font-size: 0.875rem; color: #ef4444; margin-top: 10px; font-weight: bold;">⚠️ IMPORTANTE: Esta es una contraseña temporal. Deberás cambiarla al primer acceso.</p>
                `;
      console.log('✅ [Email] HTML de contraseña temporal generado:', {
        tempPasswordHtmlLength: tempPasswordHtml.length,
        containsPassword: tempPasswordHtml.includes(cleanTempPassword),
        passwordInHtml: cleanTempPassword,
        environment: process.env.VERCEL_ENV || 'local',
        vercelUrl: process.env.VERCEL_URL || 'local'
      });
    } else {
      // Log detallado para debug en producción
      console.warn('⚠️ [Email] NO se generará HTML de contraseña temporal:', {
        reason: !isGmail ? 'tempPassword inválido o vacío' : 'es Gmail (no necesita contraseña)',
        isGmail,
        hasValidTempPassword,
        tempPasswordValue: tempPassword ? `${tempPassword.substring(0, 2)}***` : null,
        tempPasswordType: typeof tempPassword,
        tempPasswordLength: tempPassword?.length || 0,
        tempPasswordIsNull: tempPassword === null,
        tempPasswordIsUndefined: tempPassword === undefined,
        environment: process.env.VERCEL_ENV || 'local',
        vercelUrl: process.env.VERCEL_URL || 'local'
      });
      
      // Si no es Gmail y no hay contraseña, esto es un problema
      if (!isGmail && !hasValidTempPassword) {
        console.error('❌ [Email] ERROR CRÍTICO: Usuario no-Gmail sin contraseña temporal!', {
          email: userEmail,
          isGmail,
          tempPassword,
          environment: process.env.VERCEL_ENV || 'local'
        });
      }
    }

    // Verificar que tempPasswordHtml se haya generado correctamente ANTES de crear mailOptions
    console.log('🔍 [Email] Estado ANTES de crear mailOptions:', {
      tempPasswordHtmlLength: tempPasswordHtml.length,
      tempPasswordHtmlIsEmpty: tempPasswordHtml.length === 0,
      tempPasswordHtmlPreview: tempPasswordHtml.substring(0, 100),
      shouldShowTempPassword,
      hasValidTempPassword,
      isGmail,
      environment: process.env.VERCEL_ENV || 'local',
      vercelUrl: process.env.VERCEL_URL || 'local',
      // Verificación crítica: si no es Gmail y no hay HTML, es un error
      isError: !isGmail && tempPasswordHtml.length === 0 && hasValidTempPassword
    });
    
    // Validación adicional: si no es Gmail y debería tener contraseña pero no se generó HTML, es un error
    if (!isGmail && hasValidTempPassword && tempPasswordHtml.length === 0) {
      console.error('❌ [Email] ERROR: Usuario no-Gmail con contraseña válida pero HTML no generado!', {
        email: userEmail,
        tempPassword: tempPassword ? `${tempPassword.substring(0, 2)}***` : null,
        tempPasswordLength: tempPassword?.length || 0,
        shouldShowTempPassword,
        hasValidTempPassword,
        environment: process.env.VERCEL_ENV || 'local'
      });
    }

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
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 30px 0;
              box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
              transition: all 0.2s;
              text-align: center;
            }
            .button:hover {
              background-color: #1d4ed8;
              color: #ffffff !important;
              box-shadow: 0 6px 8px rgba(37, 99, 235, 0.4);
            }
            /* Fallback para clientes de email que no soportan :hover */
            .button-link {
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff !important;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 30px 0;
              box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
              text-align: center;
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
                ${tempPasswordHtml}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="color: #2563eb; text-decoration: underline; font-size: 16px; font-weight: 600;">Acceder al Sistema</a>
              </div>
              
              <p style="margin-top: 20px; font-size: 13px; color: #6b7280; text-align: center;">
                Si el enlace no funciona, copia y pega esta URL en tu navegador:<br>
                <span style="color: #2563eb; word-break: break-all; font-size: 12px; font-family: monospace;">${loginUrl}</span>
              </p>
              
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
${shouldShowTempPassword && tempPassword ? `- Contraseña temporal: ${tempPassword.trim()}\n\n⚠️ IMPORTANTE: Esta es una contraseña temporal. Deberás cambiarla al primer acceso.` : ''}

Accede al sistema aquí:
${loginUrl}

Si el enlace no funciona, copia y pega la URL completa en tu navegador.

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
      hasText: !!mailOptions.text,
      isGmail,
      hasTempPassword: !!tempPassword,
      tempPasswordValue: tempPassword ? `${tempPassword.substring(0, 2)}***` : null,
      tempPasswordFull: tempPassword, // Log completo para debug
      shouldShowTempPassword,
      tempPasswordHtmlLength: tempPasswordHtml.length,
      tempPasswordInHtml: tempPassword ? mailOptions.html?.includes(tempPassword.trim()) : false,
      tempPasswordInText: tempPassword ? mailOptions.text?.includes(tempPassword.trim()) : false,
      htmlIndexOfPassword: mailOptions.html?.indexOf('Contraseña temporal') ?? -1,
      htmlIndexOfPasswordValue: tempPassword ? (mailOptions.html?.indexOf(tempPassword.trim()) ?? -1) : -1,
      htmlPreview: mailOptions.html?.indexOf('Contraseña temporal') >= 0 
        ? mailOptions.html.substring(mailOptions.html.indexOf('Contraseña temporal') - 50, mailOptions.html.indexOf('Contraseña temporal') + 200) 
        : 'NO ENCONTRADO - tempPasswordHtml está vacío o no se insertó',
      htmlAroundInfoBox: mailOptions.html?.substring(
        mailOptions.html.indexOf('Tu información de acceso') - 20,
        mailOptions.html.indexOf('Tu información de acceso') + 500
      ) || 'NO ENCONTRADO',
      environment: process.env.VERCEL_ENV || 'local',
      vercelUrl: process.env.VERCEL_URL || 'local',
      // Verificación final: confirmar que la contraseña está en el HTML si debería estar
      passwordShouldBeInHtml: shouldShowTempPassword && hasValidTempPassword,
      passwordIsInHtml: tempPassword ? (mailOptions.html?.includes(tempPassword.trim()) ?? false) : false
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

