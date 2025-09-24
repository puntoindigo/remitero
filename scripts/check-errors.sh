#!/bin/bash

echo "🔍 Verificando errores 500 en el entorno de desarrollo..."

echo "🔧 PASO 1: Obteniendo logs recientes..."
vercel logs https://remitero-dev.vercel.app --limit=20 > logs.txt 2>&1

echo "🔧 PASO 2: Buscando errores 500..."
if [ -f "logs.txt" ]; then
    echo "📋 Logs encontrados:"
    cat logs.txt
    
    echo ""
    echo "🔍 Buscando errores 500 específicamente:"
    grep -i "500\|error\|❌" logs.txt || echo "No se encontraron errores 500 en los logs recientes"
    
    rm -f logs.txt
else
    echo "❌ No se pudieron obtener los logs"
fi

echo ""
echo "🔧 PASO 3: Verificando estado del despliegue actual..."
vercel ls | head -3

echo ""
echo "🔧 PASO 4: Probando endpoints principales..."
echo "• Página principal: $(curl -s -o /dev/null -w "%{http_code}" "https://remitero-dev.vercel.app/")"
echo "• Dashboard: $(curl -s -o /dev/null -w "%{http_code}" "https://remitero-dev.vercel.app/dashboard")"
echo "• API test-prisma: $(curl -s -o /dev/null -w "%{http_code}" "https://remitero-dev.vercel.app/api/test-prisma")"

echo ""
echo "💡 Si hay errores 500, revisar:"
echo "• Variables de entorno"
echo "• Configuración de base de datos"
echo "• Errores en el código"
echo "• Problemas de importación"
