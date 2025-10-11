#!/usr/bin/env node

/**
 * Script de verificación de ABMs
 * Verifica que todos los ABMs tengan:
 * 1. Endpoints API funcionando
 * 2. Hooks correspondientes
 * 3. Componentes de formulario
 * 4. Páginas usando DataTable
 */

const fs = require('fs');
const path = require('path');

const ABMS = [
  {
    name: 'usuarios',
    apiPath: 'src/app/api/users/route.ts',
    hookPath: 'src/hooks/useUsuarios.ts',
    formPath: 'src/components/forms/UsuarioForm.tsx',
    pagePath: 'src/app/usuarios/page.tsx'
  },
  {
    name: 'empresas',
    apiPath: 'src/app/api/companies/route.ts',
    hookPath: 'src/hooks/useEmpresas.ts',
    formPath: 'src/components/forms/EmpresaForm.tsx',
    pagePath: 'src/app/empresas/page.tsx'
  },
  {
    name: 'categorias',
    apiPath: 'src/app/api/categories/route.ts',
    hookPath: 'src/hooks/useCategorias.ts',
    formPath: 'src/components/forms/CategoriaForm.tsx',
    pagePath: 'src/app/categorias/page.tsx'
  },
  {
    name: 'clientes',
    apiPath: 'src/app/api/clients/route.ts',
    hookPath: 'src/hooks/useClientes.ts',
    formPath: 'src/components/forms/ClienteForm.tsx',
    pagePath: 'src/app/clientes/page.tsx'
  },
  {
    name: 'productos',
    apiPath: 'src/app/api/products/route.ts',
    hookPath: 'src/hooks/useProductos.ts',
    formPath: 'src/components/forms/ProductoForm.tsx',
    pagePath: 'src/app/productos/ProductosContent.tsx'
  },
  {
    name: 'estados-remitos',
    apiPath: 'src/app/api/estados-remitos/route.ts',
    hookPath: 'src/hooks/useEstadosByCompany.ts',
    formPath: null, // No tiene formulario separado
    pagePath: 'src/app/estados-remitos/page.tsx'
  },
  {
    name: 'remitos',
    apiPath: 'src/app/api/remitos/route.ts',
    hookPath: 'src/hooks/useRemitos.ts',
    formPath: 'src/components/forms/RemitoFormComplete.tsx',
    pagePath: 'src/app/remitos/page.tsx'
  }
];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContent(filePath, requiredImports = []) {
  if (!checkFileExists(filePath)) {
    return { exists: false, content: null };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const hasRequiredImports = requiredImports.every(importStr => 
    content.includes(importStr)
  );
  
  return { exists: true, content, hasRequiredImports };
}

function checkDataTableUsage(pagePath) {
  const result = checkFileContent(pagePath, ['DataTable', 'useCRUDTable']);
  return result;
}

function checkFormUsage(pagePath, formPath) {
  if (!formPath) return { hasForm: false };
  
  const pageResult = checkFileContent(pagePath, [path.basename(formPath, '.tsx')]);
  const formExists = checkFileExists(formPath);
  
  return { 
    hasForm: formExists && pageResult.hasRequiredImports,
    formExists,
    pageUsesForm: pageResult.hasRequiredImports
  };
}

console.log('🔍 AUDITORÍA COMPLETA DE ABMs\n');

let allPassed = true;

ABMS.forEach(abm => {
  console.log(`📋 ${abm.name.toUpperCase()}`);
  console.log('─'.repeat(50));
  
  // Verificar API
  const apiExists = checkFileExists(abm.apiPath);
  console.log(`  API: ${apiExists ? '✅' : '❌'} ${abm.apiPath}`);
  
  // Verificar Hook
  const hookExists = checkFileExists(abm.hookPath);
  console.log(`  Hook: ${hookExists ? '✅' : '❌'} ${abm.hookPath}`);
  
  // Verificar Formulario
  const formCheck = checkFormUsage(abm.pagePath, abm.formPath);
  if (abm.formPath) {
    console.log(`  Form: ${formCheck.hasForm ? '✅' : '❌'} ${abm.formPath}`);
  } else {
    console.log(`  Form: ⚪ No requerido`);
  }
  
  // Verificar DataTable
  const dataTableCheck = checkDataTableUsage(abm.pagePath);
  console.log(`  DataTable: ${dataTableCheck.hasRequiredImports ? '✅' : '❌'} ${abm.pagePath}`);
  
  // Verificar página existe
  const pageExists = checkFileExists(abm.pagePath);
  console.log(`  Page: ${pageExists ? '✅' : '❌'} ${abm.pagePath}`);
  
  // Estado general
  const abmPassed = apiExists && hookExists && pageExists && 
                   dataTableCheck.hasRequiredImports && 
                   (abm.formPath ? formCheck.hasForm : true);
  
  console.log(`  Estado: ${abmPassed ? '✅ COMPLETO' : '❌ INCOMPLETO'}`);
  
  if (!abmPassed) {
    allPassed = false;
  }
  
  console.log('');
});

console.log('📊 RESUMEN GENERAL');
console.log('═'.repeat(50));
console.log(`Estado general: ${allPassed ? '✅ TODOS LOS ABMs COMPLETOS' : '❌ ALGUNOS ABMs INCOMPLETOS'}`);

if (!allPassed) {
  console.log('\n🔧 ACCIONES REQUERIDAS:');
  ABMS.forEach(abm => {
    const apiExists = checkFileExists(abm.apiPath);
    const hookExists = checkFileExists(abm.hookPath);
    const pageExists = checkFileExists(abm.pagePath);
    const dataTableCheck = checkDataTableUsage(abm.pagePath);
    const formCheck = checkFormUsage(abm.pagePath, abm.formPath);
    
    if (!apiExists) console.log(`  - Crear API: ${abm.apiPath}`);
    if (!hookExists) console.log(`  - Crear Hook: ${abm.hookPath}`);
    if (!pageExists) console.log(`  - Crear Página: ${abm.pagePath}`);
    if (!dataTableCheck.hasRequiredImports) console.log(`  - Migrar a DataTable: ${abm.pagePath}`);
    if (abm.formPath && !formCheck.hasForm) console.log(`  - Crear/Integrar Form: ${abm.formPath}`);
  });
}

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('1. Probar creación de registros en cada ABM');
console.log('2. Probar edición de registros en cada ABM');
console.log('3. Probar eliminación de registros en cada ABM');
console.log('4. Probar búsqueda y paginación en cada ABM');
console.log('5. Verificar que los datos se persistan correctamente');
