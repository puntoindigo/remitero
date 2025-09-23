#!/bin/bash

echo "🔧 Configurando bases de datos separadas..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

echo "📋 Variables de entorno actuales:"
vercel env ls

echo ""
echo "🔍 Análisis de configuración actual:"
echo "- DATABASE_URL está configurada para TODOS los entornos"
echo "- Necesitamos separar las bases de datos"

echo ""
echo "📝 Pasos para configurar bases de datos separadas:"
echo ""
echo "1. 🗄️  CREAR BASE DE DATOS DE DESARROLLO:"
echo "   - Ve a https://vercel.com/dashboard"
echo "   - Selecciona el proyecto 'v0-remitero'"
echo "   - Ve a Settings > Environment Variables"
echo "   - Crea una nueva variable:"
echo "     - Name: dev_DATABASE_URL"
echo "     - Value: [URL de tu base de datos de desarrollo]"
echo "     - Environments: Preview, Development"
echo ""
echo "2. 🔒 CONFIGURAR DATABASE_URL SOLO PARA PRODUCCIÓN:"
echo "   - Edita la variable DATABASE_URL existente"
echo "   - Cambia Environments a: Production únicamente"
echo ""
echo "3. 🧪 VERIFICAR CONFIGURACIÓN:"
echo "   - Ejecuta: vercel env ls"
echo "   - Deberías ver:"
echo "     - DATABASE_URL: Production únicamente"
echo "     - dev_DATABASE_URL: Preview, Development"
echo ""
echo "4. 🚀 REDEPLOY:"
echo "   - Ejecuta: ./scripts/deploy-develop.sh"
echo "   - Ejecuta: ./scripts/deploy-production.sh"

echo ""
echo "💡 ALTERNATIVA - Usar Vercel CLI:"
echo "vercel env add dev_DATABASE_URL --scope=preview"
echo "vercel env add dev_DATABASE_URL --scope=development"
echo "vercel env rm DATABASE_URL --scope=preview"
echo "vercel env rm DATABASE_URL --scope=development"

echo ""
echo "✅ Script completado. Sigue los pasos manuales arriba."
