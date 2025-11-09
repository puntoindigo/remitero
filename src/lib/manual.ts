import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

function getManualBasePath(): string {
  try {
    // En Next.js, process.cwd() puede no estar disponible en todos los contextos
    // Usar una función lazy para obtener la ruta cuando se necesite
    if (typeof process !== 'undefined' && process.cwd) {
      const cwd = process.cwd();
      const manualPath = path.join(cwd, 'docs', 'manual');
      return manualPath;
    }
    throw new Error('process.cwd() not available');
  } catch (error) {
    console.error('❌ [Manual] Error getting base path:', error);
    // Fallback: usar ruta relativa
    return path.join(process.cwd(), 'docs', 'manual');
  }
}

// Lazy initialization para evitar problemas en tiempo de importación
let MANUAL_BASE_PATH: string | null = null;

function getManualBasePathLazy(): string {
  if (!MANUAL_BASE_PATH) {
    MANUAL_BASE_PATH = getManualBasePath();
  }
  return MANUAL_BASE_PATH;
}

export interface ManualSection {
  title: string;
  path: string;
  children?: ManualSection[];
}

export function getManualPath(segments: string[]): string {
  const basePath = getManualBasePathLazy();
  
  if (segments.length === 0) {
    return path.join(basePath, '00-INDICE.md');
  }
  
  // Construir la ruta base
  const fullPath = path.join(basePath, ...segments);
  
  // Si termina en .md, usar directamente
  if (fullPath.endsWith('.md')) {
    return fullPath;
  }
  
  // Si no tiene extensión, intentar con .md
  return `${fullPath}.md`;
}

async function tryReadFile(filePath: string): Promise<string | null> {
  try {
    await fsPromises.access(filePath);
    return await fsPromises.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function readManualFile(filePath: string): Promise<string | null> {
  try {
    console.log('📖 [Manual] Intentando leer archivo:', filePath);
    
    // Intentar leer el archivo directamente
    let content = await tryReadFile(filePath);
    if (content) {
      console.log('✅ [Manual] Archivo leído exitosamente, tamaño:', content.length);
      return content;
    }
    
    // Si no existe, intentar como directorio con README.md
    const readmePath = path.join(filePath, 'README.md');
    content = await tryReadFile(readmePath);
    if (content) {
      console.log('✅ [Manual] README.md leído exitosamente, tamaño:', content.length);
      return content;
    }
    
    // Si el archivo no termina en .md, intentar agregar .md
    if (!filePath.endsWith('.md')) {
      const withMd = `${filePath}.md`;
      content = await tryReadFile(withMd);
      if (content) {
        console.log('✅ [Manual] Archivo con .md leído exitosamente, tamaño:', content.length);
        return content;
      }
    }
    
    console.error('❌ [Manual] Archivo no existe en ninguna variación:', filePath);
    return null;
  } catch (error) {
    console.error('❌ [Manual] Error reading manual file:', error);
    if (error instanceof Error) {
      console.error('❌ [Manual] Error message:', error.message);
      console.error('❌ [Manual] Error stack:', error.stack);
    }
    return null;
  }
}

export async function getManualContent(segments: string[]): Promise<{ content: string; title: string } | null> {
  try {
    const basePath = getManualBasePathLazy();
    console.log('📖 [Manual] getManualContent llamado con segments:', segments);
    console.log('📖 [Manual] MANUAL_BASE_PATH:', basePath);
    console.log('📖 [Manual] process.cwd():', typeof process !== 'undefined' ? process.cwd() : 'N/A');
    
    const filePath = getManualPath(segments);
    console.log('📖 [Manual] Ruta calculada:', filePath);
    
    const content = await readManualFile(filePath);
    
    if (!content) {
      console.error('❌ [Manual] No se pudo leer el contenido del archivo');
      return null;
    }
    
    // Extraer título del primer H1
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].replace(/^📚\s*/, '').replace(/^#+\s*/, '') : 'Manual';
    
    console.log('✅ [Manual] Contenido obtenido exitosamente, título:', title);
    return { content, title };
  } catch (error) {
    console.error('❌ [Manual] Error en getManualContent:', error);
    if (error instanceof Error) {
      console.error('❌ [Manual] Error message:', error.message);
      console.error('❌ [Manual] Error stack:', error.stack);
    }
    return null;
  }
}

export function convertMarkdownLinks(content: string, currentPath: string[]): string {
  // Convertir enlaces relativos del markdown a rutas de Next.js
  // Ejemplo: [texto](./01-inicio-rapido/README.md) -> [texto](/manual/01-inicio-rapido)
  
  let processed = content;
  
  // Enlaces relativos con ./
  processed = processed.replace(
    /\[([^\]]+)\]\(\.\/([^)]+)\)/g,
    (match, text, linkPath) => {
      // Remover .md si existe
      let cleanPath = linkPath.replace(/\.md$/, '');
      // Si termina en /, removerlo
      cleanPath = cleanPath.replace(/\/$/, '');
      // Construir ruta absoluta
      const segments = cleanPath.split('/').filter(Boolean);
      const route = `/manual/${segments.join('/')}`;
      return `[${text}](${route})`;
    }
  );
  
  // Enlaces relativos con ../
  processed = processed.replace(
    /\[([^\]]+)\]\(\.\.\/([^)]+)\)/g,
    (match, text, linkPath) => {
      // Enlaces a documentos fuera del manual (como AGENTS.md)
      const cleanPath = linkPath.replace(/\.md$/, '');
      // Si es AGENTS.md, mantenerlo como referencia externa
      if (cleanPath === 'AGENTS' || cleanPath.includes('AGENTS')) {
        return `[${text}](https://github.com/puntoindigo/remitero/blob/develop/docs/AGENTS.md)`;
      }
      return `[${text}](/docs/${cleanPath})`;
    }
  );
  
  // Enlaces a directorios sin .md (ej: ./01-inicio-rapido/)
  processed = processed.replace(
    /\[([^\]]+)\]\(\.\/([^)]+\/)\)/g,
    (match, text, linkPath) => {
      const cleanPath = linkPath.replace(/\/$/, '');
      const segments = cleanPath.split('/').filter(Boolean);
      const route = `/manual/${segments.join('/')}`;
      return `[${text}](${route})`;
    }
  );
  
  return processed;
}

