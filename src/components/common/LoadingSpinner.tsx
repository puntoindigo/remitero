"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

export function LoadingSpinner({ 
  message = "Cargando...", 
  size = "md", 
  centered = true 
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
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
}
