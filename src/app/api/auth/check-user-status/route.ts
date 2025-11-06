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

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, is_active')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Usuario no existe, no revelar información
      return NextResponse.json({ 
        exists: false,
        isActive: false
      });
    }

    return NextResponse.json({ 
      exists: true,
      isActive: user.is_active !== false
    });
  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}

