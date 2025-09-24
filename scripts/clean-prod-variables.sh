#!/bin/bash

echo "🔧 Limpiando y configurando variables de producción..."

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

echo "📋 Variables de producción a configurar:"
echo "• prod_POSTGRES_URL"
echo "• prod_PRISMA_DATABASE_URL (Prisma Accelerate)"
echo "• DATABASE_URL (alternativa)"

echo ""
echo "🗑️ PASO 1: Eliminando variables de producción existentes..."

# Eliminar variables existentes para Production
echo "Eliminando variables para Production..."
vercel env rm POSTGRES_URL production --yes 2>/dev/null || echo "POSTGRES_URL no existía en production"
vercel env rm PRISMA_DATABASE_URL production --yes 2>/dev/null || echo "PRISMA_DATABASE_URL no existía en production"
vercel env rm prod_POSTGRES_URL production --yes 2>/dev/null || echo "prod_POSTGRES_URL no existía en production"
vercel env rm prod_PRISMA_DATABASE_URL production --yes 2>/dev/null || echo "prod_PRISMA_DATABASE_URL no existía en production"
vercel env rm prod_DATABASE_URL production --yes 2>/dev/null || echo "prod_DATABASE_URL no existía en production"

echo ""
echo "✅ Variables de producción eliminadas"

echo ""
echo "🔧 PASO 2: Creando nuevas variables de producción..."

# Valores de las variables de producción
PROD_POSTGRES_URL="postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require"
PROD_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19LczVEc1JVWm5jeUZFUmdpS0VIY3kiLCJhcGlfa2V5IjoiMDFLNVhQWDZZU0NXTjNDTlczM003VjBWUzkiLCJ0ZW5hbnRfaWQiOiI1OGE3MTA4MGE5YTdiMmYxM2I0OGY0NWQ2MTQxZDUzYmIzZTMwNjMyOWViMDVlODQ0ZjcxMzY1NzFkNTYxMWE3IiwiaW50ZXJuYWxfc2VjcmV0IjoiNmQ1NDY5MDQtZTE5OC00NWU0LTkwMTYtZGQyZjkxMDkzOTA4In0.SwLnPMOTHx3IQxyUN_I2CmbgZK5eh4RSumd5EKwnZrQ"
PROD_DATABASE_URL="postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require"

# Crear variables para Production
echo "Creando variables para Production..."
echo "$PROD_POSTGRES_URL" | vercel env add prod_POSTGRES_URL production
echo "$PROD_PRISMA_DATABASE_URL" | vercel env add prod_PRISMA_DATABASE_URL production
echo "$PROD_DATABASE_URL" | vercel env add DATABASE_URL production

echo ""
echo "✅ Variables de producción creadas correctamente"

echo ""
echo "🔍 PASO 3: Verificando configuración..."
vercel env ls

echo ""
echo "🚀 PASO 4: Redesplegando entorno de producción..."
vercel --prod

echo ""
echo "✅ Script de producción completado exitosamente!"
echo ""
echo "📋 Resumen de variables de producción configuradas:"
echo "• prod_POSTGRES_URL: URL directa de PostgreSQL"
echo "• prod_PRISMA_DATABASE_URL: URL de Prisma Accelerate (recomendada)"
echo "• DATABASE_URL: URL directa de PostgreSQL (alternativa)"
echo ""
echo "🌐 URL de producción:"
echo "• Production: https://v0-remitero.vercel.app/"
echo ""
echo "💡 Recomendación: Usar prod_PRISMA_DATABASE_URL para mejor rendimiento"
