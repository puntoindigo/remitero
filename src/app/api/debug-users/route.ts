import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Obteniendo lista de usuarios...');
    
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, company_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener usuarios:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener usuarios',
        details: error.message
      });
    }

    console.log('✅ Usuarios encontrados:', users?.length || 0);
    
    return NextResponse.json({
      success: true,
      users: users || [],
      count: users?.length || 0
    });

  } catch (error) {
    console.error('❌ Error en debug users:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}