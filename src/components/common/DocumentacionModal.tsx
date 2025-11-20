"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { MarkdownContent } from '@/components/docs/MarkdownContent';

interface DocumentacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentInfo {
  name: string;
  path: string;
  title: string;
}

const DOCUMENTOS: DocumentInfo[] = [
  { name: 'ESTADO_MVP_PRODUCCION.md', path: '/api/docs/estado-mvp', title: 'Estado del MVP para Producción' },
  { name: 'SISTEMA_COMPLETO.md', path: '/api/docs/sistema-completo', title: 'Sistema Completo' },
  { name: 'DIAGNOSTICO_VERSION_ANTIGUA_PRODUCCION.md', path: '/api/docs/diagnostico-version-antigua', title: 'Diagnóstico: Versión Antigua en Producción' },
  { name: 'CONFIGURAR_PRODUCTION_BRANCH.md', path: '/api/docs/configurar-production-branch', title: 'Configurar Production Branch' },
];

export function DocumentacionModal({ isOpen, onClose }: DocumentacionModalProps) {
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el último documento modificado al abrir
  useEffect(() => {
    if (isOpen) {
      // El primer documento es el último modificado (ESTADO_MVP_PRODUCCION.md)
      setCurrentDocIndex(0);
      loadDocument(0);
    }
  }, [isOpen]);

  const loadDocument = async (index: number) => {
    if (index < 0 || index >= DOCUMENTOS.length) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(DOCUMENTOS[index].path);
      if (!response.ok) {
        throw new Error('No se pudo cargar el documento');
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentDocIndex > 0) {
      const newIndex = currentDocIndex - 1;
      setCurrentDocIndex(newIndex);
      loadDocument(newIndex);
    }
  };

  const handleNext = () => {
    if (currentDocIndex < DOCUMENTOS.length - 1) {
      const newIndex = currentDocIndex + 1;
      setCurrentDocIndex(newIndex);
      loadDocument(newIndex);
    }
  };

  const handleSelectDocument = (index: number) => {
    setCurrentDocIndex(index);
    loadDocument(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Documentación
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentDocIndex === 0}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Documento anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentDocIndex + 1} / {DOCUMENTOS.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentDocIndex === DOCUMENTOS.length - 1}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Documento siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Document Selector */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2 overflow-x-auto">
            {DOCUMENTOS.map((doc, index) => (
              <button
                key={index}
                onClick={() => handleSelectDocument(index)}
                className={`px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
                  currentDocIndex === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-1" />
                {doc.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600 dark:text-gray-400">Cargando documento...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600 dark:text-red-400">Error: {error}</div>
            </div>
          ) : (
            <div className="max-w-none">
              <MarkdownContent content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

