import { createTransporter } from './email';
import { ActivityAction, ActivityLogMetadata } from './user-activity-types';
import { getActionDescription } from './user-activity-types';
import { generateDisableToken } from '../app/api/notifications/disable/route';

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

    // Generar tokens para desactivar desde el email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://remitero-dev.vercel.app';
    const disableActionToken = generateDisableToken(action);
    const disableAllToken = generateDisableToken('ALL');
    
    const disableActionUrl = `${baseUrl}/api/notifications/disable?action=${action}&token=${disableActionToken}`;
    const disableAllUrl = `${baseUrl}/api/notifications/disable?action=ALL&token=${disableAllToken}`;

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
            <!-- Header compacto -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem 1.5rem; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 1.125rem; font-weight: 600;">
                ${userName} ${description}
              </h1>
            </div>
            
            <!-- Content compacto -->
            <div style="padding: 1rem 1.5rem;">
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 0.75rem 1rem; margin-bottom: 0.75rem; border-radius: 4px;">
                <p style="margin: 0; font-size: 0.875rem; color: #111827; line-height: 1.5;">
                  <strong>Email:</strong> ${userEmail}<br>
                  <strong>Fecha:</strong> ${formattedDate}${metadata && Object.keys(metadata).length > 0 ? `<br><strong>Detalles:</strong> ${Object.entries(metadata).filter(([k, v]) => v && k !== 'ipAddress').map(([k, v]) => {
                      if (k === 'remitoNumber') return `Remito #${v}`;
                      if (k === 'clientId') return `Cliente ${v}`;
                      if (k === 'targetUserId') return `Usuario ${v}`;
                      return `${k}: ${v}`;
                    }).join(', ')}` : ''}
                </p>
              </div>
              
              <div style="text-align: center; padding: 0.5rem 0;">
                <a href="${disableActionUrl}" style="color: #6b7280; text-decoration: underline; font-size: 0.75rem; margin-right: 1rem;">
                  Desactivar esta acción
                </a>
                <a href="${disableAllUrl}" style="color: #6b7280; text-decoration: underline; font-size: 0.75rem;">
                  Desactivar todas
                </a>
              </div>
            </div>
            
            <!-- Footer compacto -->
            <div style="background-color: #f9fafb; padding: 0.75rem 1.5rem; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 0.6875rem;">
                © ${new Date().getFullYear()} Sistema de Remitos - Punto Indigo
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
${userName} ${description}

Email: ${userEmail}
Fecha: ${formattedDate}
${metadata && Object.keys(metadata).length > 0 ? `\nDetalles: ${Object.entries(metadata).filter(([k, v]) => v && k !== 'ipAddress').map(([k, v]) => {
  if (k === 'remitoNumber') return `Remito #${v}`;
  if (k === 'clientId') return `Cliente ${v}`;
  if (k === 'targetUserId') return `Usuario ${v}`;
  return `${k}: ${v}`;
}).join(', ')}` : ''}

Desactivar esta acción: ${disableActionUrl}
Desactivar todas: ${disableAllUrl}

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

