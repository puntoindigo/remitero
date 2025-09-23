#!/bin/bash

echo "🚀 Desplegando entorno de desarrollo..."

# Cambiar a branch develop
git checkout develop

# Hacer pull de los últimos cambios
git pull origin develop

# Instalar dependencias
npm install

# Hacer commit y push (esto activará el deploy automático)
git add .
git commit -m "deploy: actualización de desarrollo $(date)" || echo "No hay cambios para commitear"
git push origin develop

echo "✅ Push completado - Vercel hará deploy automático"
echo "🌐 URL: https://remitero-nextjs-[hash].vercel.app"
echo "📋 Verifica en Vercel Dashboard para la URL exacta"
