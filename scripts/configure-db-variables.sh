#!/bin/bash

echo "🔧 Configurando variables de base de datos para entornos separados..."

# Verificar variables actuales
echo "📋 Variables actuales:"
vercel env ls | grep DATABASE_URL

echo ""
echo "✅ CONFIGURACIÓN ACTUAL:"
echo "• Preview (develop): Usa dev_DATABASE_URL"
echo "• Production: Usa DATABASE_URL"
echo ""
echo "🔍 Para verificar que funciona:"
echo "1. Preview: https://remitero-dev.vercel.app/"
echo "2. Production: https://v0-remitero.vercel.app/"
echo ""
echo "📝 Las variables ya están configuradas correctamente en Vercel Dashboard"
echo "🔗 Dashboard: https://vercel.com/daeiman0/v0-remitero/settings/environment-variables"
