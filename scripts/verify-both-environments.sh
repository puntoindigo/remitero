#!/bin/bash

echo "🔍 Verificando credenciales en ambos entornos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

echo "📋 Configuración actual:"
echo "• Production (main): https://v0-remitero.vercel.app/"
echo "• Preview (develop): https://remitero-dev.vercel.app/"
echo ""

echo "🔧 PASO 1: Verificando variables de entorno en Vercel..."
vercel env ls | grep -E "(DATABASE_URL|NEXTAUTH)"

echo ""
echo "🔧 PASO 2: Verificando usuarios en base de datos de PRODUCCIÓN..."

# Configurar para producción
export DATABASE_URL="postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require"

# Crear script temporal para verificar usuarios de producción
cat > temp_verify_prod.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProdUsers() {
    try {
        const users = await prisma.user.findMany({
            where: {
                email: {
                    in: ['admin@remitero.com', 'admin@empresademo.com']
                }
            },
            select: {
                email: true,
                role: true,
                name: true
            }
        });

        console.log('📋 Usuarios en PRODUCCIÓN:');
        if (users.length > 0) {
            users.forEach(user => {
                console.log(`✅ ${user.email} (${user.role}) - ${user.name}`);
            });
        } else {
            console.log('❌ No se encontraron usuarios en producción');
        }

    } catch (error) {
        console.error('❌ Error verificando usuarios de producción:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyProdUsers();
EOF

node temp_verify_prod.js
rm -f temp_verify_prod.js

echo ""
echo "🔧 PASO 3: Verificando usuarios en base de datos de DESARROLLO..."

# Configurar para desarrollo
export DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

# Crear script temporal para verificar usuarios de desarrollo
cat > temp_verify_dev.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDevUsers() {
    try {
        const users = await prisma.user.findMany({
            where: {
                email: {
                    in: ['admin@remitero.com', 'admin@empresademo.com']
                }
            },
            select: {
                email: true,
                role: true,
                name: true
            }
        });

        console.log('📋 Usuarios en DESARROLLO:');
        if (users.length > 0) {
            users.forEach(user => {
                console.log(`✅ ${user.email} (${user.role}) - ${user.name}`);
            });
        } else {
            console.log('❌ No se encontraron usuarios en desarrollo');
        }

    } catch (error) {
        console.error('❌ Error verificando usuarios de desarrollo:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDevUsers();
EOF

node temp_verify_dev.js
rm -f temp_verify_dev.js

echo ""
echo "📋 CREDENCIALES DE ACCESO:"
echo "┌─────────────────────────────────────────────────────────┐"
echo "│                    PREVIEW - BRANCH DEVELOP             │"
echo "│                                                         │"
echo "│  SuperAdmin: admin@remitero.com / daedae123            │"
echo "│  Admin:      admin@empresademo.com / admin123           │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "🌐 URLs de acceso:"
echo "• Production (main): https://v0-remitero.vercel.app/"
echo "• Preview (develop): https://remitero-dev.vercel.app/"
echo ""
echo "💡 IMPORTANTE:"
echo "• Las credenciales deben funcionar en AMBOS entornos"
echo "• Si no funcionan, ejecuta: node scripts/create-users-final.js"
echo "• Asegúrate de que las ramas estén configuradas correctamente en Vercel"
