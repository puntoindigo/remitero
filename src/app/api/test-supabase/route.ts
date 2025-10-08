import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/test-supabase - Iniciando...')
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔍 Variables de entorno:')
    console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante')
    console.log('- SERVICE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { 
          error: 'Missing Supabase environment variables',
          supabaseUrl: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey
        },
        { status: 500 }
      )
    }

    // Probar conexión a Supabase
    console.log('🔍 Probando conexión a Supabase...')
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Error de Supabase:', error)
      return NextResponse.json(
        { 
          error: 'Supabase connection error',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Conexión a Supabase exitosa')
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      supabaseUrl: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    })
  } catch (error) {
    console.error('❌ Error en /api/test-supabase:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
