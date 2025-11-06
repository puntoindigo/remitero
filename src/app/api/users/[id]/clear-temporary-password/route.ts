import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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

    const { id: userId } = await params;

    // Solo el usuario puede limpiar su propio flag
    if (session.user.id !== userId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo puedes actualizar tu propia contraseña." 
      }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ has_temporary_password: false })
      .eq('id', userId);

    if (error) {
      console.error('Error clearing temporary password flag:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el estado de la contraseña."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Flag actualizado correctamente",
      success: true 
    });
  } catch (error: any) {
    console.error('Error in clear-temporary-password:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}


