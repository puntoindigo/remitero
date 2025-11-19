import { createTransporter } from "./email";

interface SendPasswordResetEmailParams {
  to: string;
  userName: string;
  resetUrl: string;
}

/**
 * Envía un email de reset de contraseña con un enlace que contiene el token
 */
export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl
}: SendPasswordResetEmailParams): Promise<boolean> {
  console.log('📧 [Email Reset] Iniciando envío de email de reset de contraseña:', {
    to,
    userName,
    resetUrl
  });

  try {
    const transporter = await createTransporter();
    
    if (!transporter) {
      console.error('❌ [Email Reset] No se pudo crear el transporter de email');
      return false;
    }

    const mailOptions = {
      from: `"Sistema de Remitos" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Restablecer tu contraseña - Sistema de Remitos',
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
            .security-note {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 0.875rem;
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
              text-align: center;
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
            .url-box {
              background-color: #f3f4f6;
              padding: 12px;
              border-radius: 4px;
              margin: 15px 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 12px;
              color: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Restablecer tu contraseña</h1>
            </div>
            
            <div class="content">
              <p>Estimado/a <strong>${userName}</strong>,</p>
              
              <p>Recibimos una solicitud para restablecer la contraseña asociada con esta dirección de correo electrónico. Si realizaste esta solicitud, sigue las instrucciones a continuación.</p>
              
              <div class="security-note">
                <p style="margin: 0;"><strong>Si no solicitaste que se restableciera tu contraseña, puedes ignorar este correo electrónico con seguridad.</strong> Ten la seguridad de que tu cuenta está segura.</p>
              </div>
              
              <p><strong>Haz clic en el enlace de abajo para restablecer tu contraseña:</strong></p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Restablecer contraseña</a>
              </div>
              
              <p style="font-size: 0.875rem; color: #6b7280;">
                Si hacer clic no parece funcionar, puedes copiar y pegar el enlace en la ventana de dirección de tu navegador o volver a escribirlo allí. Te daremos instrucciones para restablecer tu contraseña.
              </p>
              
              <div class="url-box">
                ${resetUrl}
              </div>
              
              <p style="font-size: 0.875rem; color: #ef4444; font-weight: bold; margin-top: 20px;">
                ⚠️ Por motivos de seguridad, este enlace caducará en 30 minutos o después de que restablezcas tu contraseña.
              </p>
            </div>
            
            <div class="footer">
              <p>Este es un correo electrónico generado automáticamente. No responder.</p>
              <p>&copy; ${new Date().getFullYear()} Sistema de Remitos - Punto Indigo. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Restablecer tu contraseña - Sistema de Remitos

Estimado/a ${userName},

Recibimos una solicitud para restablecer la contraseña asociada con esta dirección de correo electrónico. Si realizaste esta solicitud, sigue las instrucciones a continuación.

Si no solicitaste que se restableciera tu contraseña, puedes ignorar este correo electrónico con seguridad. Ten la seguridad de que tu cuenta está segura.

Haz clic en el enlace de abajo para restablecer tu contraseña:

${resetUrl}

Si hacer clic no parece funcionar, puedes copiar y pegar el enlace en la ventana de dirección de tu navegador o volver a escribirlo allí. Te daremos instrucciones para restablecer tu contraseña.

⚠️ Por motivos de seguridad, este enlace caducará en 30 minutos o después de que restablezcas tu contraseña.

Este es un correo electrónico generado automáticamente. No responder.
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ [Email Reset] Email enviado exitosamente a:', to);
    return true;
  } catch (error: any) {
    console.error('❌ [Email Reset] Error al enviar email:', error);
    return false;
  }
}

