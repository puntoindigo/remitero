import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Debug login - Intentando login para:', email);
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email y password requeridos'
      });
    }

    // Buscar usuario en la base de datos
    console.log('🔍 Buscando usuario en base de datos...');
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('❌ Error al buscar usuario:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al buscar usuario',
        details: error.message
      });
    }

    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password
    });

    // Verificar contraseña
    console.log('🔍 Verificando contraseña...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta para:', email);
      return NextResponse.json({
        success: false,
        error: 'Contraseña incorrecta'
      });
    }

    console.log('✅ Login exitoso para:', email);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company_id
      }
    });

  } catch (error) {
    console.error('❌ Error en debug login:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
