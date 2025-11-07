import nodemailer from 'nodemailer';

// Configuración del transporter de Gmail
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️ [Email] Variables de entorno EMAIL_USER o EMAIL_PASSWORD no configuradas');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
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
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('❌ [Email] No se pudo crear el transporter de email');
      return false;
    }

    // Mapear roles a nombres legibles
    const roleNames: Record<string, string> = {
      'SUPERADMIN': 'Super Administrador',
      'ADMIN': 'Administrador',
      'OPERADOR': 'Operador'
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
              text-align: center;
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
              color: #ffffff;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
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
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Acceder al Sistema</a>
              </div>
              
              <p style="margin-top: 30px;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al administrador del sistema.
              </p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Sistema de Remitos. Todos los derechos reservados.</p>
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

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [Email] Email de invitación enviado:', {
      to,
      messageId: info.messageId,
      response: info.response
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ [Email] Error al enviar email de invitación:', {
      to,
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

