#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para corregir errores de JSON.stringify().catch()
function fixJsonStringifyErrors(content) {
  // Patrón para encontrar JSON.stringify().catch() incorrecto
  const pattern = /body:\s*JSON\.stringify\(([^)]+)\)\.catch\(([^}]+)\}\),/g;
  
  return content.replace(pattern, (match, jsonContent, catchContent) => {
    // Extraer el contenido del catch
    const catchMatch = catchContent.match(/\{([^}]+)\}/);
    if (catchMatch) {
      const catchBody = catchMatch[1];
      return `body: JSON.stringify(${jsonContent})\n      }).catch(error => {\n        ${catchBody}\n      });`;
    }
    return match;
  });
}

// Archivos a corregir
const filesToFix = [
  'src/lib/services/categoryService.ts',
  'src/lib/services/clientService.ts', 
  'src/lib/services/productService.ts',
  'src/lib/services/remitoService.ts',
  'src/app/productos/ProductosContent.tsx',
  'src/app/remitos/page.tsx'
];

console.log('🔧 Corrigiendo errores de JSON.stringify().catch()...');

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      content = fixJsonStringifyErrors(content);
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Corregido: ${filePath}`);
      } else {
        console.log(`ℹ️  Sin cambios: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
  }
});

console.log('🎉 Corrección completada!');
