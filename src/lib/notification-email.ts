import { createTransporter } from './email';
import { ActivityAction, ActivityLogMetadata } from './user-activity-types';
import { getActionDescription } from './user-activity-types';

interface SendActivityNotificationEmailParams {
  action: ActivityAction;
  description: string;
  userName: string;
  userEmail: string;
  metadata?: ActivityLogMetadata;
  timestamp: string;
}

/**
 * Envía un email de notificación de actividad al SUPERADMIN
 */
export async function sendActivityNotificationEmail({
  action,
  description,
  userName,
  userEmail,
  metadata,
  timestamp
}: SendActivityNotificationEmailParams): Promise<boolean> {
  console.log('📧 [Notification Email] Iniciando envío de notificación de actividad:', {
    action,
    description,
    userName,
    userEmail,
    timestamp
  });

  try {
    const transporter = await createTransporter();
    
    if (!transporter) {
      console.error('❌ [Notification Email] No se pudo crear el transporter de email');
      return false;
    }

    const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.EMAIL_USER;
    
    if (!superAdminEmail) {
      console.error('❌ [Notification Email] No se configuró SUPERADMIN_EMAIL o EMAIL_USER');
      return false;
    }

    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Construir detalles adicionales desde metadata
    let additionalDetails = '';
    if (metadata) {
      const details: string[] = [];
      if (metadata.remitoNumber) details.push(`Remito: #${metadata.remitoNumber}`);
      if (metadata.clientId) details.push(`Cliente ID: ${metadata.clientId}`);
      if (metadata.targetUserId) details.push(`Usuario objetivo ID: ${metadata.targetUserId}`);
      if (metadata.ipAddress) details.push(`IP: ${metadata.ipAddress}`);
      if (Object.keys(metadata).length > 0) {
        additionalDetails = details.length > 0 
          ? `<p style="margin: 0.5rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Detalles:</strong> ${details.join(', ')}</p>`
          : '';
      }
    }

    const mailOptions = {
      from: `"Sistema de Remitos" <${process.env.EMAIL_USER}>`,
      to: superAdminEmail,
      subject: `[Notificación] ${description}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notificación de Actividad</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 1.5rem; font-weight: 600;">
                🔔 Notificación de Actividad
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 2rem;">
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 1rem; margin-bottom: 1.5rem; border-radius: 4px;">
                <p style="margin: 0; font-size: 1rem; font-weight: 600; color: #111827;">
                  ${description}
                </p>
              </div>
              
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h2 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600; color: #111827;">
                  Información de la Actividad
                </h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0.5rem 0; color: #6b7280; font-size: 0.875rem; width: 140px;"><strong>Usuario:</strong></td>
                    <td style="padding: 0.5rem 0; color: #111827; font-size: 0.875rem;">${userName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Email:</strong></td>
                    <td style="padding: 0.5rem 0; color: #111827; font-size: 0.875rem;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Acción:</strong></td>
                    <td style="padding: 0.5rem 0; color: #111827; font-size: 0.875rem;">${action}</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Fecha y Hora:</strong></td>
                    <td style="padding: 0.5rem 0; color: #111827; font-size: 0.875rem;">${formattedDate}</td>
                  </tr>
                </table>
                
                ${additionalDetails}
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; color: #92400e; font-size: 0.875rem;">
                  <strong>ℹ️ Nota:</strong> Esta es una notificación automática del sistema. Puedes configurar qué actividades recibir en la sección de Configuración.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 1.5rem; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 0.75rem;">
                © ${new Date().getFullYear()} Sistema de Remitos - Punto Indigo. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Notificación de Actividad del Sistema

${description}

Información de la Actividad:
- Usuario: ${userName}
- Email: ${userEmail}
- Acción: ${action}
- Fecha y Hora: ${formattedDate}
${metadata && Object.keys(metadata).length > 0 ? `\nDetalles: ${JSON.stringify(metadata, null, 2)}` : ''}

Esta es una notificación automática del sistema. Puedes configurar qué actividades recibir en la sección de Configuración.

© ${new Date().getFullYear()} Sistema de Remitos - Punto Indigo.
      `
    };

    console.log('📤 [Notification Email] Enviando email de notificación...');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Notification Email] Email de notificación enviado exitosamente:', {
      to: superAdminEmail,
      messageId: info.messageId,
      action,
      description
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ [Notification Email] Error al enviar email de notificación:', {
      error: error.message,
      stack: error.stack,
      action,
      description
    });
    return false;
  }
}

