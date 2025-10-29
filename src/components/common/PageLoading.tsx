"use client";

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface PageLoadingProps {
  message?: string;
  showProgress?: boolean;
  estimatedTime?: number; // en milisegundos
}

/**
 * Componente de loading específico para páginas con progreso estimado
 */
export function PageLoading({ 
  message = "Cargando datos...", 
  showProgress = true,
  estimatedTime = 2000 
}: PageLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (estimatedTime / 100); // Incremento cada 100ms
        const newProgress = prev + increment;
        
        if (newProgress >= 95) {
          clearInterval(interval);
          return 95; // No llegar al 100% hasta que realmente termine
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showProgress, estimatedTime]);

  return (
    <main className="main-content">
      <div className="form-section">
        <LoadingSpinner 
          message={message}
          size="lg"
          centered={true}
          showProgress={showProgress}
          progress={progress}
        />
      </div>
    </main>
  );
}
