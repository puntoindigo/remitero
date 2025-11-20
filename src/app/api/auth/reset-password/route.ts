import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { logUserActivity } from "@/lib/user-activity-logger";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Datos incompletos", message: "Token y contraseña son requeridos." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Contraseña inválida", message: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Buscar usuario por token y verificar que no haya expirado
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_reset_token, password_reset_expires, has_temporary_password, password')
      .eq('password_reset_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Token inválido", message: "El token de reset no es válido o ha expirado." },
        { status: 400 }
      );
    }

    // Verificar que el token no haya expirado
    const now = new Date();
    const expiresAt = new Date(user.password_reset_expires);
    
    if (now > expiresAt) {
      // Limpiar el token expirado
      await supabaseAdmin
        .from('users')
        .update({
          password_reset_token: null,
          password_reset_expires: null,
        })
        .eq('id', user.id);
      
      return NextResponse.json(
        { error: "Token expirado", message: "El enlace de reset ha expirado. Por favor, solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña y limpiar token
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        has_temporary_password: false,
        password_reset_token: null,
        password_reset_expires: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: "Error interno del servidor", message: "No se pudo actualizar la contraseña." },
        { status: 500 }
      );
    }

    // Detectar si es invitación (usuario nuevo) o recuperación
    const isInvitation = user.has_temporary_password || !user.password;
    const isGmail = user.email?.toLowerCase().endsWith('@gmail.com') || user.email?.toLowerCase().endsWith('@googlemail.com');

    // Registrar actividad
    try {
      await logUserActivity(
        user.id,
        isInvitation ? 'PASSWORD_SET_FROM_INVITATION' : 'PASSWORD_RESET_COMPLETED',
        isInvitation ? 'Contraseña establecida desde invitación' : 'Contraseña restablecida exitosamente mediante token',
        { 
          resetMethod: 'token',
          isInvitation,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      );
    } catch (activityError: any) {
      console.warn('⚠️ [Reset Password] Error al registrar actividad (no crítico):', activityError.message);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: isInvitation 
          ? "Contraseña establecida exitosamente. Serás redirigido a la aplicación." 
          : "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.",
        isInvitation,
        email: user.email,
        isGmail
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

// Endpoint para validar si un token es válido (sin cambiar la contraseña)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Token requerido", message: "Debes proporcionar un token." },
        { status: 400 }
      );
    }

    // Buscar usuario por token
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_reset_expires, has_temporary_password, password')
      .eq('password_reset_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { valid: false, message: "Token inválido" },
        { status: 200 }
      );
    }

    // Verificar que el token no haya expirado
    const now = new Date();
    const expiresAt = new Date(user.password_reset_expires);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { valid: false, message: "Token expirado" },
        { status: 200 }
      );
    }

    // Detectar si es invitación (usuario nuevo) o recuperación
    // Es invitación si tiene has_temporary_password o no tiene contraseña
    const isInvitation = user.has_temporary_password || !user.password;
    const isGmail = user.email?.toLowerCase().endsWith('@gmail.com') || user.email?.toLowerCase().endsWith('@googlemail.com');

    return NextResponse.json(
      { 
        valid: true, 
        email: user.email,
        name: user.name,
        isInvitation,
        isGmail
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { valid: false, message: "Error al validar el token" },
      { status: 500 }
    );
  }
}

