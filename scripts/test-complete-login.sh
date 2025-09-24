#!/bin/bash

echo "🔍 Probando login completo paso a paso..."

BASE_URL="https://remitero-dev.vercel.app"
EMAIL="admin@remitero.com"
PASSWORD="daedae123"

echo "🔧 PASO 1: Obteniendo CSRF token..."
CSRF_RESPONSE=$(curl -s -c cookies.txt "$BASE_URL/api/auth/csrf")
echo "Respuesta CSRF: $CSRF_RESPONSE"

CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "CSRF Token: $CSRF_TOKEN"

if [ -z "$CSRF_TOKEN" ]; then
    echo "❌ No se pudo obtener CSRF token"
    exit 1
fi

echo ""
echo "🔧 PASO 2: Probando autenticación..."
AUTH_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$EMAIL&password=$PASSWORD&csrfToken=$CSRF_TOKEN&callbackUrl=$BASE_URL&json=true" \
  -w "HTTP_CODE:%{http_code}")

echo "Respuesta de autenticación: $AUTH_RESPONSE"

echo ""
echo "🔧 PASO 3: Verificando sesión después del login..."
SESSION_RESPONSE=$(curl -s -b cookies.txt "$BASE_URL/api/auth/session")
echo "Sesión después del login: $SESSION_RESPONSE"

echo ""
echo "🔧 PASO 4: Probando acceso al dashboard..."
DASHBOARD_RESPONSE=$(curl -s -b cookies.txt -w "HTTP_CODE:%{http_code}" "$BASE_URL/dashboard")
echo "Dashboard HTTP Code: $(echo "$DASHBOARD_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)"

echo ""
echo "🔧 PASO 5: Limpiando archivos temporales..."
rm -f cookies.txt

echo ""
echo "💡 DIAGNÓSTICO:"
echo "• Si el CSRF token no se obtiene, hay un problema con NextAuth"
echo "• Si la autenticación devuelve error, revisar los logs del servidor"
echo "• Si la sesión está vacía después del login, la autenticación falló"
echo "• Si el dashboard devuelve 401/403, hay un problema de autorización"
