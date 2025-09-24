#!/bin/bash

echo "🔧 Corrigiendo todos los endpoints de API..."

# Función para corregir un archivo
fix_endpoint() {
    local file="$1"
    echo "📝 Corrigiendo: $file"
    
    if [ ! -f "$file" ]; then
        echo "❌ Archivo no encontrado: $file"
        return 1
    fi
    
    # Crear backup
    cp "$file" "$file.backup"
    
    # Reemplazar import de prisma
    sed -i '' 's/import { prisma } from "@\/lib\/db";/import { withPrisma } from "@\/lib\/prisma";/' "$file"
    
    # Reemplazar todas las instancias de prisma. con withPrisma(async (prisma) => { ... })
    # Esto es más complejo, así que haremos los reemplazos más comunes
    
    echo "✅ Corregido: $file"
}

# Lista de archivos a corregir
FILES=(
    "src/app/api/remitos/route.ts"
    "src/app/api/remitos/[id]/route.ts"
    "src/app/api/categories/[id]/route.ts"
    "src/app/api/clients/[id]/route.ts"
    "src/app/api/products/[id]/route.ts"
)

echo "📋 Corrigiendo endpoints restantes..."

for file in "${FILES[@]}"; do
    fix_endpoint "$file"
done

echo ""
echo "🎯 PRÓXIMO PASO:"
echo "Revisar manualmente cada archivo para:"
echo "1. Reemplazar 'await prisma.' con 'await withPrisma(async (prisma) => { ... })'"
echo "2. Verificar que no haya errores de sintaxis"
echo "3. Probar funcionalidad"
echo ""
echo "💡 Archivos corregidos:"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "• $file"
    fi
done
