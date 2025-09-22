#!/bin/bash

echo "🚀 Desplegando entorno de desarrollo..."

# Cambiar a branch develop
git checkout develop

# Hacer pull de los últimos cambios
git pull origin develop

# Instalar dependencias
npm install

# Ejecutar migración de base de datos
echo "📝 Ejecutando migración de base de datos..."
node scripts/migrate-vercel.js

# Hacer build
echo "🔨 Construyendo aplicación..."
npm run build

# Hacer commit y push
git add .
git commit -m "deploy: actualización de desarrollo $(date)"
git push origin develop

echo "✅ Despliegue de desarrollo completado"
echo "🌐 URL: https://remitero-dev.vercel.app"
