#!/bin/bash

echo "🚀 Reseteando TODAS las variables de entorno (Desarrollo + Producción)..."

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
echo "• DESARROLLO: dev_POSTGRES_URL, dev_PRISMA_DATABASE_URL, DATABASE_URL"
echo "• PRODUCCIÓN: prod_POSTGRES_URL, prod_PRISMA_DATABASE_URL, DATABASE_URL"

echo ""
echo "🗑️ PASO 1: Eliminando TODAS las variables existentes..."

# Eliminar variables de desarrollo
echo "Eliminando variables de desarrollo..."
vercel env rm dev_POSTGRES_URL preview --yes 2>/dev/null || echo "dev_POSTGRES_URL no existía"
vercel env rm dev_PRISMA_DATABASE_URL preview --yes 2>/dev/null || echo "dev_PRISMA_DATABASE_URL no existía"
vercel env rm dev_DATABASE_URL preview --yes 2>/dev/null || echo "dev_DATABASE_URL no existía"
vercel env rm dev_POSTGRES_URL development --yes 2>/dev/null || echo "dev_POSTGRES_URL no existía en development"
vercel env rm dev_PRISMA_DATABASE_URL development --yes 2>/dev/null || echo "dev_PRISMA_DATABASE_URL no existía en development"
vercel env rm DATABASE_URL development --yes 2>/dev/null || echo "DATABASE_URL no existía en development"

# Eliminar variables de producción
echo "Eliminando variables de producción..."
vercel env rm POSTGRES_URL production --yes 2>/dev/null || echo "POSTGRES_URL no existía en production"
vercel env rm PRISMA_DATABASE_URL production --yes 2>/dev/null || echo "PRISMA_DATABASE_URL no existía en production"
vercel env rm prod_POSTGRES_URL production --yes 2>/dev/null || echo "prod_POSTGRES_URL no existía en production"
vercel env rm prod_PRISMA_DATABASE_URL production --yes 2>/dev/null || echo "prod_PRISMA_DATABASE_URL no existía en production"
vercel env rm prod_DATABASE_URL production --yes 2>/dev/null || echo "prod_DATABASE_URL no existía en production"

echo ""
echo "✅ Variables eliminadas correctamente"

echo ""
echo "🔧 PASO 2: Creando variables de DESARROLLO..."

# Valores de desarrollo
DEV_POSTGRES_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"
DEV_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19oeFJWWDhQNjlMWEgyN3AzSFVhbWQiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI2MmQ4NjkxYzBiY2EwNGE1ZmNiMGE4ZWU5MjQzNWUxZGU0ZDhlZDYwOGYxMGZiMmE4ZWM1OTdmNDU4M2U1Y2IxIiwiaW50ZXJuYWxfc2VjcmV0IjoiOGNiZDNmNzQtNmE4Yi00Njk3LTg0NTktYWJlMmNkN2Q5NDlkIn0._6KDiMWwgiOHO65UkNvss0xDdQFTh7OVkB_cRzYfI-c"
DEV_DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

# Crear variables para Development
echo "Creando variables para Development..."
echo "$DEV_POSTGRES_URL" | vercel env add dev_POSTGRES_URL development
echo "$DEV_PRISMA_DATABASE_URL" | vercel env add dev_PRISMA_DATABASE_URL development
echo "$DEV_DATABASE_URL" | vercel env add DATABASE_URL development

echo ""
echo "🔧 PASO 3: Creando variables de PRODUCCIÓN..."

# Valores de producción
PROD_POSTGRES_URL="postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require"
PROD_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19LczVEc1JVWm5jeUZFUmdpS0VIY3kiLCJhcGlfa2V5IjoiMDFLNVhQWDZZU0NXTjNDTlczM003VjBWUzkiLCJ0ZW5hbnRfaWQiOiI1OGE3MTA4MGE5YTdiMmYxM2I0OGY0NWQ2MTQxZDUzYmIzZTMwNjMyOWViMDVlODQ0ZjcxMzY1NzFkNTYxMWE3IiwiaW50ZXJuYWxfc2VjcmV0IjoiNmQ1NDY5MDQtZTE5OC00NWU0LTkwMTYtZGQyZjkxMDkzOTA4In0.SwLnPMOTHx3IQxyUN_I2CmbgZK5eh4RSumd5EKwnZrQ"
PROD_DATABASE_URL="postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require"

# Crear variables para Production
echo "Creando variables para Production..."
echo "$PROD_POSTGRES_URL" | vercel env add prod_POSTGRES_URL production
echo "$PROD_PRISMA_DATABASE_URL" | vercel env add prod_PRISMA_DATABASE_URL production
echo "$PROD_DATABASE_URL" | vercel env add DATABASE_URL production

echo ""
echo "✅ Variables creadas correctamente"

echo ""
echo "🔍 PASO 4: Verificando configuración final..."
vercel env ls

echo ""
echo "🚀 PASO 5: Redesplegando ambos entornos..."
echo "Redesplegando Development..."
vercel --prod=false

echo "Redesplegando Production..."
vercel --prod

echo ""
echo "✅ Script maestro completado exitosamente!"
echo ""
echo "📋 Resumen de configuración:"
echo ""
echo "🔧 DESARROLLO:"
echo "• dev_POSTGRES_URL: URL directa de PostgreSQL"
echo "• dev_PRISMA_DATABASE_URL: URL de Prisma Accelerate (recomendada)"
echo "• DATABASE_URL: URL directa de PostgreSQL (alternativa)"
echo "• URL: https://remitero-dev.vercel.app/"
echo ""
echo "🚀 PRODUCCIÓN:"
echo "• prod_POSTGRES_URL: URL directa de PostgreSQL"
echo "• prod_PRISMA_DATABASE_URL: URL de Prisma Accelerate (recomendada)"
echo "• DATABASE_URL: URL directa de PostgreSQL (alternativa)"
echo "• URL: https://v0-remitero.vercel.app/"
echo ""
echo "💡 Recomendación: Usar las URLs de Prisma Accelerate para mejor rendimiento"
