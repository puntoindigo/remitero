#!/bin/bash

echo "🔧 Reseteando variables de entorno de desarrollo en Vercel..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI no está instalado. Instálalo con: npm i -g vercel"
    exit 1
fi

echo "📋 Variables a configurar:"
echo "• dev_POSTGRES_URL"
echo "• dev_PRISMA_DATABASE_URL (Prisma Accelerate)"
echo "• DATABASE_URL"

echo ""
echo "🗑️  PASO 1: Eliminando variables existentes..."

# Eliminar variables existentes para preview
echo "Eliminando variables para Preview..."
vercel env rm dev_POSTGRES_URL preview --yes 2>/dev/null || echo "dev_POSTGRES_URL no existía en preview"
vercel env rm dev_PRISMA_DATABASE_URL preview --yes 2>/dev/null || echo "dev_PRISMA_DATABASE_URL no existía en preview"
vercel env rm DATABASE_URL preview --yes 2>/dev/null || echo "DATABASE_URL no existía en preview"

# Eliminar variables existentes para development
echo "Eliminando variables para Development..."
vercel env rm dev_POSTGRES_URL development --yes 2>/dev/null || echo "dev_POSTGRES_URL no existía en development"
vercel env rm dev_PRISMA_DATABASE_URL development --yes 2>/dev/null || echo "dev_PRISMA_DATABASE_URL no existía en development"
vercel env rm DATABASE_URL development --yes 2>/dev/null || echo "DATABASE_URL no existía en development"

echo ""
echo "✅ Variables eliminadas correctamente"

echo ""
echo "🔧 PASO 2: Creando nuevas variables..."

# Valores de las variables
DEV_POSTGRES_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"
DEV_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19oeFJWWDhQNjlMWEgyN3AzSFVhbWQiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI2MmQ4NjkxYzBiY2EwNGE1ZmNiMGE4ZWU5MjQzNWUxZGU0ZDhlZDYwOGYxMGZiMmE4ZWM1OTdmNDU4M2U1Y2IxIiwiaW50ZXJuYWxfc2VjcmV0IjoiOGNiZDNmNzQtNmE4Yi00Njk3LTg0NTktYWJlMmNkN2Q5NDlkIn0._6KDiMWwgiOHO65UkNvss0xDdQFTh7OVkB_cRzYfI-c"
DEV_DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

# Crear variables para Preview
echo "Creando variables para Preview..."
echo "$DEV_POSTGRES_URL" | vercel env add dev_POSTGRES_URL preview
echo "$DEV_PRISMA_DATABASE_URL" | vercel env add dev_PRISMA_DATABASE_URL preview
echo "$DEV_DATABASE_URL" | vercel env add DATABASE_URL preview

# Crear variables para Development
echo "Creando variables para Development..."
echo "$DEV_POSTGRES_URL" | vercel env add dev_POSTGRES_URL development
echo "$DEV_PRISMA_DATABASE_URL" | vercel env add dev_PRISMA_DATABASE_URL development
echo "$DEV_DATABASE_URL" | vercel env add DATABASE_URL development

echo ""
echo "✅ Variables creadas correctamente"

echo ""
echo "🔍 PASO 3: Verificando configuración..."
vercel env ls

echo ""
echo "🚀 PASO 4: Redesplegando entorno de desarrollo..."
vercel --prod=false

echo ""
echo "✅ Script completado exitosamente!"
echo ""
echo "📋 Resumen de variables configuradas:"
echo "• dev_POSTGRES_URL: URL directa de PostgreSQL"
echo "• dev_PRISMA_DATABASE_URL: URL de Prisma Accelerate (recomendada)"
echo "• DATABASE_URL: URL directa de PostgreSQL (alternativa)"
echo ""
echo "🌐 URLs de los entornos:"
echo "• Preview: https://remitero-dev.vercel.app/"
echo "• Development: https://remitero-dev.vercel.app/"
echo ""
echo "💡 Recomendación: Usar dev_PRISMA_DATABASE_URL para mejor rendimiento"
