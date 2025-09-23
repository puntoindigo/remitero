#!/bin/bash

# Script para deploy manual a develop (preview)
echo "🚀 Deploying to develop (preview)..."

# Verificar que estamos en develop
current_branch=$(git branch --show-current)
if [ "$current_branch" != "develop" ]; then
    echo "❌ Error: Debes estar en el branch 'develop'"
    echo "Ejecuta: git checkout develop"
    exit 1
fi

# Hacer push a develop
echo "📤 Pushing to develop..."
git push origin develop

# Deploy manual a preview
echo "🌐 Deploying to preview..."
vercel --yes

echo "✅ Deploy a develop completado!"
echo "🔗 URL Preview: https://v0-remitero-dev.vercel.app"
