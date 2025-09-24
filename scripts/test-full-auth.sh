#!/bin/bash

echo "🔍 Probando autenticación completa con CSRF token..."

BASE_URL="https://remitero-dev.vercel.app"
EMAIL="admin@remitero.com"
PASSWORD="daedae123"

echo "🔧 PASO 1: Obteniendo CSRF token..."
CSRF_RESPONSE=$(curl -s -c cookies.txt "$BASE_URL/api/auth/csrf")
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CSRF_TOKEN" ]; then
    echo "❌ No se pudo obtener CSRF token"
    echo "Respuesta: $CSRF_RESPONSE"
    exit 1
fi

echo "✅ CSRF token obtenido: $CSRF_TOKEN"

echo ""
echo "🔧 PASO 2: Probando autenticación con CSRF token..."
AUTH_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$EMAIL&password=$PASSWORD&csrfToken=$CSRF_TOKEN&callbackUrl=$BASE_URL&json=true")

echo "Respuesta de autenticación:"
echo "$AUTH_RESPONSE"

echo ""
echo "🔧 PASO 3: Verificando sesión..."
SESSION_RESPONSE=$(curl -s -b cookies.txt "$BASE_URL/api/auth/session")
echo "Respuesta de sesión:"
echo "$SESSION_RESPONSE"

echo ""
echo "🔧 PASO 4: Limpiando archivos temporales..."
rm -f cookies.txt

echo ""
echo "💡 DIAGNÓSTICO:"
echo "• Si el CSRF token no se obtiene, hay un problema con NextAuth"
echo "• Si la autenticación falla, hay un problema con las credenciales o la base de datos"
echo "• Si la sesión está vacía, la autenticación no fue exitosa"
