#!/bin/bash

echo "🔐 Generando credenciales de acceso para el sistema..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

echo "📋 Credenciales a generar:"
echo "• SuperAdmin: admin@remitero.com / daedae123"
echo "• Admin: admin@empresademo.com / admin123"

echo ""
echo "🔧 PASO 1: Creando script de generación de usuarios..."

# Crear script temporal para generar usuarios
cat > temp_generate_users.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function generateUsers() {
    try {
        console.log('🔐 Generando usuarios del sistema...');

        // Crear o actualizar SuperAdmin
        const superAdminPassword = await bcrypt.hash('daedae123', 10);
        const superAdmin = await prisma.user.upsert({
            where: { email: 'admin@remitero.com' },
            update: {
                password: superAdminPassword,
                role: 'SUPERADMIN',
                name: 'Super Administrador'
            },
            create: {
                email: 'admin@remitero.com',
                password: superAdminPassword,
                role: 'SUPERADMIN',
                name: 'Super Administrador',
                address: 'Sistema',
                phone: '000-000-0000'
            }
        });

        console.log('✅ SuperAdmin creado/actualizado:', superAdmin.email);

        // Crear o actualizar Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@empresademo.com' },
            update: {
                password: adminPassword,
                role: 'ADMIN',
                name: 'Administrador Demo'
            },
            create: {
                email: 'admin@empresademo.com',
                password: adminPassword,
                role: 'ADMIN',
                name: 'Administrador Demo',
                address: 'Empresa Demo',
                phone: '000-000-0000'
            }
        });

        console.log('✅ Admin creado/actualizado:', admin.email);

        console.log('');
        console.log('🎉 Usuarios generados exitosamente!');
        console.log('');
        console.log('📋 CREDENCIALES DE ACCESO:');
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log('│                    PREVIEW - BRANCH DEVELOP             │');
        console.log('│                                                         │');
        console.log('│  SuperAdmin: admin@remitero.com / daedae123            │');
        console.log('│  Admin:      admin@empresademo.com / admin123           │');
        console.log('└─────────────────────────────────────────────────────────┘');

    } catch (error) {
        console.error('❌ Error generando usuarios:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

generateUsers();
EOF

echo "✅ Script de generación creado"

echo ""
echo "🔧 PASO 2: Ejecutando generación de usuarios..."

# Ejecutar el script
node temp_generate_users.js

echo ""
echo "🧹 PASO 3: Limpiando archivos temporales..."
rm -f temp_generate_users.js

echo ""
echo "✅ Script de credenciales completado!"
echo ""
echo "🌐 URLs de acceso:"
echo "• Preview: https://remitero-dev.vercel.app/"
echo "• Production: https://v0-remitero.vercel.app/"
echo ""
echo "💡 Las credenciales están listas para usar en ambos entornos"
