import { readFile } from 'fs/promises';
import { join } from 'path';
import { MarkdownContent } from '@/components/docs/MarkdownContent';

export default async function EstadoMVPPage() {
  let content = '';
  let error: string | null = null;

  try {
    const filePath = join(process.cwd(), 'docs', 'ESTADO_MVP_PRODUCCION.md');
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error desconocido';
    console.error('❌ [Estado MVP] Error leyendo archivo:', error);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">No se pudo cargar el contenido</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" style={{ padding: 0, margin: 0 }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-100">
            Dashboard
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">Estado MVP</span>
        </nav>

        {/* Contenido del documento */}
        <article className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 animate-fade-in animate-slide-in-from-bottom">
          <MarkdownContent content={content} />
        </article>
      </div>
    </div>
  );
}

