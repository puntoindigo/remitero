"use client";

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  className?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingOverlay({
  isLoading,
  message = 'Cargando...',
  progress,
  className = '',
  showProgress = false,
  size = 'md'
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="flex items-center justify-center">
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
          </div>
          
          {/* Message */}
          <div className="text-center">
            <p className="text-gray-900 font-medium">{message}</p>
          </div>
          
          {/* Progress Bar */}
          {showProgress && progress !== undefined && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
