const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Probando API de productos...');
    
    const response = await fetch('https://v0-remitero.vercel.app/api/products', {
      headers: {
        'Cookie': 'next-auth.session-token=test' // Esto no funcionará sin autenticación real
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Datos recibidos:');
      console.log(JSON.stringify(data.slice(0, 2), null, 2));
    } else {
      const error = await response.text();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
