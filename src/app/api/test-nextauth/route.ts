import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/test-nextauth - Iniciando...')
    
    // Verificar configuración de NextAuth
    console.log('🔍 Verificando configuración NextAuth...')
    
    const config = {
      hasProviders: !!authOptions.providers && authOptions.providers.length > 0,
      providersCount: authOptions.providers?.length || 0,
      hasSession: !!authOptions.session,
      hasCallbacks: !!authOptions.callbacks,
      hasPages: !!authOptions.pages,
      debug: authOptions.debug,
      secret: !!process.env.NEXTAUTH_SECRET,
      url: !!process.env.NEXTAUTH_URL
    }
    
    console.log('🔍 Configuración NextAuth:', config)
    
    // Verificar variables de entorno críticas
    const envVars = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    }
    
    console.log('🔍 Variables de entorno:', envVars)
    
    // Verificar si hay algún problema con la configuración
    const issues = []
    if (!config.hasProviders) issues.push('No providers configured')
    if (!config.hasSession) issues.push('No session strategy configured')
    if (!config.hasCallbacks) issues.push('No callbacks configured')
    if (!envVars.NEXTAUTH_SECRET) issues.push('NEXTAUTH_SECRET missing')
    if (!envVars.NEXTAUTH_URL) issues.push('NEXTAUTH_URL missing')
    
    if (issues.length > 0) {
      console.error('❌ Problemas encontrados:', issues)
      return NextResponse.json({
        success: false,
        issues,
        config,
        envVars
      }, { status: 500 })
    }
    
    console.log('✅ Configuración NextAuth válida')
    
    return NextResponse.json({
      success: true,
      message: 'NextAuth configuration is valid',
      config,
      envVars
    })
  } catch (error) {
    console.error('❌ Error en /api/test-nextauth:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
