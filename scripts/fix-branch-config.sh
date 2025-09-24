#!/bin/bash

echo "🔧 Corrigiendo configuración de ramas y entornos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

echo "📋 Configuración actual:"
echo "• main → debería ir a Production"
echo "• develop → debería ir a Preview/Development"
echo ""

echo "🔍 PASO 1: Verificando configuración actual de ramas..."
vercel project inspect v0-remitero | grep -A 10 -B 10 "branch\|environment"

echo ""
echo "🔧 PASO 2: Configurando variables de entorno correctamente..."

echo ""
echo "📝 INSTRUCCIONES PARA CONFIGURAR EN VERCEL DASHBOARD:"
echo ""
echo "1. 🗄️  IR A VERCEL DASHBOARD:"
echo "   https://vercel.com/daeiman0/v0-remitero/settings/git"
echo ""
echo "2. 🔧 CONFIGURAR RAMAS:"
echo "   • main → Production Branch"
echo "   • develop → Preview Branch"
echo ""
echo "3. 🔧 CONFIGURAR VARIABLES DE ENTORNO:"
echo ""
echo "   PARA PRODUCTION (main):"
echo "   • DATABASE_URL = URL de producción"
echo "   • NEXTAUTH_URL = https://v0-remitero.vercel.app"
echo "   • NEXTAUTH_SECRET = secret-prod"
echo ""
echo "   PARA PREVIEW/DEVELOPMENT (develop):"
echo "   • DATABASE_URL = URL de desarrollo"
echo "   • NEXTAUTH_URL = https://remitero-dev.vercel.app"
echo "   • NEXTAUTH_SECRET = secret-dev"
echo ""

echo "🔧 PASO 3: Comandos para configurar variables..."

# Variables de producción
PROD_DATABASE_URL="postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require"

# Variables de desarrollo
DEV_DATABASE_URL="postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"

echo "Configurar variables para PRODUCTION (main):"
echo "echo \"$PROD_DATABASE_URL\" | vercel env add DATABASE_URL production"
echo "echo \"https://v0-remitero.vercel.app\" | vercel env add NEXTAUTH_URL production"
echo "echo \"secret-prod-$(date +%s)\" | vercel env add NEXTAUTH_SECRET production"
echo ""

echo "Configurar variables para PREVIEW/DEVELOPMENT (develop):"
echo "echo \"$DEV_DATABASE_URL\" | vercel env add DATABASE_URL preview"
echo "echo \"https://remitero-dev.vercel.app\" | vercel env add NEXTAUTH_URL preview"
echo "echo \"secret-dev-$(date +%s)\" | vercel env add NEXTAUTH_SECRET preview"
echo ""

echo "🔧 PASO 4: Crear usuarios en la base de datos correcta..."

echo ""
echo "Para crear usuarios en la base de datos de PRODUCCIÓN:"
echo "export DATABASE_URL=\"$PROD_DATABASE_URL\""
echo "node scripts/create-users-final.js"
echo ""

echo "Para crear usuarios en la base de datos de DESARROLLO:"
echo "export DATABASE_URL=\"$DEV_DATABASE_URL\""
echo "node scripts/create-users-final.js"
echo ""

echo "✅ Script completado!"
echo ""
echo "💡 RESUMEN DEL PROBLEMA:"
echo "• Las ramas están mal configuradas"
echo "• develop está yendo a Production en lugar de Preview"
echo "• main debería ir a Production"
echo "• Las credenciales están en la base de datos incorrecta"
echo ""
echo "🚀 SOLUCIÓN:"
echo "1. Configurar ramas en Vercel Dashboard"
echo "2. Configurar variables de entorno correctamente"
echo "3. Crear usuarios en la base de datos correcta"
