import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Endpoint para verificar que la sesión actual corresponde a un usuario válido en la BD
 * Se usa para validar que no hay sesiones "fantasma" cuando el schema está vacío
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        valid: false,
        reason: 'no_session'
      });
    }

    // Verificar que el usuario existe en la BD y está activo
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, is_active')
      .eq('id', session.user.id)
      .single();

    if (error || !user) {
      // Usuario no existe en la BD
      return NextResponse.json({ 
        valid: false,
        reason: 'user_not_found'
      });
    }

    if (user.is_active === false) {
      // Usuario desactivado
      return NextResponse.json({ 
        valid: false,
        reason: 'user_inactive'
      });
    }

    // Sesión válida
    return NextResponse.json({ 
      valid: true,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ 
      valid: false,
      reason: 'error'
    }, { status: 500 });
  }
}

