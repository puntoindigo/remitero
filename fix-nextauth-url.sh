#!/bin/bash

echo "🔧 Corrigiendo NEXTAUTH_URL en Vercel..."

# Agregar NEXTAUTH_URL correcta (sin caracteres de nueva línea)
echo "https://remitero-dev.vercel.app" | vercel env add NEXTAUTH_URL development
echo "https://remitero-dev.vercel.app" | vercel env add NEXTAUTH_URL preview
echo "https://remitero-dev.vercel.app" | vercel env add NEXTAUTH_URL production

echo ""
echo "✅ NEXTAUTH_URL corregida en todos los entornos"
echo "🔄 Ahora necesitas hacer un nuevo deploy para que los cambios tomen efecto"
echo ""
echo "Para forzar un nuevo deploy:"
echo "git commit --allow-empty -m 'fix: Corregir NEXTAUTH_URL'"
echo "git push origin develop"
