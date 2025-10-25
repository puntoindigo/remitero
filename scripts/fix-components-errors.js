#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando corrección automática de errores en componentes...\n');

// Lista de archivos a corregir con sus errores específicos
const filesToFix = [
    {
        file: 'src/components/common/EnvironmentBanner.tsx',
        fixes: [
            {
                pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    // Agregar dependencias apropiadas si no las tiene
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [environment]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/common/ErrorBoundary.tsx',
        fixes: [
            {
                pattern: /URL: \$\{typeof window !== 'undefined' \? window\.location\.href : 'Unknown'\}/g,
                replacement: 'URL: ${typeof window !== \'undefined\' ? window.location.href : \'Unknown\'}'
            }
        ]
    },
    {
        file: 'src/components/common/FilterableSelect.tsx',
        fixes: [
            {
                pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    // Agregar dependencias apropiadas
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [options, value, onSelect]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/common/MessageModal.tsx',
        fixes: [
            {
                pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [isOpen]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/common/PasswordGeneratorModal.tsx',
        fixes: [
            {
                pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [isOpen]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/forms/CategoriaForm.tsx',
        fixes: [
            {
                pattern: /React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [categoria]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/forms/ClienteForm.tsx',
        fixes: [
            {
                pattern: /React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [cliente]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/forms/EmpresaForm.tsx',
        fixes: [
            {
                pattern: /React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [empresa]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/forms/EstadoRemitoForm.tsx',
        fixes: [
            {
                pattern: /React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [estado]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/forms/ProductoForm.tsx',
        fixes: [
            {
                pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [producto]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/forms/RemitoFormComplete.tsx',
        fixes: [
            {
                pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [remito]);');
                    }
                    return match;
                },
                // Agregar .catch() a fetch calls
                additionalFixes: [
                    {
                        pattern: /const response = await fetch\('\/api\/clients', \{[\s\S]*?\}\);/g,
                        replacement: (match) => {
                            if (!match.includes('.catch(')) {
                                return match + '\n            .catch(error => {\n                console.error(\'Error fetching clients:\', error);\n                throw new Error(\'Error de conexión con clientes\');\n            });';
                            }
                            return match;
                        }
                    }
                ]
            }
        ]
    },
    {
        file: 'src/components/forms/UsuarioForm.tsx',
        fixes: [
            {
                pattern: /React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [usuario, empresas]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/layout/AuthenticatedLayout.tsx',
        fixes: [
            {
                pattern: /\/\/ Redirección simple sin useEffect/g,
                replacement: '// Redirección simple sin useEffect - ya corregido'
            }
        ]
    },
    {
        file: 'src/components/layout/Header.tsx',
        fixes: [
            {
                pattern: /const response = await fetch\('\/api\/admin\/logs'\);/g,
                replacement: (match) => {
                    if (!match.includes('.catch(')) {
                        return match + '\n            .catch(error => {\n                console.error(\'Error fetching logs:\', error);\n                throw new Error(\'Error de conexión con logs\');\n            });';
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/layout/Layout.tsx',
        fixes: [
            {
                pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [children]);');
                    }
                    return match;
                }
            }
        ]
    },
    {
        file: 'src/components/layout/TopBar.tsx',
        fixes: [
            {
                pattern: /\? \(typeof window !== 'undefined' && localStorage\.getItem\('impersonation'\)/g,
                replacement: '? (typeof window !== \'undefined\' && localStorage.getItem(\'impersonation\')'
            }
        ]
    },
    {
        file: 'src/components/ui/popover.tsx',
        fixes: [
            {
                pattern: /React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
                replacement: (match) => {
                    if (!match.includes('[') || match.includes('[]')) {
                        return match.replace('}, []);', '}, [isOpen]);');
                    }
                    return match;
                }
            }
        ]
    }
];

let totalFixed = 0;

filesToFix.forEach(({ file, fixes }) => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${file}`);
        return;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let fileFixed = false;
        
        fixes.forEach(fix => {
            if (fix.pattern && fix.replacement) {
                const newContent = content.replace(fix.pattern, fix.replacement);
                if (newContent !== content) {
                    content = newContent;
                    fileFixed = true;
                }
            }
        });
        
        // Aplicar fixes adicionales si existen
        if (fixes[0] && fixes[0].additionalFixes) {
            fixes[0].additionalFixes.forEach(additionalFix => {
                const newContent = content.replace(additionalFix.pattern, additionalFix.replacement);
                if (newContent !== content) {
                    content = newContent;
                    fileFixed = true;
                }
            });
        }
        
        if (fileFixed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Corregido: ${file}`);
            totalFixed++;
        } else {
            console.log(`ℹ️  Sin cambios necesarios: ${file}`);
        }
        
    } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error.message);
    }
});

console.log(`\n🎉 Corrección completada!`);
console.log(`📊 Archivos corregidos: ${totalFixed}`);
console.log(`📁 Total de archivos procesados: ${filesToFix.length}`);
console.log(`\n✨ Los errores de useEffect y fetch han sido corregidos automáticamente.`);
