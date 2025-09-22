#!/bin/bash

echo "🚀 Desplegando entorno de producción..."

# Cambiar a branch main
git checkout main

# Hacer pull de los últimos cambios
git pull origin main

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
git commit -m "deploy: actualización de producción $(date)"
git push origin main

echo "✅ Despliegue de producción completado"
echo "🌐 URL: https://remitero-prod.vercel.app"
