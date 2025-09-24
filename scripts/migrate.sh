#!/bin/bash

echo "🔄 Script de Migración de Base de Datos"
echo "======================================"

# Verificar que se proporcione la dirección
if [ $# -eq 0 ]; then
    echo "❌ Error: Debes especificar la dirección de migración"
    echo ""
    echo "USO:"
    echo "  ./scripts/migrate.sh dev-to-prod    # Migrar de desarrollo a producción"
    echo "  ./scripts/migrate.sh prod-to-dev    # Migrar de producción a desarrollo"
    echo "  ./scripts/migrate.sh --help         # Mostrar ayuda completa"
    echo ""
    exit 1
fi

# Mostrar ayuda
if [ "$1" = "--help" ]; then
    node scripts/migrate-database.js --help
    exit 0
fi

# Verificar que Node.js esté disponible
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado o no está en el PATH"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Ejecutar migración
echo "🚀 Ejecutando migración: $1"
echo ""

node scripts/migrate-database.js "$@"
