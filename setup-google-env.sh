#!/bin/bash

echo "🔧 Configurando variables de entorno de Google OAuth en Vercel..."

# Leer las variables del archivo .env.local
GOOGLE_CLIENT_ID=$(grep "GOOGLE_CLIENT_ID" .env.local | cut -d'=' -f2 | tr -d '"')
GOOGLE_CLIENT_SECRET=$(grep "GOOGLE_CLIENT_SECRET" .env.local | cut -d'=' -f2 | tr -d '"')

echo "📋 Variables encontradas:"
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:10}..."

echo ""
echo "🚀 Agregando variables a Vercel..."

# Agregar GOOGLE_CLIENT_ID para todos los entornos
echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID development
echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID preview  
echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production

# Agregar GOOGLE_CLIENT_SECRET para todos los entornos
echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET development
echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET preview
echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production

echo ""
echo "✅ Variables de entorno agregadas exitosamente!"
echo "🔄 Ahora necesitas hacer un nuevo deploy para que los cambios tomen efecto."
