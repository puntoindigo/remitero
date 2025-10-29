"use client";

import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] h-1"
      style={{
        background: 'linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8, #2563eb, #3b82f6)',
        backgroundSize: '200% 100%',
        animation: 'gradient-slide 1.5s ease infinite',
      }}
    >
      <style jsx>{`
        @keyframes gradient-slide {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}


