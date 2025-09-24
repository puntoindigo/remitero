#!/bin/bash

echo "🔍 Verificando credenciales y conexión a la base de datos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

# Configurar variables de entorno
export DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19oeFJWWDhQNjlMWEgyN3AzSFVhbWQiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI2MmQ4NjkxYzBiY2EwNGE1ZmNiMGE4ZWU5MjQzNWUxZGU0ZDhlZDYwOGYxMGZiMmE4ZWM1OTdmNDU4M2U1Y2IxIiwiaW50ZXJuYWxfc2VjcmV0IjoiOGNiZDNmNzQtNmE4Yi00Njk3LTg0NTktYWJlMmNkN2Q5NDlkIn0._6KDiMWwgiOHO65UkNvss0xDdQFTh7OVkB_cRzYfI-c"

echo "🔧 PASO 1: Verificando conexión a la base de datos..."
npx prisma db pull --force > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Conexión a la base de datos: OK"
else
    echo "❌ Error de conexión a la base de datos"
    exit 1
fi

echo ""
echo "🔧 PASO 2: Verificando usuarios en la base de datos..."

# Crear script temporal para verificar usuarios
cat > temp_verify_users.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUsers() {
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
                name: true,
                createdAt: true
            }
        });

        console.log('📋 Usuarios encontrados en la base de datos:');
        users.forEach(user => {
            console.log(`✅ ${user.email} (${user.role}) - ${user.name}`);
        });

        if (users.length === 2) {
            console.log('');
            console.log('🎉 Todas las credenciales están configuradas correctamente!');
        } else {
            console.log('');
            console.log('⚠️  Faltan algunos usuarios. Ejecuta: node scripts/create-users.js');
        }

    } catch (error) {
        console.error('❌ Error verificando usuarios:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUsers();
EOF

node temp_verify_users.js
rm -f temp_verify_users.js

echo ""
echo "🔧 PASO 3: Verificando configuración de Vercel..."
vercel env ls | grep -E "(DATABASE_URL|NEXTAUTH)" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Variables de entorno en Vercel: Configuradas"
else
    echo "❌ Variables de entorno en Vercel: Faltan"
fi

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
echo "• Preview: https://remitero-dev.vercel.app/"
echo "• Production: https://v0-remitero.vercel.app/"
echo ""
echo "💡 Si las credenciales no funcionan, ejecuta:"
echo "   node scripts/create-users.js"
