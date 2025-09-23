#!/bin/bash

echo "🔧 Configurando entornos separados en Vercel..."

# Configurar variables para Producción
echo "📦 Configurando variables de Producción..."
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# Configurar variables para Preview
echo "🚧 Configurando variables de Preview..."
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_URL preview
vercel env add NEXTAUTH_SECRET preview

echo "✅ Variables de entorno configuradas!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar DATABASE_URL de producción en Vercel Dashboard"
echo "2. Configurar DATABASE_URL de desarrollo en Vercel Dashboard"
echo "3. Configurar NEXTAUTH_URL para cada entorno"
echo "4. Configurar NEXTAUTH_SECRET para cada entorno"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/daeiman0/v0-remitero/settings/environment-variables"
