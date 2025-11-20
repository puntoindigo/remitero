"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { MarkdownContent } from '@/components/docs/MarkdownContent';

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
      setCurrentDocIndex(currentDocIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentDocIndex < documents.length - 1) {
      setCurrentDocIndex(currentDocIndex + 1);
    }
  };

  const handleSelectDocument = (index: number) => {
    setCurrentDocIndex(index);
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
              Documentación
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
              {currentDoc && (
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Copiar link al portapapeles"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              )}
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

        {/* Document Selector */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {loadingDocs ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Cargando documentos...</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {documents.map((doc, index) => (
                <button
                  key={index}
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
    </div>
  );
}

