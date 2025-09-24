#!/bin/bash

echo "🔧 Configurando mapeo de ramas correctamente..."

echo "📋 Configuración actual:"
echo "• main → debería ir a Production"
echo "• develop → debería ir a Preview"
echo ""

echo "🔧 PASO 1: Verificando configuración actual de ramas..."
echo "Verificando si develop está configurada para Preview..."

# Verificar si hay un archivo de configuración de Vercel
if [ -f "vercel.json" ]; then
    echo "📄 Archivo vercel.json encontrado:"
    cat vercel.json
else
    echo "❌ No se encontró vercel.json"
fi

echo ""
echo "🔧 PASO 2: Verificando configuración de Git en Vercel..."
vercel project inspect v0-remitero | grep -A 10 -B 10 "git\|branch\|environment" || echo "No se pudo obtener información de Git"

echo ""
echo "🔧 PASO 3: Verificando variables de entorno por entorno..."
echo "Variables para Production:"
vercel env ls | grep "Production"

echo ""
echo "Variables para Preview:"
vercel env ls | grep "Preview"

echo ""
echo "Variables para Development:"
vercel env ls | grep "Development"

echo ""
echo "💡 DIAGNÓSTICO:"
echo "• Si develop está yendo a Production, las credenciales no funcionarán"
echo "• Las variables de entorno deben estar configuradas para cada entorno específico"
echo ""
echo "🔧 SOLUCIÓN MANUAL:"
echo "1. Ve a Vercel Dashboard: https://vercel.com/daeiman0/v0-remitero/settings/git"
echo "2. Configura:"
echo "   • Production Branch: main"
echo "   • Preview Branch: develop"
echo "3. Verifica que las variables de entorno estén configuradas para cada entorno"
echo ""
echo "🔧 SOLUCIÓN AUTOMÁTICA:"
echo "Si quieres que configure las variables automáticamente, ejecuta:"
echo "./scripts/reset-all-environments.sh"
