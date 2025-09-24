#!/bin/bash

echo "🔍 Diagnóstico final completo del problema..."

echo "📋 RESUMEN DEL PROBLEMA:"
echo "• Las credenciales no funcionan en https://remitero-dev.vercel.app/"
echo "• Error: CredentialsSignin (401 Unauthorized)"
echo "• Las variables de entorno están configuradas correctamente"
echo "• Los usuarios están en la base de datos correcta"
echo "• La autenticación funciona localmente"
echo "• Los endpoints de API devuelven 404"
echo ""

echo "🔧 PASO 1: Verificando configuración de variables de entorno..."
vercel env ls | grep -E "(DATABASE_URL|NEXTAUTH_URL|NEXTAUTH_SECRET)"

echo ""
echo "🔧 PASO 2: Verificando variables específicas de Preview..."
vercel env pull .env.preview --environment=preview > /dev/null 2>&1
if [ -f ".env.preview" ]; then
    echo "✅ Variables de Preview obtenidas:"
    grep -E "(DATABASE_URL|NEXTAUTH_URL|NEXTAUTH_SECRET)" .env.preview
    rm -f .env.preview
else
    echo "❌ No se pudieron obtener variables de Preview"
fi

echo ""
echo "🔧 PASO 3: Verificando conexión a base de datos localmente..."
export DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

# Crear script temporal para verificar conexión
cat > temp_final_check.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function finalCheck() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Verificando conexión a base de datos...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa');
        
        const userCount = await prisma.user.count();
        console.log(`📊 Total de usuarios: ${userCount}`);
        
        const targetUsers = ['admin@remitero.com', 'admin@empresademo.com'];
        const users = await prisma.user.findMany({
            where: {
                email: { in: targetUsers }
            },
            select: {
                email: true,
                role: true,
                name: true,
                password: true
            }
        });
        
        console.log(`👥 Usuarios objetivo encontrados: ${users.length}`);
        
        for (const user of users) {
            const testPassword = user.email === 'admin@remitero.com' ? 'daedae123' : 'admin123';
            const isPasswordValid = await bcrypt.compare(testPassword, user.password);
            
            console.log(`✅ ${user.email} (${user.role}) - Contraseña: ${isPasswordValid ? 'Válida' : 'Inválida'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

finalCheck();
EOF

node temp_final_check.js
rm -f temp_final_check.js

echo ""
echo "🔧 PASO 4: Verificando estado del despliegue..."
vercel ls | head -5

echo ""
echo "🔧 PASO 5: Probando autenticación en el despliegue..."
curl -s -X POST "https://remitero-dev.vercel.app/api/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@remitero.com","password":"daedae123"}' \
  -w "HTTP_CODE:%{http_code}" | head -1

echo ""
echo "🔧 PASO 6: Verificando endpoints de API..."
echo "• /api/auth/session: $(curl -s -o /dev/null -w "%{http_code}" "https://remitero-dev.vercel.app/api/auth/session")"
echo "• /api/auth/csrf: $(curl -s -o /dev/null -w "%{http_code}" "https://remitero-dev.vercel.app/api/auth/csrf")"
echo "• /api/check-db: $(curl -s -o /dev/null -w "%{http_code}" "https://remitero-dev.vercel.app/api/check-db")"

echo ""
echo "💡 DIAGNÓSTICO FINAL:"
echo "• Si las variables están correctas pero la autenticación falla, el problema está en el código"
echo "• Si la conexión local funciona pero el despliegue no, hay un problema de configuración"
echo "• Si el despliegue devuelve 401, NextAuth está rechazando las credenciales"
echo "• Si los endpoints de API devuelven 404, hay un problema con el despliegue"
echo ""
echo "🔧 SOLUCIONES POSIBLES:"
echo "1. Verificar que el despliegue esté usando las variables de entorno correctas"
echo "2. Asegurar que la rama develop esté configurada para Preview"
echo "3. Verificar que no haya problemas de cache en Vercel"
echo "4. Revisar los logs del servidor para ver errores específicos"
echo "5. Verificar que el código se esté desplegando correctamente"
echo ""
echo "🚀 PRÓXIMO PASO:"
echo "Revisar los logs del servidor para ver errores específicos:"
echo "vercel logs https://remitero-dev.vercel.app"
