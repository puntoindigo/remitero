#!/bin/bash

echo "🔍 Verificando configuración específica del entorno Preview..."

echo "🔧 PASO 1: Obteniendo variables de entorno de Preview..."
vercel env pull .env.preview --environment=preview

if [ -f ".env.preview" ]; then
    echo "✅ Variables de Preview obtenidas:"
    echo ""
    echo "📋 Variables relevantes:"
    grep -E "(DATABASE_URL|NEXTAUTH_URL|NEXTAUTH_SECRET)" .env.preview
    
    echo ""
    echo "🔧 PASO 2: Verificando configuración de DATABASE_URL..."
    DB_URL=$(grep "DATABASE_URL=" .env.preview | cut -d'=' -f2- | tr -d '"')
    if [[ $DB_URL == *"62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1"* ]]; then
        echo "✅ DATABASE_URL correcta (desarrollo)"
    else
        echo "❌ DATABASE_URL incorrecta"
        echo "Esperada: URL de desarrollo"
        echo "Encontrada: $DB_URL"
    fi
    
    echo ""
    echo "🔧 PASO 3: Verificando configuración de NEXTAUTH_URL..."
    AUTH_URL=$(grep "NEXTAUTH_URL=" .env.preview | cut -d'=' -f2- | tr -d '"')
    if [[ $AUTH_URL == *"remitero-dev.vercel.app"* ]]; then
        echo "✅ NEXTAUTH_URL correcta (desarrollo)"
    else
        echo "❌ NEXTAUTH_URL incorrecta"
        echo "Esperada: https://remitero-dev.vercel.app"
        echo "Encontrada: $AUTH_URL"
    fi
    
    echo ""
    echo "🔧 PASO 4: Verificando configuración de NEXTAUTH_SECRET..."
    AUTH_SECRET=$(grep "NEXTAUTH_SECRET=" .env.preview | cut -d'=' -f2- | tr -d '"')
    if [ -n "$AUTH_SECRET" ]; then
        echo "✅ NEXTAUTH_SECRET configurada"
    else
        echo "❌ NEXTAUTH_SECRET no configurada"
    fi
    
    rm -f .env.preview
else
    echo "❌ No se pudieron obtener las variables de Preview"
fi

echo ""
echo "🔧 PASO 5: Verificando configuración de ramas en Vercel..."
echo "Verificando si develop está configurada para Preview..."

# Verificar configuración de ramas
vercel project inspect v0-remitero | grep -A 5 -B 5 "branch\|environment" || echo "No se pudo obtener información de ramas"

echo ""
echo "💡 DIAGNÓSTICO:"
echo "• Si DATABASE_URL no es la de desarrollo, las credenciales no funcionarán"
echo "• Si NEXTAUTH_URL no es remitero-dev.vercel.app, NextAuth fallará"
echo "• Si NEXTAUTH_SECRET no está configurada, la autenticación fallará"
echo ""
echo "🔧 SOLUCIÓN:"
echo "Si alguna variable está incorrecta, ejecuta:"
echo "vercel env rm VARIABLE_NAME preview --yes"
echo "echo 'VALOR_CORRECTO' | vercel env add VARIABLE_NAME preview"
