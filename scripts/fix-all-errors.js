#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando corrección automática de errores...\n');

// Función para leer archivo
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.log(`❌ Error leyendo ${filePath}: ${error.message}`);
        return null;
    }
}

// Función para escribir archivo
function writeFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.log(`❌ Error escribiendo ${filePath}: ${error.message}`);
        return false;
    }
}

// Función para agregar .catch() a fetch calls
function addCatchToFetch(content) {
    // Patrón para fetch calls sin .catch()
    const fetchPattern = /(const\s+\w+\s*=\s*await\s+fetch\([^)]+\))(?!\s*\.catch)/g;
    
    return content.replace(fetchPattern, (match) => {
        // Verificar si ya tiene .catch()
        if (match.includes('.catch')) {
            return match;
        }
        
        // Agregar .catch() básico
        return match + `.catch(error => {
            console.error('Network error:', error);
            throw new Error("Error de conexión de red");
        })`;
    });
}

// Función para agregar dependencias a useEffect
function fixUseEffectDependencies(content) {
    // Patrón para useEffect sin dependencias
    const useEffectPattern = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?\}(?!\s*,\s*\[)/g;
    
    return content.replace(useEffectPattern, (match) => {
        // Verificar si ya tiene dependencias
        if (match.includes('],')) {
            return match;
        }
        
        // Agregar array de dependencias vacío
        return match + ', []';
    });
}

// Función para agregar verificaciones de undefined
function addUndefinedChecks(content) {
    // Patrón para acceso a propiedades sin verificación
    const propertyAccessPattern = /(\w+)\.(\w+)(?!\?\.)/g;
    
    return content.replace(propertyAccessPattern, (match, obj, prop) => {
        // Solo aplicar a ciertos patrones problemáticos
        if (prop === 'length' || prop === 'id' || prop === 'name' || prop === 'email') {
            return `${obj}?.${prop}`;
        }
        return match;
    });
}

// Función para corregir un archivo específico
function fixFile(filePath) {
    console.log(`🔍 Procesando: ${filePath}`);
    
    const content = readFile(filePath);
    if (!content) return false;
    
    let modifiedContent = content;
    let changes = 0;
    
    // Aplicar correcciones
    const originalContent = modifiedContent;
    
    // 1. Agregar .catch() a fetch calls
    modifiedContent = addCatchToFetch(modifiedContent);
    if (modifiedContent !== originalContent) {
        changes++;
        console.log(`  ✅ Agregados .catch() a fetch calls`);
    }
    
    // 2. Corregir useEffect dependencies
    modifiedContent = fixUseEffectDependencies(modifiedContent);
    if (modifiedContent !== content) {
        changes++;
        console.log(`  ✅ Corregidas dependencias de useEffect`);
    }
    
    // 3. Agregar verificaciones de undefined
    modifiedContent = addUndefinedChecks(modifiedContent);
    if (modifiedContent !== content) {
        changes++;
        console.log(`  ✅ Agregadas verificaciones de undefined`);
    }
    
    // Escribir archivo si hubo cambios
    if (changes > 0) {
        if (writeFile(filePath, modifiedContent)) {
            console.log(`  ✅ Archivo corregido (${changes} cambios)`);
            return true;
        }
    } else {
        console.log(`  ℹ️  No se requirieron cambios`);
    }
    
    return false;
}

// Lista de archivos a corregir (basado en el reporte)
const filesToFix = [
    // API Routes
    'src/app/api/categories/[id]/route.ts',
    'src/app/api/categories/route.ts',
    'src/app/api/clients/[id]/route.ts',
    'src/app/api/clients/route.ts',
    'src/app/api/companies/[id]/route.ts',
    'src/app/api/companies/route.ts',
    'src/app/api/estados-remitos/[id]/route.ts',
    'src/app/api/estados-remitos/route.ts',
    'src/app/api/products/[id]/route.ts',
    'src/app/api/products/route.ts',
    'src/app/api/remitos/[id]/route.ts',
    'src/app/api/remitos/[id]/status/route.ts',
    'src/app/api/remitos/route.ts',
    'src/app/api/users/[id]/route.ts',
    'src/app/api/users/route.ts',
    
    // Pages
    'src/app/auth/login/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/estados-remitos/page.tsx',
    'src/app/productos/ProductosContent.tsx',
    'src/app/remitos/[id]/print/page.tsx',
    'src/app/remitos/page.tsx',
    'src/app/usuarios/page.tsx',
    
    // Components
    'src/components/common/EnvironmentBanner.tsx',
    'src/components/common/ErrorBoundary.tsx',
    'src/components/common/FilterableSelect.tsx',
    'src/components/common/MessageModal.tsx',
    'src/components/common/PasswordGeneratorModal.tsx',
    'src/components/forms/CategoriaForm.tsx',
    'src/components/forms/ClienteForm.tsx',
    'src/components/forms/EmpresaForm.tsx',
    'src/components/forms/EstadoRemitoForm.tsx',
    'src/components/forms/ProductoForm.tsx',
    'src/components/forms/RemitoFormComplete.tsx',
    'src/components/forms/UsuarioForm.tsx',
    'src/components/layout/AuthenticatedLayout.tsx',
    'src/components/layout/Header.tsx',
    'src/components/layout/Layout.tsx',
    'src/components/layout/TopBar.tsx',
    'src/components/ui/popover.tsx',
    
    // Hooks
    'src/hooks/useCategorias.ts',
    'src/hooks/useClientes.ts',
    'src/hooks/useDataWithCompanySimple.ts',
    'src/hooks/useEmpresas.ts',
    'src/hooks/useEnvironment.ts',
    'src/hooks/useEstadosByCompany.ts',
    'src/hooks/useEstadosRemitos.ts',
    'src/hooks/useImpersonation.ts',
    'src/hooks/useLoading.ts',
    'src/hooks/useLocalStorage.ts',
    'src/hooks/useProductos.ts',
    'src/hooks/useRemitos.ts',
    'src/hooks/useSessionGuard.tsx',
    'src/hooks/useTheme.ts',
    'src/hooks/useUsuarios.ts',
    
    // Services
    'src/lib/services/categoryService.ts',
    'src/lib/services/clientService.ts',
    'src/lib/services/productService.ts',
    'src/lib/services/remitoService.ts'
];

// Procesar archivos
let totalFixed = 0;
let totalErrors = 0;

console.log(`📁 Procesando ${filesToFix.length} archivos...\n`);

filesToFix.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
        if (fixFile(fullPath)) {
            totalFixed++;
        }
    } else {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
        totalErrors++;
    }
});

console.log('\n🎉 Corrección completada!');
console.log(`✅ Archivos corregidos: ${totalFixed}`);
console.log(`❌ Archivos con errores: ${totalErrors}`);
console.log(`📊 Total procesados: ${filesToFix.length}`);

if (totalFixed > 0) {
    console.log('\n💡 Recomendaciones:');
    console.log('1. Ejecuta "npm run build" para verificar que no hay errores de compilación');
    console.log('2. Ejecuta "npm run dev" para probar la aplicación');
    console.log('3. Revisa la consola del navegador para errores restantes');
}
