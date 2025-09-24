const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
    try {
        console.log('🔐 Creando usuarios del sistema...');

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
        console.log('');
        console.log('🌐 URLs de acceso:');
        console.log('• Preview: https://remitero-dev.vercel.app/');
        console.log('• Production: https://v0-remitero.vercel.app/');

    } catch (error) {
        console.error('❌ Error generando usuarios:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createUsers();
