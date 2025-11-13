import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createTransporter } from "@/lib/email";
import { logUserActivity } from "@/lib/user-activity-logger";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido", message: "Por favor ingresa un email válido" },
        { status: 400 }
      );
    }

    // Verificar que no sea Gmail
    const isGmail = email.toLowerCase().endsWith('@gmail.com') || email.toLowerCase().endsWith('@googlemail.com');
    if (isGmail) {
      return NextResponse.json(
        { 
          error: "No disponible", 
          message: "Los usuarios de Gmail deben usar el botón 'Iniciar sesión con Google'" 
        },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json(
        { 
          success: true, 
          message: "Si el email existe, se ha enviado una contraseña temporal" 
        },
        { status: 200 }
      );
    }

    // Generar contraseña temporal aleatoria (8 caracteres)
    const tempPassword = crypto.randomBytes(4).toString('hex');
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Actualizar usuario con contraseña temporal y marcar flag
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        has_temporary_password: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user password:', updateError);
      return NextResponse.json(
        { error: "Error interno", message: "No se pudo generar la contraseña temporal" },
        { status: 500 }
      );
    }

    // Enviar email con la contraseña temporal
    try {
      const transporter = await createTransporter();
      
      if (!transporter) {
        console.error('❌ [Forgot Password] No se pudo crear el transporter de email');
        return NextResponse.json(
          { error: "Error interno", message: "No se pudo enviar el email" },
          { status: 500 }
        );
      }

      const mailOptions = {
        from: `"Sistema de Remitos" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Recuperación de contraseña - Sistema de Remitos',
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
              .password-box {
                background-color: #fef3c7;
                border: 2px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                color: #92400e;
              }
              .warning {
                background-color: #fee2e2;
                border-left: 4px solid #ef4444;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                color: #991b1b;
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
                <h1>🔐 Recuperación de contraseña</h1>
              </div>
              
              <div class="content">
                <p>Hola <strong>${user.name || user.email.split('@')[0]}</strong>,</p>
                
                <p>Has solicitado recuperar tu contraseña. Se ha generado una contraseña temporal para tu cuenta.</p>
                
                <div class="info-box">
                  <p><strong>Tu información de acceso:</strong></p>
                  <p><strong>Email:</strong> ${user.email}</p>
                </div>
                
                <div class="password-box">
                  Contraseña temporal: ${tempPassword}
                </div>
                
                <div class="warning">
                  <p><strong>⚠️ IMPORTANTE:</strong> Esta es una contraseña temporal. Deberás cambiarla al acceder al sistema.</p>
                </div>
                
                <div style="text-align: left; margin: 20px 0;">
                  <a href="${process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL.replace(/\/$/, '')}/auth/login` : 'https://remitero-dev.vercel.app/auth/login'}" class="button">Acceder al Sistema</a>
                </div>
                
                <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
                  Si no solicitaste este cambio, por favor contacta al administrador del sistema.
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
Recuperación de contraseña - Sistema de Remitos

Hola ${user.name || user.email.split('@')[0]},

Has solicitado recuperar tu contraseña. Se ha generado una contraseña temporal para tu cuenta.

Tu información de acceso:
- Email: ${user.email}
- Contraseña temporal: ${tempPassword}

⚠️ IMPORTANTE: Esta es una contraseña temporal. Deberás cambiarla al acceder al sistema.

Accede aquí: ${process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL.replace(/\/$/, '')}/auth/login` : 'https://remitero-dev.vercel.app/auth/login'}

Si no solicitaste este cambio, por favor contacta al administrador del sistema.

Este es un email automático, por favor no respondas a este mensaje.
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ [Forgot Password] Email enviado exitosamente a:', user.email);

      // Registrar actividad
      try {
        await logUserActivity(
          user.id,
          'PASSWORD_RECOVERY_REQUESTED',
          'Solicitó recuperación de contraseña',
          { ipAddress: request.headers.get('x-forwarded-for') || 'unknown' }
        );
      } catch (activityError: any) {
        console.warn('⚠️ [Forgot Password] Error al registrar actividad (no crítico):', activityError.message);
      }
    } catch (emailError: any) {
      console.error('❌ [Forgot Password] Error al enviar email:', emailError);
      return NextResponse.json(
        { error: "Error interno", message: "No se pudo enviar el email" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Se ha enviado una contraseña temporal a tu email" 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: "Error interno del servidor", message: "Ocurrió un error inesperado" },
      { status: 500 }
    );
  }
}


