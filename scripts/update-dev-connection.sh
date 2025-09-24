#!/bin/bash

echo "🔧 Actualizando conexión de desarrollo con nuevas URLs de Prisma..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

echo "📋 Configurando variables de entorno para desarrollo..."

# Variables de desarrollo
DEV_POSTGRES_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"
DEV_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19oeFJWWDhQNjlMWEgyN3AzSFVhbWQiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI2MmQ4NjkxYzBiY2EwNGE1ZmNiMGE4ZWU5MjQzNWUxZGU0ZDhlZDYwOGYxMGZiMmE4ZWM1OTdmNDU4M2U1Y2IxIiwiaW50ZXJuYWxfc2VjcmV0IjoiOGNiZDNmNzQtNmE4Yi00Njk3LTg0NTktYWJlMmNkN2Q5NDlkIn0._6KDiMWwgiOHO65UkNvss0xDdQFTh7OVkB_cRzYfI-c"
DEV_DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

echo ""
echo "🔍 Variables a configurar:"
echo "• dev_POSTGRES_URL: URL directa de PostgreSQL"
echo "• dev_PRISMA_DATABASE_URL: URL de Prisma Accelerate (recomendada)"
echo "• DATABASE_URL: URL directa de PostgreSQL (alternativa)"

echo ""
echo "📝 Pasos para configurar en Vercel Dashboard:"
echo ""
echo "1. 🗄️  IR A VERCEL DASHBOARD:"
echo "   https://vercel.com/daeiman0/v0-remitero/settings/environment-variables"
echo ""
echo "2. 🔧 AGREGAR VARIABLES PARA PREVIEW/DEVELOPMENT:"
echo ""
echo "   Variable: dev_POSTGRES_URL"
echo "   Valor: $DEV_POSTGRES_URL"
echo "   Entornos: Preview, Development"
echo ""
echo "   Variable: dev_PRISMA_DATABASE_URL"
echo "   Valor: $DEV_PRISMA_DATABASE_URL"
echo "   Entornos: Preview, Development"
echo ""
echo "   Variable: DATABASE_URL"
echo "   Valor: $DEV_DATABASE_URL"
echo "   Entornos: Preview, Development"
echo ""
echo "3. 🧪 VERIFICAR CONFIGURACIÓN:"
echo "   vercel env ls"
echo ""
echo "4. 🚀 REDEPLOY DESARROLLO:"
echo "   ./scripts/deploy-develop.sh"
echo ""
echo "💡 RECOMENDACIÓN:"
echo "   Usar dev_PRISMA_DATABASE_URL para mejor rendimiento con Prisma Accelerate"
echo ""
echo "✅ Script completado. Configura las variables en Vercel Dashboard."
