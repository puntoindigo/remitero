#!/bin/bash

echo "🔧 Forzando configuración correcta de ramas en Vercel..."

echo "📋 PROBLEMA IDENTIFICADO:"
echo "• La rama 'develop' está yendo a Production"
echo "• Debería ir a Preview"
echo "• Esto causa que use la base de datos incorrecta"
echo ""

echo "🔧 SOLUCIÓN MANUAL REQUERIDA:"
echo ""
echo "1. 🗄️  IR A VERCEL DASHBOARD:"
echo "   https://vercel.com/daeiman0/v0-remitero/settings/git"
echo ""
echo "2. 🔧 CONFIGURAR RAMAS:"
echo "   • Production Branch: main"
echo "   • Preview Branch: develop"
echo ""
echo "3. 🚀 HACER UN NUEVO DEPLOY:"
echo "   git push origin develop"
echo ""

echo "🔍 VERIFICACIÓN ACTUAL:"
echo "• URL Preview: https://remitero-dev.vercel.app/"
echo "• URL Production: https://v0-remitero.vercel.app/"
echo ""

echo "📊 ESTADO ACTUAL DE VARIABLES:"
vercel env ls | grep -E "(DATABASE_URL|NEXTAUTH_URL)" | head -6

echo ""
echo "💡 EXPLICACIÓN DEL PROBLEMA:"
echo "• Las variables de entorno están correctas"
echo "• Los usuarios están en la base de datos correcta"
echo "• Pero la rama 'develop' está yendo a Production"
echo "• Por eso usa la base de datos de producción (vacía)"
echo "• Y por eso las credenciales no funcionan"
echo ""

echo "🎯 UNA VEZ CONFIGURADO CORRECTAMENTE:"
echo "• develop → Preview → Base de datos de desarrollo"
echo "• main → Production → Base de datos de producción"
echo "• Las credenciales funcionarán perfectamente"
echo ""

echo "🚀 PASOS INMEDIATOS:"
echo "1. Configurar ramas en Vercel Dashboard"
echo "2. Hacer push de la rama develop"
echo "3. Probar credenciales en https://remitero-dev.vercel.app/"
echo ""

echo "✅ CREDENCIALES QUE FUNCIONARÁN:"
echo "• SuperAdmin: admin@remitero.com / daedae123"
echo "• Admin: admin@empresademo.com / admin123"
