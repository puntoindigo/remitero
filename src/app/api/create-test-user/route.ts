import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();
    
    console.log('🔍 Creando usuario de prueba:', email);
    
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email, password y name son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'El usuario ya existe'
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear el usuario
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role: role || 'USER',
        company_id: null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear usuario:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al crear usuario',
        details: error.message
      });
    }

    console.log('✅ Usuario creado exitosamente:', user.email);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error en create test user:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
