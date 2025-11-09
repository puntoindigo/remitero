import { getManualContent, convertMarkdownLinks } from '@/lib/manual';
import { MarkdownViewer } from '@/components/manual/MarkdownViewer';
import { ManualSidebar } from '@/components/manual/ManualSidebar';
import { ManualBreadcrumb } from '@/components/manual/ManualBreadcrumb';
import { notFound } from 'next/navigation';

interface ManualPathPageProps {
  params: Promise<{ path?: string[] }>;
}

export default async function ManualPathPage({ params }: ManualPathPageProps) {
  try {
    const { path: pathSegments = [] } = await params;
    
    // Convertir array de segmentos a formato esperado
    // Si pathSegments es undefined o vacío, significa que estamos en /manual (índice)
    const segments = Array.isArray(pathSegments) 
      ? pathSegments.filter(Boolean)
      : pathSegments 
        ? [pathSegments].filter(Boolean)
        : [];
    
    const manualData = await getManualContent(segments);
    
    if (!manualData) {
      notFound();
    }

    const processedContent = convertMarkdownLinks(manualData.content, segments);

    // Construir breadcrumb
    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Manual', href: '/manual' },
      ...segments.map((segment, index) => ({
        label: segment.replace(/-/g, ' ').replace(/\.md$/, ''),
        href: `/manual/${segments.slice(0, index + 1).join('/')}`
      }))
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <ManualSidebar />

          {/* Contenido principal */}
          <main className="flex-1 lg:ml-72 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl">
              {/* Breadcrumb */}
              <ManualBreadcrumb breadcrumbs={breadcrumbs} />

              {/* Contenido del manual */}
              <article className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 mt-4 sm:mt-6 animate-fade-in animate-slide-in-from-bottom">
                <MarkdownViewer content={processedContent} />
              </article>
            </div>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ [Manual Path Page] Error:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-8 max-w-2xl w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Error al cargar el manual
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 text-left text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {error instanceof Error ? error.stack : String(error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

