const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
    console.log('🚀 Creando usuarios en ambas bases de datos...');
    console.log('');

    // URLs de las bases de datos
    const devDatabaseUrl = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19oeFJWWDhQNjlMWEgyN3AzSFVhbWQiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI2MmQ4NjkxYzBiY2EwNGE1ZmNiMGE4ZWU5MjQzNWUxZGU0ZDhlZDYwOGYxMGZiMmE4ZWM1OTdmNDU4M2U1Y2IxIiwiaW50ZXJuYWxfc2VjcmV0IjoiOGNiZDNmNzQtNmE4Yi00Njk3LTg0NTktYWJlMmNkN2Q5NDlkIn0._6KDiMWwgiOHO65UkNvss0xDdQFTh7OVkB_cRzYfI-c";
    
    const prodDatabaseUrl = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19LczVEc1JVWm5jeUZFUmdpS0VIY3kiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI1OGE3MTA4MGE5YTdiMmYxM2I0OGY0NWQ2MTQxZDUzYmIzZTMwNjMyOWViMDVlODQ0ZjcxMzY1NzFkNTYxMWE3IiwiaW50ZXJuYWxfc2VjcmV0IjoiNmQ1NDY5MDQtZTE5OC00NWU0LTkwMTYtZGQyZjkxMDkzOTA4In0.SwLnPMOTHx3IQxyUN_I2CmbgZK5eh4RSumd5EKwnZrQ";

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
