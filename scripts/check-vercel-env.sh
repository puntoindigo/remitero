#!/bin/bash

echo "🔍 Verificando configuración de variables de entorno en Vercel..."

echo "📋 Variables actuales:"
vercel env ls

echo ""
echo "🔧 PASO 1: Verificando configuración de NEXTAUTH_URL..."

# Verificar NEXTAUTH_URL para preview
echo "Verificando NEXTAUTH_URL para Preview..."
vercel env pull .env.preview --environment=preview 2>/dev/null
if [ -f ".env.preview" ]; then
    echo "NEXTAUTH_URL en Preview:"
    grep NEXTAUTH_URL .env.preview || echo "No encontrada"
    rm -f .env.preview
else
    echo "No se pudo obtener variables de Preview"
fi

echo ""
echo "🔧 PASO 2: Verificando configuración de DATABASE_URL..."

# Verificar DATABASE_URL para preview
echo "Verificando DATABASE_URL para Preview..."
vercel env pull .env.preview --environment=preview 2>/dev/null
if [ -f ".env.preview" ]; then
    echo "DATABASE_URL en Preview:"
    grep DATABASE_URL .env.preview | head -1 || echo "No encontrada"
    rm -f .env.preview
else
    echo "No se pudo obtener variables de Preview"
fi

echo ""
echo "🔧 PASO 3: Verificando configuración de NEXTAUTH_SECRET..."

# Verificar NEXTAUTH_SECRET para preview
echo "Verificando NEXTAUTH_SECRET para Preview..."
vercel env pull .env.preview --environment=preview 2>/dev/null
if [ -f ".env.preview" ]; then
    echo "NEXTAUTH_SECRET en Preview:"
    grep NEXTAUTH_SECRET .env.preview || echo "No encontrada"
    rm -f .env.preview
else
    echo "No se pudo obtener variables de Preview"
fi

echo ""
echo "💡 DIAGNÓSTICO:"
echo "• Si NEXTAUTH_URL no está configurada para Preview, las credenciales no funcionarán"
echo "• Si DATABASE_URL no está configurada para Preview, no se podrá conectar a la base de datos"
echo "• Si NEXTAUTH_SECRET no está configurada, NextAuth no funcionará"
echo ""
echo "🔧 SOLUCIÓN:"
echo "Si alguna variable falta, ejecuta:"
echo "echo 'https://remitero-dev.vercel.app' | vercel env add NEXTAUTH_URL preview"
echo "echo 'postgres://...' | vercel env add DATABASE_URL preview"
echo "echo 'secret-key' | vercel env add NEXTAUTH_SECRET preview"
