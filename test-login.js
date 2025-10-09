const { signIn } = require('next-auth/react');

async function testLogin() {
  console.log('🔍 Iniciando prueba de login...');
  
  try {
    const result = await signIn('credentials', {
      email: 'admin@remitero.com',
      password: 'admin123',
      redirect: false
    });
    
    console.log('✅ Resultado del login:', result);
    
    if (result?.error) {
      console.error('❌ Error en login:', result.error);
    } else {
      console.log('✅ Login exitoso!');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testLogin();
