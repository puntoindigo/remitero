import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email-reset-password";
import { logUserActivity } from "@/lib/user-activity-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada." 
      }, { status: 401 });
    }

    // Solo ADMIN o SUPERADMIN pueden resetear contraseñas de otros usuarios
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo los administradores pueden resetear contraseñas." 
      }, { status: 403 });
    }

    const { id: userId } = await params;

    // Obtener información del usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, company_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "No se pudo encontrar el usuario." 
      }, { status: 404 });
    }

    // Verificar que no sea Gmail (Gmail no tiene contraseña)
    const isGmail = user.email.toLowerCase().endsWith('@gmail.com') || 
                    user.email.toLowerCase().endsWith('@googlemail.com');
    
    if (isGmail) {
      return NextResponse.json({ 
        error: "No disponible", 
        message: "Los usuarios de Gmail no tienen contraseña. Deben usar el botón 'Iniciar sesión con Google'." 
      }, { status: 400 });
    }

    // Generar token único para reset de contraseña (32 caracteres hexadecimales)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración (30 minutos desde ahora)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Actualizar usuario con token y fecha de expiración
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: expiresAt.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user reset token:', updateError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo generar el token de reset."
      }, { status: 500 });
    }

    // Construir URL de reset con el token
    const baseUrl = process.env.NEXTAUTH_URL 
      ? process.env.NEXTAUTH_URL.trim().replace(/\/$/, '')
      : 'https://remitero-dev.vercel.app';
    
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Enviar email con el enlace de reset
    try {
      const emailSent = await sendPasswordResetEmail({
        to: user.email,
        userName: user.name || user.email.split('@')[0],
        resetUrl: resetUrl
      });

      if (!emailSent) {
        // Si falla el email, limpiar el token
        await supabaseAdmin
          .from('users')
          .update({
            password_reset_token: null,
            password_reset_expires: null,
          })
          .eq('id', userId);
        
        return NextResponse.json(
          { error: "Error interno", message: "No se pudo enviar el email" },
          { status: 500 }
        );
      }

      console.log('✅ [Reset Password] Email enviado exitosamente a:', user.email);

      // Registrar actividad
      try {
        await logUserActivity(
          userId,
          'PASSWORD_RESET_REQUESTED_BY_ADMIN',
          `Solicitud de reset de contraseña generada por ${session.user.name || session.user.email}`,
          { 
            resetBy: session.user.id,
            resetByName: session.user.name || session.user.email,
            tokenExpiresAt: expiresAt.toISOString()
          }
        );
      } catch (activityError: any) {
        console.warn('⚠️ [Reset Password] Error al registrar actividad (no crítico):', activityError.message);
      }
    } catch (emailError: any) {
      console.error('❌ [Reset Password] Error al enviar email:', emailError);
      // Limpiar el token si falla el email
      await supabaseAdmin
        .from('users')
        .update({
          password_reset_token: null,
          password_reset_expires: null,
        })
        .eq('id', userId);
      
      return NextResponse.json(
        { error: "Error interno", message: "No se pudo enviar el email" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Se ha enviado un enlace para restablecer la contraseña al email del usuario." 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { error: "Error interno del servidor", message: "Ocurrió un error inesperado." },
      { status: 500 }
    );
  }
}

