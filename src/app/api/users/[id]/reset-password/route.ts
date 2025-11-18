import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendInvitationEmail } from "@/lib/email";
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
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user password:', updateError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar la contraseña."
      }, { status: 500 });
    }

    // Obtener información de la empresa si existe
    let companyName = null;
    if (user.company_id) {
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('name')
        .eq('id', user.company_id)
        .single();
      if (company) {
        companyName = company.name;
      }
    }

    // URL directa a login
    const loginUrl = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL.trim().replace(/\/$/, '')}/auth/login`
      : 'https://remitero-dev.vercel.app/auth/login';

    // Enviar email con la contraseña temporal usando sendInvitationEmail
    try {
      await sendInvitationEmail({
        to: user.email,
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        role: user.role,
        loginUrl: loginUrl,
        isGmail: false, // Ya verificamos que no es Gmail arriba
        tempPassword: tempPassword
      });

      console.log('✅ [Reset Password] Email enviado exitosamente a:', user.email);

      // Registrar actividad
      try {
        await logUserActivity(
          userId,
          'PASSWORD_RESET_BY_ADMIN',
          `Contraseña reseteada por ${session.user.name || session.user.email}`,
          { 
            resetBy: session.user.id,
            resetByName: session.user.name || session.user.email
          }
        );
      } catch (activityError: any) {
        console.warn('⚠️ [Reset Password] Error al registrar actividad (no crítico):', activityError.message);
      }
    } catch (emailError: any) {
      console.error('❌ [Reset Password] Error al enviar email:', emailError);
      return NextResponse.json(
        { error: "Error interno", message: "No se pudo enviar el email" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Contraseña temporal generada y enviada por email al usuario." 
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

