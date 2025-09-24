const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testAuth() {
    console.log('🔍 Probando autenticación...');
    
    // Configurar para desarrollo
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"
            }
        }
    });

    try {
        console.log('🔧 PASO 1: Verificando conexión a la base de datos...');
        
        // Verificar conexión
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos: OK');

        console.log('');
        console.log('🔧 PASO 2: Verificando usuarios...');
        
        const users = await prisma.user.findMany({
            where: {
                email: {
                    in: ['admin@remitero.com', 'admin@empresademo.com']
                }
            },
            select: {
                email: true,
                password: true,
                role: true,
                name: true
            }
        });

        console.log(`📋 Usuarios encontrados: ${users.length}`);
        
        for (const user of users) {
            console.log(`• ${user.email} (${user.role}) - ${user.name}`);
            
            // Probar contraseña
            const testPassword = user.email === 'admin@remitero.com' ? 'daedae123' : 'admin123';
            const isPasswordValid = await bcrypt.compare(testPassword, user.password);
            
            console.log(`  Contraseña "${testPassword}": ${isPasswordValid ? '✅ Válida' : '❌ Inválida'}`);
        }

        console.log('');
        console.log('🔧 PASO 3: Probando autenticación completa...');
        
        // Simular el proceso de autenticación
        const testEmail = 'admin@remitero.com';
        const testPassword = 'daedae123';
        
        const user = await prisma.user.findUnique({
            where: {
                email: testEmail
            }
        });

        if (!user) {
            console.log('❌ Usuario no encontrado');
            return;
        }

        const isPasswordValid = await bcrypt.compare(testPassword, user.password);
        
        if (!isPasswordValid) {
            console.log('❌ Contraseña incorrecta');
            return;
        }

        console.log('✅ Autenticación exitosa!');
        console.log(`• Usuario: ${user.email}`);
        console.log(`• Rol: ${user.role}`);
        console.log(`• Nombre: ${user.name}`);
        console.log(`• Company ID: ${user.companyId || 'Sin empresa'}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
