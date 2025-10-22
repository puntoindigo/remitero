"use client";

import { useState, useCallback } from 'react';

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

export function useFeedbackProcessor() {
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Map<string, ProcessingResult>>(new Map());

  const analyzeFeedback = useCallback(async (feedback: FeedbackItem): Promise<ProcessingResult> => {
    try {
      // Llamar al API real para procesar el feedback
      const response = await fetch('/api/feedback/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId: feedback.id,
          feedback: feedback
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error al procesar feedback: ${error}`,
        changes: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        filesModified: [],
        codeChanges: []
      };
    }
  }, []);

  const processFeedback = useCallback(async (feedbackId: string, feedback: FeedbackItem) => {
    setProcessing(prev => new Set(prev).add(feedbackId));
    
    try {
      const result = await analyzeFeedback(feedback);
      setResults(prev => new Map(prev).set(feedbackId, result));
      
      // Aquí implementarías la lógica real de procesamiento
      // Por ejemplo, aplicar cambios al código, ejecutar comandos, etc.
      
      return result;
    } catch (error) {
      const errorResult: ProcessingResult = {
        success: false,
        message: `Error al procesar feedback: ${error}`,
        changes: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
      
      setResults(prev => new Map(prev).set(feedbackId, errorResult));
      return errorResult;
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedbackId);
        return newSet;
      });
    }
  }, [analyzeFeedback]);

  const markCompleted = useCallback((feedbackId: string) => {
    setResults(prev => {
      const newMap = new Map(prev);
      newMap.set(feedbackId, {
        success: true,
        message: 'Feedback marcado como completado',
        changes: [],
        errors: []
      });
      return newMap;
    });
  }, []);

  const isProcessing = useCallback((feedbackId: string) => {
    return processing.has(feedbackId);
  }, [processing]);

  const getResult = useCallback((feedbackId: string) => {
    return results.get(feedbackId);
  }, [results]);

  return {
    processFeedback,
    markCompleted,
    isProcessing,
    getResult,
    results,
    processing: Array.from(processing)
  };
}
