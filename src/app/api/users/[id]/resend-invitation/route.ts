import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo ADMIN y SUPERADMIN pueden reenviar invitaciones
    if (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Obtener el usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Construir la URL de login
    const loginUrl = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL.trim()}/auth/login`
      : 'https://remitero-dev.vercel.app/auth/login';

    // Enviar el email de invitación
    const emailSent = await sendInvitationEmail({
      to: user.email,
      userName: user.name || user.email.split('@')[0],
      userEmail: user.email,
      role: user.role,
      loginUrl
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Error al enviar el email de invitación" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitación reenviada correctamente"
    });

  } catch (error: any) {
    console.error('❌ [API] Error al reenviar invitación:', error);
    return NextResponse.json(
      { error: error.message || "Error al reenviar invitación" },
      { status: 500 }
    );
  }
}

