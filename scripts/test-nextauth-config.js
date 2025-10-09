require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando configuración de NextAuth...\n');

// Verificar variables de entorno críticas
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

console.log('📋 Variables de entorno requeridas:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  const status = value ? '✅' : '❌';
  console.log(`   ${status} ${envVar}: ${value ? 'Configurada' : 'FALTANTE'}`);
});

console.log('\n📋 Variables de entorno opcionales (Google Auth):');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  const status = value ? '✅' : '⚠️';
  console.log(`   ${status} ${envVar}: ${value ? 'Configurada' : 'No configurada'}`);
});

// Verificar configuración de Google Auth
const hasGoogleConfig = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
console.log(`\n🔍 Google Auth: ${hasGoogleConfig ? '✅ Configurado' : '⚠️ No configurado'}`);

if (!hasGoogleConfig) {
  console.log('\n💡 Para habilitar Google Auth:');
  console.log('   1. Ve a Google Cloud Console');
  console.log('   2. Crea credenciales OAuth 2.0');
  console.log('   3. Agrega las variables GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET');
}

// Verificar URL de NextAuth
const nextAuthUrl = process.env.NEXTAUTH_URL;
console.log(`\n🌐 NEXTAUTH_URL: ${nextAuthUrl || 'No configurada'}`);

if (!nextAuthUrl) {
  console.log('\n💡 NEXTAUTH_URL debe ser:');
  console.log('   - Desarrollo: http://localhost:3000');
  console.log('   - Producción: https://remitero-dev.vercel.app');
}

console.log('\n🎯 Credenciales para login:');
console.log('   Email: daeiman@gmail.com');
console.log('   Contraseña: password');
console.log('   Rol: SUPERADMIN');
