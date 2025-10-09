require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLogin() {
  try {
    console.log('🔍 Probando login con daeiman@gmail.com...');
    
    // Buscar el usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'daeiman@gmail.com')
      .single();

    if (error || !user) {
      console.error('❌ Usuario no encontrado:', error);
      return;
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password
    });

    // Probar diferentes contraseñas
    const passwords = ['password', 'admin', '123456', 'daeiman'];
    
    for (const password of passwords) {
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`🔑 Contraseña "${password}": ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
      
      if (isValid) {
        console.log(`\n🎉 ¡Contraseña correcta encontrada: "${password}"`);
        console.log('\n📋 Credenciales para login:');
        console.log(`   Email: daeiman@gmail.com`);
        console.log(`   Contraseña: ${password}`);
        break;
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
testLogin();
