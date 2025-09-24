const fetch = require('node-fetch');

async function testApiAuth() {
    console.log('🔍 Probando autenticación en la API...');
    
    const baseUrl = 'https://remitero-dev.vercel.app';
    const credentials = {
        email: 'admin@remitero.com',
        password: 'daedae123'
    };

    try {
        console.log('🔧 PASO 1: Probando endpoint de autenticación...');
        console.log(`URL: ${baseUrl}/api/auth/callback/credentials`);
        console.log(`Credenciales: ${credentials.email} / ${credentials.password}`);
        
        const response = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.text();
            console.log('✅ Respuesta exitosa:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ Error:', errorText);
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }

    console.log('');
    console.log('🔧 PASO 2: Probando endpoint de sesión...');
    
    try {
        const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
        console.log(`Session Status: ${sessionResponse.status} ${sessionResponse.statusText}`);
        
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('Session Data:', sessionData);
        } else {
            const errorText = await sessionResponse.text();
            console.log('Session Error:', errorText);
        }
    } catch (error) {
        console.error('❌ Error de sesión:', error.message);
    }
}

testApiAuth();
