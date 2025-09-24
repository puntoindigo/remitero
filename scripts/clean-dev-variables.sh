#!/bin/bash

echo "🔧 Limpiando variables de desarrollo duplicadas..."

# Función para eliminar variable de un entorno específico
remove_var_from_env() {
    local var_name=$1
    local env_name=$2
    
    echo "Eliminando $var_name de $env_name..."
    echo "$env_name" | vercel env rm "$var_name" preview --yes 2>/dev/null || echo "No se pudo eliminar $var_name de $env_name"
}

echo "🗑️ PASO 1: Eliminando variables duplicadas..."

# Eliminar de Preview (develop)
remove_var_from_env "dev_POSTGRES_URL" "Preview (develop)"
remove_var_from_env "dev_PRISMA_DATABASE_URL" "Preview (develop)"

# Eliminar de Preview, Development
remove_var_from_env "dev_POSTGRES_URL" "Preview, Development"
remove_var_from_env "dev_PRISMA_DATABASE_URL" "Preview, Development"
remove_var_from_env "dev_DATABASE_URL" "Preview, Development"

echo ""
echo "✅ Variables duplicadas eliminadas"

echo ""
echo "🔧 PASO 2: Creando variables limpias solo para Development..."

# Valores de las variables
DEV_POSTGRES_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"
DEV_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19oeFJWWDhQNjlMWEgyN3AzSFVhbWQiLCJhcGlfa2V5IjoiMDFLNVNTNDY0QjBYWlNCMlNWRUc4NVlIVjYiLCJ0ZW5hbnRfaWQiOiI2MmQ4NjkxYzBiY2EwNGE1ZmNiMGE4ZWU5MjQzNWUxZGU0ZDhlZDYwOGYxMGZiMmE4ZWM1OTdmNDU4M2U1Y2IxIiwiaW50ZXJuYWxfc2VjcmV0IjoiOGNiZDNmNzQtNmE4Yi00Njk3LTg0NTktYWJlMmNkN2Q5NDlkIn0._6KDiMWwgiOHO65UkNvss0xDdQFTh7OVkB_cRzYfI-c"
DEV_DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

# Crear variables solo para Development
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
echo "✅ Script completado!"
echo ""
echo "💡 Ahora las variables están solo en Development, sin duplicados"
