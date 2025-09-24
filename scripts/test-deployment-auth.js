const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testDeploymentAuth() {
    console.log('🔍 Probando autenticación en el entorno de despliegue...');
    
    // Usar las mismas variables que el despliegue
    const DATABASE_URL = "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require";
    
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: DATABASE_URL
            }
        }
    });

    try {
        console.log('🔧 PASO 1: Verificando conexión a base de datos...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa');

        console.log('');
        console.log('🔧 PASO 2: Simulando proceso de autenticación de NextAuth...');
        
        const email = 'admin@remitero.com';
        const password = 'daedae123';
        
        // Simular exactamente lo que hace NextAuth
        console.log(`Buscando usuario: ${email}`);
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            console.log('❌ Usuario no encontrado');
            return;
        }

        console.log(`✅ Usuario encontrado: ${user.email} (${user.role})`);
        console.log(`Password hash: ${user.password.substring(0, 20)}...`);

        console.log('');
        console.log('🔧 PASO 3: Verificando contraseña...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('❌ Contraseña incorrecta');
            return;
        }

        console.log('✅ Contraseña válida');

        console.log('');
        console.log('🔧 PASO 4: Simulando respuesta de NextAuth...');
        const authResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            companyName: null,
            impersonatingUserId: user.impersonatingUserId
        };

        console.log('✅ Respuesta de autenticación:');
        console.log(JSON.stringify(authResponse, null, 2));

        console.log('');
        console.log('🎉 Autenticación simulada exitosa!');
        console.log('El problema debe estar en la configuración de NextAuth o en el despliegue.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDeploymentAuth();
