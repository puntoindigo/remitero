'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, BookOpen, Home } from 'lucide-react';

interface ManualSection {
  title: string;
  path: string;
  emoji?: string;
  children?: ManualSection[];
}

const manualSections: ManualSection[] = [
  {
    title: 'Inicio Rápido',
    path: '/manual/01-inicio-rapido',
    emoji: '🚀',
    children: [
      { title: 'Primeros Pasos', path: '/manual/01-inicio-rapido/primeros-pasos' },
      { title: 'Google OAuth', path: '/manual/01-inicio-rapido/google-oauth' },
    ],
  },
  {
    title: 'Configuración',
    path: '/manual/02-configuracion',
    emoji: '⚙️',
    children: [
      { title: 'Localhost', path: '/manual/02-configuracion/localhost' },
      { title: 'Variables de Entorno', path: '/manual/02-configuracion/variables-entorno' },
      { title: 'Entornos', path: '/manual/02-configuracion/entornos' },
    ],
  },
  {
    title: 'Autenticación',
    path: '/manual/03-autenticacion',
    emoji: '🔐',
    children: [
      { title: 'Google OAuth Setup', path: '/manual/03-autenticacion/google-oauth-setup' },
      { title: 'OAuth2 para Emails', path: '/manual/03-autenticacion/oauth2-email' },
      { title: 'FAQ OAuth2', path: '/manual/03-autenticacion/faq-oauth2-modo-prueba' },
    ],
  },
  {
    title: 'Desarrollo',
    path: '/manual/04-desarrollo',
    emoji: '💻',
    children: [
      { title: 'Flujo de Trabajo', path: '/manual/04-desarrollo/flujo-trabajo' },
      { title: 'Sistema de Cache', path: '/manual/04-desarrollo/cache-system' },
      { title: 'Auditoría ABMs', path: '/manual/04-desarrollo/auditoria-abms' },
    ],
  },
  {
    title: 'Despliegue',
    path: '/manual/05-despliegue',
    emoji: '🚢',
    children: [
      { title: 'Vercel Setup', path: '/manual/05-despliegue/vercel-setup' },
      { title: 'Flujo Develop → Main', path: '/manual/05-despliegue/flujo-despliegue' },
      { title: 'Reiniciar Servidor', path: '/manual/05-despliegue/reiniciar-servidor' },
    ],
  },
  {
    title: 'Troubleshooting',
    path: '/manual/06-troubleshooting',
    emoji: '🔧',
    children: [
      { title: 'Error Email 535', path: '/manual/06-troubleshooting/error-email-535' },
      { title: 'Error Remitos', path: '/manual/06-troubleshooting/error-remitos' },
      { title: 'Error Handling', path: '/manual/06-troubleshooting/error-handling' },
    ],
  },
  {
    title: 'Referencia Técnica',
    path: '/manual/07-referencia-tecnica',
    emoji: '📚',
    children: [
      { title: 'Arquitectura', path: '/manual/07-referencia-tecnica/arquitectura' },
      { title: 'Navegación y Accesibilidad', path: '/manual/07-referencia-tecnica/navegacion-accesibilidad' },
      { title: 'Performance', path: '/manual/07-referencia-tecnica/performance' },
    ],
  },
];

export function ManualSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  // Cerrar sidebar en mobile al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Expandir sección activa automáticamente
  useEffect(() => {
    const activeSection = manualSections.find(section => 
      pathname.startsWith(section.path)
    );
    if (activeSection) {
      setExpandedSections(prev => new Set(prev).add(activeSection.path));
    }
  }, [pathname]);

  const toggleSection = (path: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-40
          w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          shadow-lg lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/manual"
              className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="w-5 h-5" />
              <span>Manual</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Link a Dashboard */}
          <Link
            href="/dashboard"
            className="mb-6 flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Home className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>

          {/* Navegación */}
          <nav className="space-y-1">
            {manualSections.map((section) => {
              const hasChildren = section.children && section.children.length > 0;
              const isExpanded = expandedSections.has(section.path);
              const sectionActive = isActive(section.path);

              return (
                <div key={section.path} className="manual-sidebar-section">
                  <div className="flex items-center">
                    {hasChildren ? (
                      <button
                        onClick={() => toggleSection(section.path)}
                        className={`
                          flex-1 flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg
                          transition-all duration-200
                          ${sectionActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        {section.emoji && <span className="text-base">{section.emoji}</span>}
                        <span className="flex-1 text-left">{section.title}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={section.path}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex-1 flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg
                          transition-all duration-200
                          ${sectionActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        {section.emoji && <span className="text-base">{section.emoji}</span>}
                        <span>{section.title}</span>
                      </Link>
                    )}
                  </div>

                  {/* Submenú */}
                  {hasChildren && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 animate-fade-in animate-slide-in-from-top">
                      {section.children?.map((child) => {
                        const childActive = isActive(child.path);
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            onClick={() => setIsOpen(false)}
                            className={`
                              block px-3 py-2 text-sm rounded-lg
                              transition-all duration-200
                              ${childActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }
                            `}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

