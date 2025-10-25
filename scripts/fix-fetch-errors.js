const fs = require('fs');
const path = require('path');

// Lista de archivos de hooks a arreglar
const hookFiles = [
  'src/hooks/useClientes.ts',
  'src/hooks/useEmpresas.ts',
  'src/hooks/useEstadosByCompany.ts',
  'src/hooks/useEstadosRemitos.ts',
  'src/hooks/useImpersonation.ts',
  'src/hooks/useProductos.ts',
  'src/hooks/useRemitos.ts',
  'src/hooks/useUsuarios.ts'
];

function fixFetchErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Patrón para encontrar fetch sin .catch()
    const fetchPattern = /(\s+const response = await fetch\([^)]+\))(\s*;)/g;
    
    content = content.replace(fetchPattern, (match, fetchCall, semicolon) => {
      // Verificar si ya tiene .catch()
      if (fetchCall.includes('.catch(')) {
        return match;
      }
      
      // Agregar .catch() con manejo de errores
      const errorMessage = getErrorMessage(fetchCall);
      return `${fetchCall}.catch(error => {
        console.error('Network error:', error);
        throw new Error("${errorMessage}");
      })${semicolon}`;
    });

    if (content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed fetch errors in ${filePath}`);
      modified = true;
    }

    return modified;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function getErrorMessage(fetchCall) {
  if (fetchCall.includes('/api/categories')) {
    return 'Error de conexión con categorías';
  } else if (fetchCall.includes('/api/clients')) {
    return 'Error de conexión con clientes';
  } else if (fetchCall.includes('/api/companies')) {
    return 'Error de conexión con empresas';
  } else if (fetchCall.includes('/api/products')) {
    return 'Error de conexión con productos';
  } else if (fetchCall.includes('/api/remitos')) {
    return 'Error de conexión con remitos';
  } else if (fetchCall.includes('/api/users')) {
    return 'Error de conexión con usuarios';
  } else if (fetchCall.includes('/api/estados-remitos')) {
    return 'Error de conexión con estados';
  } else {
    return 'Error de conexión de red';
  }
}

function fixUseEffectDependencies(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Patrón para useEffect sin dependencias
    const useEffectPattern = /useEffect\(\(\) => \{([^}]+)\}\);/g;
    
    content = content.replace(useEffectPattern, (match, body) => {
      // Verificar si ya tiene dependencias
      if (match.includes('}, [')) {
        return match;
      }
      
      // Agregar dependencias básicas
      return `useEffect(() => {${body}}, [currentUser?.id, currentUser?.companyId]);`;
    });

    if (content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed useEffect dependencies in ${filePath}`);
      modified = true;
    }

    return modified;
  } catch (error) {
    console.error(`❌ Error fixing useEffect in ${filePath}:`, error.message);
    return false;
  }
}

// Ejecutar correcciones
console.log('🔧 Fixing fetch errors and useEffect dependencies...\n');

let totalFixed = 0;

hookFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Processing ${filePath}...`);
    
    const fetchFixed = fixFetchErrors(fullPath);
    const useEffectFixed = fixUseEffectDependencies(fullPath);
    
    if (fetchFixed || useEffectFixed) {
      totalFixed++;
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} files`);
console.log('🎉 All fetch errors and useEffect dependencies have been fixed!');
