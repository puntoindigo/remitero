"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronLeft, ChevronRight, Link as LinkIcon, Check, Trash2, Code, ExternalLink } from 'lucide-react';
import { MarkdownContent } from '@/components/docs/MarkdownContent';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import { useToast } from '@/hooks/useToast.js';

interface DocumentacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentInfo {
  name: string;
  path: string;
  title: string;
  modifiedAt?: string;
  isInDocs?: boolean;
}

export function DocumentacionModal({ isOpen, onClose }: DocumentacionModalProps) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<DocumentInfo | null>(null);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Cargar lista de documentos al abrir
  useEffect(() => {
    if (isOpen) {
      loadDocumentsList();
    }
  }, [isOpen]);

  // Cargar documento cuando cambia la lista o el índice
  useEffect(() => {
    if (documents.length > 0 && isOpen) {
      loadDocument(currentDocIndex);
    }
  }, [documents, currentDocIndex, isOpen]);

  const loadDocumentsList = async () => {
    setLoadingDocs(true);
    try {
      const response = await fetch('/api/docs/list');
      if (!response.ok) {
        throw new Error('No se pudo cargar la lista de documentos');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
      // El primer documento (índice 0) es siempre el más reciente
      setCurrentDocIndex(0);
    } catch (err) {
      console.error('Error cargando lista de documentos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadDocument = async (index: number) => {
    if (index < 0 || index >= documents.length) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const doc = documents[index];
      if (!doc) return;

      // Si es Commits, cargar como JSON y formatear
      if (doc.name === 'COMMITS') {
        const response = await fetch(doc.path);
        if (!response.ok) {
          throw new Error('No se pudo cargar los commits');
        }
        const data = await response.json();
        const commits = data.commits || [];
        
        // Formatear commits como markdown
        let markdown = '# Commits\n\n';
        
        if (commits.length === 0) {
          markdown += '⚠️ **Los commits no están disponibles en este entorno.**\n\n';
          markdown += 'Los commits solo están disponibles en desarrollo local.\n\n';
          markdown += 'En producción (Vercel), el acceso a git no está disponible por razones de seguridad.\n\n';
        } else {
          commits.forEach((commit: any, idx: number) => {
            const date = new Date(commit.date);
            const formattedDate = date.toLocaleString('es-AR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            
            markdown += `## Commit ${commits.length - idx}\n\n`;
            markdown += `**Fecha/Hora:** ${formattedDate}\n\n`;
            markdown += `**Hash:** \`${commit.hash.substring(0, 7)}\`\n\n`;
            markdown += `**Autor:** ${commit.author}\n\n`;
            markdown += `**Mensaje:** ${commit.message}\n\n`;
            
            // Extraer "qué hay que probar" si existe en el mensaje
            const probarMatch = commit.message.match(/probar[:\-]?\s*(.+)/i);
            if (probarMatch) {
              markdown += `**Qué probar:** ${probarMatch[1]}\n\n`;
            }
            
            markdown += '---\n\n';
          });
        }
        
        setContent(markdown);
      } else {
        const response = await fetch(doc.path);
        if (!response.ok) {
          throw new Error('No se pudo cargar el documento');
        }
        const text = await response.text();
        setContent(text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentDocIndex > 0) {
      handleSelectDocument(currentDocIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentDocIndex < documents.length - 1) {
      handleSelectDocument(currentDocIndex + 1);
    }
  };

  const handleSelectDocument = (index: number) => {
    setCurrentDocIndex(index);
    // Scroll horizontal automático para mostrar el tab seleccionado
    setTimeout(() => {
      const tabsContainer = document.querySelector('.document-tabs-container');
      const selectedTab = tabsContainer?.querySelector(`[data-tab-index="${index}"]`) as HTMLElement;
      if (selectedTab && tabsContainer) {
        const containerRect = tabsContainer.getBoundingClientRect();
        const tabRect = selectedTab.getBoundingClientRect();
        const scrollLeft = tabsContainer.scrollLeft;
        const tabLeft = tabRect.left - containerRect.left + scrollLeft;
        const tabRight = tabRect.right - containerRect.left + scrollLeft;
        const containerWidth = tabsContainer.clientWidth;
        
        // Si el tab está fuera de la vista, hacer scroll
        if (tabLeft < scrollLeft) {
          // Tab está a la izquierda, scroll hacia la izquierda
          tabsContainer.scrollTo({
            left: tabLeft - 16, // 16px de padding
            behavior: 'smooth'
          });
        } else if (tabRight > scrollLeft + containerWidth) {
          // Tab está a la derecha, scroll hacia la derecha
          tabsContainer.scrollTo({
            left: tabRight - containerWidth + 16, // 16px de padding
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  };

  const handleCopyLink = async () => {
    const currentDoc = documents[currentDocIndex];
    if (!currentDoc) return;

    const url = `${window.location.origin}${currentDoc.path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar link:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const currentDoc = documents[currentDocIndex];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Desarrollo y Documentación
            </h2>
            {currentDoc && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentDocIndex === 0 || loadingDocs}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Documento anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {currentDocIndex + 1} / {documents.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentDocIndex === documents.length - 1 || loadingDocs}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Documento siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                {currentDoc.modifiedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Modificado: {formatDate(currentDoc.modifiedAt)}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Módulo de Desarrollo */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3 mb-3">
            <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Módulo de Desarrollo
            </h3>
          </div>
          <div className="flex gap-3">
            <a
              href="/web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-900 dark:text-gray-100 font-medium shadow-sm"
            >
              <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Web</span>
            </a>
            <a
              href="/web2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-gray-900 dark:text-gray-100 font-medium shadow-sm"
            >
              <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Web2</span>
            </a>
          </div>
        </div>

        {/* Document Selector */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {loadingDocs ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Cargando documentos...</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 document-tabs-container" style={{ scrollBehavior: 'smooth' }}>
              {documents.map((doc, index) => (
                <button
                  key={index}
                  data-tab-index={index}
                  onClick={() => handleSelectDocument(index)}
                  className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all ${
                    currentDocIndex === index
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  title={doc.modifiedAt ? `Modificado: ${formatDate(doc.modifiedAt)}` : doc.title}
                >
                  <FileText className="h-4 w-4 inline mr-1.5" />
                  {doc.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción (copiar link y eliminar) - arriba del contenido */}
        {currentDoc && currentDoc.name !== 'COMMITS' && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-end gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Copiar link al portapapeles"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <LinkIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(currentDoc)}
              className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Eliminar documento"
            >
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          {loading || loadingDocs ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600 dark:text-gray-400">Cargando documento...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600 dark:text-red-400">Error: {error}</div>
            </div>
          ) : (
            <div className="max-w-none prose prose-gray dark:prose-invert max-w-none">
              <MarkdownContent content={content} />
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={async () => {
            if (!showDeleteConfirm) return;
            
            try {
              const response = await fetch(`/api/docs/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  name: showDeleteConfirm.name,
                  isInDocs: showDeleteConfirm.isInDocs 
                })
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar documento');
              }
              
              showSuccess('Documento eliminado correctamente');
              setShowDeleteConfirm(null);
              
              // Recargar lista de documentos
              await loadDocumentsList();
              
              // Si el documento eliminado era el actual, ir al primero
              if (currentDocIndex >= documents.length - 1) {
                setCurrentDocIndex(0);
              }
            } catch (err: any) {
              showError(err.message || 'Error al eliminar documento');
            }
          }}
          title="Eliminar Documento"
          message={`¿Estás seguro de que deseas eliminar "${showDeleteConfirm.title}"? Esta acción no se puede deshacer.`}
        />
      )}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[999999] flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

