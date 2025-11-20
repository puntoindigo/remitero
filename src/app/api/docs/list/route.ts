import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

interface DocumentInfo {
  name: string;
  path: string;
  title: string;
  modifiedAt: string;
  isInDocs: boolean;
}

// Mapeo de nombres de archivo a rutas API y títulos
const DOCUMENT_MAP: Record<string, { path: string; title: string }> = {
  'COMMITS': { path: '/api/docs/commits', title: 'Commits' },
  'ESTADO_MVP_PRODUCCION.md': { path: '/api/docs/estado-mvp', title: 'Estado del MVP para Producción' },
  'SISTEMA_COMPLETO.md': { path: '/api/docs/sistema-completo', title: 'Sistema Completo' },
  'DIAGNOSTICO_VERSION_ANTIGUA_PRODUCCION.md': { path: '/api/docs/diagnostico-version-antigua', title: 'Diagnóstico: Versión Antigua en Producción' },
  'CONFIGURAR_PRODUCTION_BRANCH.md': { path: '/api/docs/configurar-production-branch', title: 'Configurar Production Branch' },
  'ANALISIS_IDENTIDAD_COMPLETO.md': { path: '/api/docs/analisis-identidad', title: 'Análisis de Infraestructura de Identidad' },
};

// Generar título legible desde el nombre del archivo
function generateTitle(filename: string): string {
  // Remover extensión .md
  let title = filename.replace(/\.md$/i, '');
  
  // Reemplazar guiones bajos y guiones con espacios
  title = title.replace(/[_-]/g, ' ');
  
  // Capitalizar primera letra de cada palabra
  title = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return title;
}

// Generar ruta API desde el nombre del archivo
function generateApiPath(filename: string, isInDocs: boolean): string {
  // Si está en el mapa, usar esa ruta
  if (DOCUMENT_MAP[filename]?.path) {
    return DOCUMENT_MAP[filename].path;
  }
  
  // Si no, generar ruta basada en el nombre
  const baseName = filename.replace(/\.md$/i, '');
  const slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `/api/docs/${slug}`;
}

export async function GET() {
  try {
    const documents: DocumentInfo[] = [];
    const rootDir = process.cwd();
    const docsDir = join(rootDir, 'docs');
    
    // Leer archivos .md en la raíz
    try {
      const rootFiles = await readdir(rootDir);
      const mdFiles = rootFiles.filter(file => 
        file.endsWith('.md') && 
        !file.startsWith('README') && 
        file !== 'README.md'
      );
      
      for (const file of mdFiles) {
        try {
          const filePath = join(rootDir, file);
          const stats = await stat(filePath);
          
          // Solo incluir si es archivo (no directorio)
          if (stats.isFile()) {
            documents.push({
              name: file,
              path: generateApiPath(file, false),
              title: DOCUMENT_MAP[file]?.title || generateTitle(file),
              modifiedAt: stats.mtime.toISOString(),
              isInDocs: false,
            });
          }
        } catch (err) {
          console.warn(`Error al leer archivo ${file}:`, err);
        }
      }
    } catch (err) {
      console.warn('Error al leer directorio raíz:', err);
    }
    
    // Leer archivos .md en docs/
    try {
      const docsFiles = await readdir(docsDir);
      const mdFiles = docsFiles.filter(file => file.endsWith('.md'));
      
      for (const file of mdFiles) {
        try {
          const filePath = join(docsDir, file);
          const stats = await stat(filePath);
          
          if (stats.isFile()) {
            documents.push({
              name: file,
              path: generateApiPath(file, true),
              title: DOCUMENT_MAP[file]?.title || generateTitle(file),
              modifiedAt: stats.mtime.toISOString(),
              isInDocs: true,
            });
          }
        } catch (err) {
          console.warn(`Error al leer archivo docs/${file}:`, err);
        }
      }
    } catch (err) {
      console.warn('Error al leer directorio docs:', err);
    }
    
    // Agregar COMMITS como documento especial (siempre primero)
    documents.unshift({
      name: 'COMMITS',
      path: '/api/docs/commits',
      title: 'Commits',
      modifiedAt: new Date().toISOString(), // Siempre actual
      isInDocs: false,
    });
    
    // Ordenar por fecha de modificación (más reciente primero)
    documents.sort((a, b) => {
      // COMMITS siempre primero
      if (a.name === 'COMMITS') return -1;
      if (b.name === 'COMMITS') return 1;
      
      // Luego por fecha de modificación
      return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
    });
    
    return NextResponse.json({ documents });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al listar documentos:', errorMessage);
    return NextResponse.json(
      { error: 'Error al listar documentos', details: errorMessage },
      { status: 500 }
    );
  }
}

