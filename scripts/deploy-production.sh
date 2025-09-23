#!/bin/bash

# Script para deploy automático a producción
echo "🚀 Deploying to production..."

# Verificar que estamos en main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ Error: Debes estar en el branch 'main'"
    echo "Ejecuta: git checkout main"
    exit 1
fi

# Hacer push a main (esto activará el deploy automático)
echo "📤 Pushing to main (deploy automático)..."
git push origin main

echo "✅ Deploy a producción iniciado!"
echo "🔗 URL Producción: https://v0-remitero.vercel.app"
echo "ℹ️  El deploy es automático, no ejecutes 'vercel --prod'"
