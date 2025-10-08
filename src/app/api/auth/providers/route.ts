import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/auth/providers - Iniciando...')
    
    // Verificar que authOptions esté configurado
    if (!authOptions || !authOptions.providers) {
      console.error('❌ authOptions no configurado correctamente')
      return NextResponse.json(
        { error: 'Auth configuration not found' },
        { status: 500 }
      )
    }

    console.log('✅ authOptions encontrado, providers:', authOptions.providers.length)
    
    // Retornar los providers disponibles
    const providers = authOptions.providers.map(provider => ({
      id: provider.id,
      name: provider.name,
      type: provider.type
    }))

    console.log('✅ Providers retornados:', providers)
    
    return NextResponse.json(providers)
  } catch (error) {
    console.error('❌ Error en /api/auth/providers:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
