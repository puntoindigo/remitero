"use client";

import React, { useEffect, useRef } from 'react';

interface EnvironmentBannerProps {
  environment: 'development' | 'production' | 'preview';
}

export default function EnvironmentBanner({ environment }: EnvironmentBannerProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = card.offsetLeft;
      initialY = card.offsetTop;
      card.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      // Limitar movimiento dentro de la ventana
      const maxX = window.innerWidth - card.offsetWidth;
      const maxY = window.innerHeight - card.offsetHeight;
      
      card.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
      card.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
      card.style.right = 'auto';
      card.style.bottom = 'auto';
    };

    const handleMouseUp = () => {
      isDragging = false;
      card.style.cursor = 'move';
    };

    card.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      card.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [environment]);
  // Solo mostrar en entornos que no sean producción
  if (environment === 'production') {
    return null;
  }

  const getBannerConfig = () => {
    switch (environment) {
      case 'development':
        return {
          text: 'DESARROLLO',
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          icon: '🔧'
        };
      case 'preview':
        return {
          text: 'PREVIEW - BRANCH DEVELOP',
          bgColor: 'bg-orange-600',
          textColor: 'text-white',
          icon: '🚧'
        };
      default:
        return {
          text: 'ENTORNO DE PRUEBA',
          bgColor: 'bg-yellow-600',
          textColor: 'text-white',
          icon: '⚠️'
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div ref={cardRef} className={`environment-card ${environment}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{config.icon}</span>
        <div className="flex flex-col">
          <span className="text-xs font-medium">{config.text}</span>
          <span className="text-xs opacity-75">
            {environment === 'development' ? 'Local' : 'Vercel'}
          </span>
        </div>
      </div>
      
      {/* Credenciales de demostración solo en preview */}
      {environment === 'preview' && (
        <div className="mt-2 text-xs opacity-90">
          <div className="space-y-1">
            <div><strong>SuperAdmin:</strong> admin@remitero.com / daedae123</div>
            <div><strong>Admin:</strong> admin@empresademo.com / admin123</div>
          </div>
        </div>
      )}
    </div>
  );
}
