#!/bin/bash

echo "🔧 Corrigiendo imports de Prisma en todos los endpoints..."

# Lista de archivos que necesitan corrección
FILES=(
  "src/app/api/categories/route.ts"
  "src/app/api/categories/[id]/route.ts"
  "src/app/api/clients/route.ts"
  "src/app/api/clients/[id]/route.ts"
  "src/app/api/products/route.ts"
  "src/app/api/products/[id]/route.ts"
  "src/app/api/remitos/route.ts"
  "src/app/api/remitos/[id]/route.ts"
)

echo "📋 Archivos a corregir:"
for file in "${FILES[@]}"; do
  echo "• $file"
done

echo ""
echo "🔧 Aplicando correcciones..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Procesando: $file"
    
    # Crear backup
    cp "$file" "$file.backup"
    
    # Reemplazar import de prisma
    sed -i '' 's/import { prisma } from "@\/lib\/db";/import { PrismaClient } from "@prisma\/client";/' "$file"
    
    # Agregar función createPrismaClient si no existe
    if ! grep -q "createPrismaClient" "$file"; then
      # Buscar la línea después de los imports
      sed -i '' '/^import.*from.*@prisma\/client/a\
\
// Crear una instancia de Prisma específica para este endpoint\
const createPrismaClient = () => {\
  const isPreview = process.env.VERCEL_ENV === '\''preview'\'' || process.env.NODE_ENV === '\''development'\''\
  const databaseUrl = isPreview \
    ? process.env.DATABASE_URL || process.env.dev_PRISMA_DATABASE_URL || process.env.dev_POSTGRES_URL\
    : process.env.DATABASE_URL || process.env.prod_PRISMA_DATABASE_URL || process.env.prod_POSTGRES_URL\
  \
  if (!databaseUrl) {\
    throw new Error('\''DATABASE_URL is not configured'\'')\
  }\
  \
  return new PrismaClient({\
    datasources: {\
      db: {\
        url: databaseUrl\
      }\
    }\
  })\
}' "$file"
    fi
    
    echo "✅ Corregido: $file"
  else
    echo "❌ No encontrado: $file"
  fi
done

echo ""
echo "🎯 PRÓXIMO PASO:"
echo "Revisar manualmente cada archivo para:"
echo "1. Agregar 'const prisma = createPrismaClient();' al inicio de cada función"
echo "2. Agregar 'await prisma.\$disconnect();' en el bloque finally"
echo "3. Verificar que no haya errores de sintaxis"
echo ""
echo "💡 Archivos corregidos:"
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "• $file"
  fi
done
