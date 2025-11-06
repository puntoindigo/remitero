import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido", message: "Por favor ingresa un email válido" },
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
        has_temporary_password: true, // Asumiendo que este campo existe en la BD
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user password:', updateError);
      return NextResponse.json(
        { error: "Error interno", message: "No se pudo generar la contraseña temporal" },
        { status: 500 }
      );
    }

    // TODO: Enviar email con la contraseña temporal
    // Por ahora solo logueamos (en producción usar un servicio de email)
    console.log(`Contraseña temporal para ${user.email}: ${tempPassword}`);
    
    // En producción, aquí deberías enviar el email usando un servicio como:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Nodemailer con SMTP
    
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


