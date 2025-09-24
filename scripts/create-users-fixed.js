const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

// Función para generar ID único
function generateId() {
    return randomBytes(16).toString('hex');
}

async function createUsersInDatabase(databaseUrl, environment) {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl
            }
        }
    });

    try {
        console.log(`🔐 Creando usuarios en ${environment}...`);

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
                id: generateId(),
                email: 'admin@remitero.com',
                password: superAdminPassword,
                role: 'SUPERADMIN',
                name: 'Super Administrador',
                address: 'Sistema',
                phone: '000-000-0000'
            }
        });

        console.log(`✅ SuperAdmin creado/actualizado en ${environment}:`, superAdmin.email);

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
                id: generateId(),
                email: 'admin@empresademo.com',
                password: adminPassword,
                role: 'ADMIN',
                name: 'Administrador Demo',
                address: 'Empresa Demo',
                phone: '000-000-0000'
            }
        });

        console.log(`✅ Admin creado/actualizado en ${environment}:`, admin.email);

        return true;
    } catch (error) {
        console.error(`❌ Error en ${environment}:`, error.message);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    console.log('🚀 Creando usuarios con IDs generados...');
    console.log('');

    // URLs directas de PostgreSQL
    const devDatabaseUrl = "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require";
    
    const prodDatabaseUrl = "postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require";

    // Crear usuarios en desarrollo
    const devSuccess = await createUsersInDatabase(devDatabaseUrl, 'DESARROLLO');
    console.log('');

    // Crear usuarios en producción
    const prodSuccess = await createUsersInDatabase(prodDatabaseUrl, 'PRODUCCIÓN');
    console.log('');

    if (devSuccess && prodSuccess) {
        console.log('🎉 Usuarios creados exitosamente en ambas bases de datos!');
    } else if (devSuccess) {
        console.log('⚠️  Usuarios creados solo en DESARROLLO');
    } else if (prodSuccess) {
        console.log('⚠️  Usuarios creados solo en PRODUCCIÓN');
    } else {
        console.log('❌ Error creando usuarios en ambas bases de datos');
    }

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
}

main().catch(console.error);
