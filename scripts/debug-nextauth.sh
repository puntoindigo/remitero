#!/bin/bash

echo "🔍 Debugging NextAuth paso a paso..."

BASE_URL="https://remitero-dev.vercel.app"
EMAIL="admin@remitero.com"
PASSWORD="daedae123"

echo "🔧 PASO 1: Verificando que el sitio esté funcionando..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ El sitio no está funcionando correctamente"
    exit 1
fi

echo "✅ Sitio funcionando"

echo ""
echo "🔧 PASO 2: Verificando endpoint de sesión..."
SESSION_RESPONSE=$(curl -s "$BASE_URL/api/auth/session")
echo "Sesión: $SESSION_RESPONSE"

echo ""
echo "🔧 PASO 3: Verificando endpoint de proveedores..."
PROVIDERS_RESPONSE=$(curl -s "$BASE_URL/api/auth/providers")
echo "Proveedores: $PROVIDERS_RESPONSE"

echo ""
echo "🔧 PASO 4: Verificando endpoint CSRF..."
CSRF_RESPONSE=$(curl -s "$BASE_URL/api/auth/csrf")
echo "CSRF: $CSRF_RESPONSE"

echo ""
echo "🔧 PASO 5: Probando autenticación completa..."
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "CSRF Token extraído: $CSRF_TOKEN"

if [ -z "$CSRF_TOKEN" ]; then
    echo "❌ No se pudo obtener CSRF token"
    exit 1
fi

echo ""
echo "🔧 PASO 6: Enviando credenciales..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$EMAIL&password=$PASSWORD&csrfToken=$CSRF_TOKEN&callbackUrl=$BASE_URL&json=true" \
  -w "HTTP_CODE:%{http_code}")

echo "Respuesta de autenticación: $AUTH_RESPONSE"

echo ""
echo "💡 DIAGNÓSTICO:"
echo "• Si el CSRF token no se obtiene, hay un problema con NextAuth"
echo "• Si la autenticación devuelve error, revisar los logs del servidor"
echo "• Si la sesión está vacía, la autenticación falló"
