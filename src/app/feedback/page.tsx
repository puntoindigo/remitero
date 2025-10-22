"use client";

import React, { useState, useEffect } from 'react';
import { AccordionFeedback } from '@/components/common/AccordionFeedback';
import { useFeedbackProcessor } from '@/hooks/useFeedbackProcessor';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  category: string;
  tools: string[];
}

// Datos de ejemplo - en producción vendrían de una API
const mockFeedbacks: FeedbackItem[] = [
  {
    id: '1',
    title: 'Error en desplegable de estados de remitos',
    content: 'El desplegable de estados no muestra los colores correctamente. Necesita implementar estilos CSS específicos para que se vea igual al de stock en productos.',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-10-21T14:30:00Z',
    category: 'UI/UX',
    tools: ['CSS', 'React', 'Tailwind']
  },
  {
    id: '2',
    title: 'Optimización de rendimiento en página de productos',
    content: 'La página de productos está muy lenta. Necesita implementar lazy loading y optimizaciones de webpack para reducir el tamaño del bundle.',
    status: 'pending',
    priority: 'medium',
    createdAt: '2025-10-21T14:25:00Z',
    category: 'Performance',
    tools: ['Next.js', 'Webpack', 'React.lazy']
  },
  {
    id: '3',
    title: 'Error de validación en formulario de clientes',
    content: 'El formulario de clientes no valida correctamente el email. Necesita agregar validación de formato de email y mostrar mensajes de error apropiados.',
    status: 'completed',
    priority: 'high',
    createdAt: '2025-10-21T14:20:00Z',
    category: 'Validation',
    tools: ['React Hook Form', 'Yup', 'Zod']
  },
  {
    id: '4',
    title: 'Implementar indicadores de loading consistentes',
    content: 'Reemplazar todos los textos "Cargando..." hardcodeados por el componente LoadingSpinner para mantener consistencia en la UI.',
    status: 'processing',
    priority: 'low',
    createdAt: '2025-10-21T14:15:00Z',
    category: 'UI/UX',
    tools: ['React', 'CSS', 'Components']
  }
];

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(mockFeedbacks);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  
  const {
    processFeedback,
    markCompleted,
    isProcessing,
    getResult
  } = useFeedbackProcessor();

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.status === filter;
  });

  const handleProcessFeedback = async (feedbackId: string) => {
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return;

    // Actualizar estado a processing
    setFeedbacks(prev => prev.map(f => 
      f.id === feedbackId ? { ...f, status: 'processing' as const } : f
    ));

    // Procesar el feedback
    const result = await processFeedback(feedbackId, feedback);
    
    // Actualizar estado según el resultado
    setFeedbacks(prev => prev.map(f => 
      f.id === feedbackId ? { 
        ...f, 
        status: result.success ? 'completed' as const : 'error' as const 
      } : f
    ));
  };

  const handleMarkCompleted = (feedbackId: string) => {
    markCompleted(feedbackId);
    setFeedbacks(prev => prev.map(f => 
      f.id === feedbackId ? { ...f, status: 'completed' as const } : f
    ));
  };

  const getStatusCounts = () => {
    return {
      completed: feedbacks.filter(f => f.status === 'completed').length,
      errors: feedbacks.filter(f => f.status === 'error').length,
      omitted: feedbacks.filter(f => f.status === 'pending' && f.priority === 'low').length,
      pending: feedbacks.filter(f => f.status === 'pending').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Feedback Pendientes
          </h1>
          <p className="text-gray-600">
            Analiza y resuelve automáticamente los feedbacks pendientes
          </p>
        </div>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">{counts.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Errores</p>
                <p className="text-2xl font-bold text-red-600">{counts.errors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Omitidos</p>
                <p className="text-2xl font-bold text-orange-600">{counts.omitted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-blue-600">{counts.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'processing', label: 'Procesando' },
              { key: 'completed', label: 'Completados' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de feedbacks */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Feedbacks {filter === 'all' ? '' : `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
            </h2>
            
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay feedbacks para mostrar</p>
              </div>
            ) : (
              <AccordionFeedback
                feedbacks={filteredFeedbacks}
                onProcessFeedback={handleProcessFeedback}
                onMarkCompleted={handleMarkCompleted}
              />
            )}
          </div>
        </div>

        {/* Información del procesamiento */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Información del procesamiento:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Los feedbacks duplicados se omiten automáticamente</li>
            <li>• Se validan los datos antes de aplicar cambios</li>
            <li>• El procesamiento automático analiza el código y aplica correcciones</li>
            <li>• Cada feedback se procesa de forma independiente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
