import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

// Mapeo de slugs a archivos
const SLUG_TO_FILE: Record<string, { file: string; inDocs: boolean }> = {
  'estado-mvp': { file: 'ESTADO_MVP_PRODUCCION.md', inDocs: true },
  'sistema-completo': { file: 'SISTEMA_COMPLETO.md', inDocs: true },
  'diagnostico-version-antigua': { file: 'DIAGNOSTICO_VERSION_ANTIGUA_PRODUCCION.md', inDocs: true },
  'configurar-production-branch': { file: 'CONFIGURAR_PRODUCTION_BRANCH.md', inDocs: true },
  'analisis-identidad': { file: 'ANALISIS_IDENTIDAD_COMPLETO.md', inDocs: false },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Si está en el mapeo, usar ese archivo
    if (SLUG_TO_FILE[slug]) {
      const { file, inDocs } = SLUG_TO_FILE[slug];
      const filePath = inDocs 
        ? join(process.cwd(), 'docs', file)
        : join(process.cwd(), file);
      
      const content = await readFile(filePath, 'utf-8');
      
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }
    
    // Si no está en el mapeo, intentar buscar el archivo por slug
    // Primero en docs/, luego en la raíz
    const rootDir = process.cwd();
    const docsDir = join(rootDir, 'docs');
    
    // Intentar encontrar archivo que coincida con el slug
    const possibleNames = [
      `${slug}.md`,
      `${slug.replace(/-/g, '_')}.md`,
      `${slug.replace(/-/g, '_').toUpperCase()}.md`,
    ];
    
    for (const name of possibleNames) {
      // Intentar en docs/
      try {
        const filePath = join(docsDir, name);
        await stat(filePath); // Verificar que existe
        const content = await readFile(filePath, 'utf-8');
        
        return new NextResponse(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      } catch {
        // Continuar
      }
      
      // Intentar en raíz
      try {
        const filePath = join(rootDir, name);
        await stat(filePath); // Verificar que existe
        const content = await readFile(filePath, 'utf-8');
        
        return new NextResponse(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      } catch {
        // Continuar
      }
    }
    
    return NextResponse.json(
      { error: 'Documento no encontrado', slug },
      { status: 404 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al leer el archivo', details: errorMessage },
      { status: 500 }
    );
  }
}

