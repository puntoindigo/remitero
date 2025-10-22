"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

interface ProcessingResult {
  success: boolean;
  message: string;
  changes?: string[];
  errors?: string[];
  filesModified?: string[];
  codeChanges?: Array<{
    file: string;
    line: number;
    oldCode: string;
    newCode: string;
    description: string;
  }>;
}

interface AccordionFeedbackProps {
  feedbacks: FeedbackItem[];
  onProcessFeedback: (feedbackId: string) => void;
  onMarkCompleted: (feedbackId: string) => void;
  processingResults?: Map<string, ProcessingResult>;
}

export function AccordionFeedback({ 
  feedbacks, 
  onProcessFeedback, 
  onMarkCompleted,
  processingResults = new Map()
}: AccordionFeedbackProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  return (
    <div className="space-y-2">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className={`border-l-4 ${getPriorityColor(feedback.priority)} rounded-r-lg shadow-sm`}
        >
          {/* Header - Siempre visible */}
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleExpanded(feedback.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {expandedItems.has(feedback.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(feedback.status)}
                  <span className="font-medium text-gray-900">{feedback.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feedback.priority === 'high' ? 'bg-red-100 text-red-800' :
                    feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {feedback.priority}
                  </span>
                  <span className="text-xs text-gray-500">{feedback.category}</span>
                </div>
              </div>

              {/* Herramientas - Siempre visibles */}
              <div className="flex items-center space-x-2">
                {feedback.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProcessFeedback(feedback.id);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Play className="h-3 w-3" />
                    <span>Procesar</span>
                  </button>
                )}
                
                {feedback.status === 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkCompleted(feedback.id);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Completado</span>
                  </button>
                )}

                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  {feedback.tools.map((tool, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido expandible */}
          {expandedItems.has(feedback.id) && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="pt-4">
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Contenido del Feedback:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{feedback.content}</p>
                  </div>
                  
                  {/* Mostrar resultados del procesamiento */}
                  {processingResults.has(feedback.id) && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Resultados del Procesamiento:</h4>
                      {(() => {
                        const result = processingResults.get(feedback.id)!;
                        return (
                          <div className="space-y-3">
                            <div className={`p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              <strong>Estado:</strong> {result.message}
                            </div>
                            
                            {result.changes && result.changes.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Cambios Aplicados:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {result.changes.map((change, index) => (
                                    <li key={index} className="text-gray-700">{change}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.filesModified && result.filesModified.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Archivos Modificados:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {result.filesModified.map((file, index) => (
                                    <li key={index} className="text-blue-700 font-mono">{file}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.codeChanges && result.codeChanges.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Cambios de Código:</h5>
                                <div className="space-y-2">
                                  {result.codeChanges.map((change, index) => (
                                    <div key={index} className="bg-white p-3 rounded border">
                                      <div className="text-sm font-medium text-gray-900">{change.file}:{change.line}</div>
                                      <div className="text-xs text-gray-600 mb-2">{change.description}</div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <div className="font-medium text-red-600">Código Anterior:</div>
                                          <pre className="bg-red-50 p-2 rounded text-red-800 whitespace-pre-wrap">{change.oldCode}</pre>
                                        </div>
                                        <div>
                                          <div className="font-medium text-green-600">Código Nuevo:</div>
                                          <pre className="bg-green-50 p-2 rounded text-green-800 whitespace-pre-wrap">{change.newCode}</pre>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {result.errors && result.errors.length > 0 && (
                              <div>
                                <h5 className="font-medium text-red-900 mb-2">Errores:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {result.errors.map((error, index) => (
                                    <li key={index} className="text-red-700">{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Creado:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(feedback.createdAt).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Estado:</span>
                      <span className="ml-2 text-gray-600 capitalize">{feedback.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
