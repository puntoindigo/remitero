#!/bin/bash

echo "🔍 Verificando configuración de Google OAuth..."
echo ""

# Verificar configuración actual
echo "📋 Configuración actual:"
curl -s https://remitero-dev.vercel.app/api/debug-google-auth | jq '.' 2>/dev/null || curl -s https://remitero-dev.vercel.app/api/debug-google-auth

echo ""
echo "🔗 URLs que DEBEN estar en Google Cloud Console:"
echo ""
echo "Authorized JavaScript origins:"
echo "  https://remitero-dev.vercel.app"
echo "  https://v0-remitero.vercel.app"
echo ""
echo "Authorized redirect URIs:"
echo "  https://remitero-dev.vercel.app/api/auth/callback/google"
echo "  https://v0-remitero.vercel.app/api/auth/callback/google"
echo ""

# Obtener el Client ID actual
CLIENT_ID=$(curl -s https://remitero-dev.vercel.app/api/debug-google-auth | grep -o '"googleClientIdPrefix":"[^"]*"' | cut -d'"' -f4 | sed 's/...$//')

echo "🔑 Client ID actual: $CLIENT_ID"
echo ""

echo "📝 Instrucciones:"
echo "1. Ve a https://console.cloud.google.com/"
echo "2. APIs & Services > Credentials"
echo "3. Busca el OAuth 2.0 Client ID: $CLIENT_ID"
echo "4. Edita y agrega las URLs mostradas arriba"
echo "5. Guarda los cambios"
echo "6. Espera 5-10 minutos"
echo "7. Prueba el login nuevamente"
echo ""

echo "🧪 Para probar después de configurar:"
echo "curl -s https://remitero-dev.vercel.app/api/debug-google-auth"
echo ""

echo "🌐 URL de login:"
echo "https://remitero-dev.vercel.app/auth/login"
