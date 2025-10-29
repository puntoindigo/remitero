"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingSpinner({ 
  message = "Cargando...", 
  size = "md", 
  centered = true,
  showProgress = false,
  progress = 0
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  const containerClasses = centered 
    ? "flex flex-col items-center justify-center min-h-[200px]"
    : "flex flex-col items-center justify-center py-8";

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-gray-200 ${sizeClasses[size]}`}></div>
        <div className={`animate-spin rounded-full border-4 border-blue-600 border-t-transparent absolute top-0 left-0 ${sizeClasses[size]}`}></div>
      </div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{message}</p>
      )}
      {showProgress && (
        <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
