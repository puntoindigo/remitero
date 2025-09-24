#!/bin/bash

echo "🔍 Debugging de autenticación paso a paso..."

echo "🔧 PASO 1: Verificando configuración de NextAuth..."
echo "Verificando archivo de configuración de NextAuth..."

if [ -f "src/lib/auth.ts" ]; then
    echo "✅ Archivo auth.ts encontrado"
    echo "Contenido relevante:"
    grep -A 5 -B 5 "authorize" src/lib/auth.ts
else
    echo "❌ Archivo auth.ts no encontrado"
fi

echo ""
echo "🔧 PASO 2: Verificando configuración de base de datos..."
if [ -f "src/lib/db.ts" ]; then
    echo "✅ Archivo db.ts encontrado"
    echo "Contenido relevante:"
    grep -A 10 "getDatabaseUrl" src/lib/db.ts
else
    echo "❌ Archivo db.ts no encontrado"
fi

echo ""
echo "🔧 PASO 3: Verificando variables de entorno en Vercel..."
vercel env ls | grep -E "(DATABASE_URL|NEXTAUTH_URL|NEXTAUTH_SECRET)"

echo ""
echo "🔧 PASO 4: Probando conexión a base de datos localmente..."
export DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

# Crear script temporal para probar conexión
cat > temp_debug_db.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function debugDB() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Probando conexión a base de datos...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa');
        
        const userCount = await prisma.user.count();
        console.log(`📊 Total de usuarios: ${userCount}`);
        
        const users = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
                name: true
            }
        });
        
        console.log('👥 Usuarios encontrados:');
        users.forEach(user => {
            console.log(`  • ${user.email} (${user.role})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

debugDB();
EOF

node temp_debug_db.js
rm -f temp_debug_db.js

echo ""
echo "🔧 PASO 5: Verificando configuración de NextAuth en el código..."
echo "Buscando configuración de NextAuth en el proyecto..."

if [ -f "src/app/api/auth/[...nextauth]/route.ts" ]; then
    echo "✅ Archivo de ruta NextAuth encontrado"
    echo "Contenido:"
    cat src/app/api/auth/[...nextauth]/route.ts
else
    echo "❌ Archivo de ruta NextAuth no encontrado"
fi

echo ""
echo "🔧 PASO 6: Verificando si hay errores en el build..."
echo "Verificando si el proyecto compila correctamente..."

if npm run build > /dev/null 2>&1; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    echo "Ejecutando build para ver errores:"
    npm run build
fi

echo ""
echo "💡 DIAGNÓSTICO:"
echo "• Si la conexión a la base de datos falla, el problema está en las variables de entorno"
echo "• Si el build falla, hay errores en el código"
echo "• Si NextAuth no está configurado, falta el archivo de ruta"
echo ""
echo "🔧 PRÓXIMOS PASOS:"
echo "1. Verificar que todas las variables de entorno estén configuradas"
echo "2. Asegurar que el build sea exitoso"
echo "3. Verificar que NextAuth esté configurado correctamente"
