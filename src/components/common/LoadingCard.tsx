"use client";

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingCardProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingCard({
  isLoading,
  message = 'Cargando...',
  children,
  className = '',
  showSpinner = true,
  size = 'md'
}: LoadingCardProps) {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          {showSpinner && <LoadingSpinner message={message} size={size} />}
          {!showSpinner && (
            <div className="text-center">
              <p className="text-gray-600">{message}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
