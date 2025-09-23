"use client";

import React from 'react';

interface EnvironmentBannerProps {
  environment: 'development' | 'production' | 'preview';
}

export default function EnvironmentBanner({ environment }: EnvironmentBannerProps) {
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
    <div className={`environment-banner ${environment}`}>
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <span>{config.text}</span>
        <span className="text-xs opacity-75">
          {environment === 'development' ? 'Local' : 'Vercel'}
        </span>
      </div>
    </div>
  );
}
