import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email-reset-password";
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
          message: "Si el email existe, se ha enviado un enlace para restablecer tu contraseña" 
        },
        { status: 200 }
      );
    }

    // Generar token único para reset de contraseña (32 caracteres hexadecimales)
    const resetToken = crypto.randomBytes(16).toString('hex');
    
    // Calcular fecha de expiración (48 horas desde ahora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Actualizar usuario con token de reset y marcar como temporal para forzar cambio
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: expiresAt.toISOString(),
        has_temporary_password: true, // Marcar para forzar cambio de contraseña
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user reset token:', updateError);
      return NextResponse.json(
        { error: "Error interno", message: "No se pudo generar el enlace de recuperación" },
        { status: 500 }
      );
    }

    // Enviar email con link de reset
    try {
      const baseUrl = process.env.NEXTAUTH_URL 
        ? process.env.NEXTAUTH_URL.trim().replace(/\/$/, '')
        : 'https://remitero-dev.vercel.app';
      
      const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
      
      const emailSent = await sendPasswordResetEmail({
        to: user.email,
        userName: user.name || user.email.split('@')[0],
        resetUrl
      });

      if (!emailSent) {
        console.error('❌ [Forgot Password] No se pudo enviar el email');
        return NextResponse.json(
          { error: "Error interno", message: "No se pudo enviar el email" },
          { status: 500 }
        );
      }

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
        message: "Se ha enviado un enlace para restablecer tu contraseña a tu email" 
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


