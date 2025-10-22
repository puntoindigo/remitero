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

interface AccordionFeedbackProps {
  feedbacks: FeedbackItem[];
  onProcessFeedback: (feedbackId: string) => void;
  onMarkCompleted: (feedbackId: string) => void;
}

export function AccordionFeedback({ 
  feedbacks, 
  onProcessFeedback, 
  onMarkCompleted 
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
