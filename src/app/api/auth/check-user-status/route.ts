import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: "Email requerido" 
      }, { status: 400 });
    }

    console.log('🔍 [check-user-status] Verificando usuario:', {
      email: email,
      schema: process.env.DATABASE_SCHEMA || 'default'
    });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, is_active')
      .eq('email', email)
      .single();

    if (error) {
      console.error('❌ [check-user-status] Error buscando usuario:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        schema: process.env.DATABASE_SCHEMA || 'default'
      });
      // Usuario no existe, no revelar información
      return NextResponse.json({ 
        exists: false,
        isActive: false
      });
    }

    if (!user) {
      console.warn('⚠️ [check-user-status] Usuario no encontrado:', email);
      return NextResponse.json({ 
        exists: false,
        isActive: false
      });
    }

    console.log('✅ [check-user-status] Usuario encontrado:', {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      is_active_type: typeof user.is_active,
      isActive: user.is_active !== false
    });

    return NextResponse.json({ 
      exists: true,
      isActive: user.is_active !== false
    });
  } catch (error: any) {
    console.error('❌ [check-user-status] Error:', {
      message: error?.message,
      stack: error?.stack,
      schema: process.env.DATABASE_SCHEMA || 'default'
    });
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}

